import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatPopup from "@/components/ChatPopup";
import { supabase } from "@/integrations/supabase/client";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { toast } from "sonner";
import { saveCaretakerData, loadCaretakerData } from "@/lib/userDataStore";

const MEAL_SLOTS = [
  { value: "before_breakfast", label: "Before Breakfast", icon: "🌅", sub: "Early morning" },
  { value: "after_breakfast", label: "After Breakfast", icon: "☀️", sub: "Morning" },
  { value: "lunch", label: "Lunch", icon: "🍱", sub: "Afternoon" },
  { value: "dinner", label: "Dinner", icon: "🌙", sub: "Evening" },
];

type PatientInfo = { name: string; age: string; gender: string; condition: string; medicineCount: number };
type Medicine = { name: string; type: string; dosesPerDay: number; mealSlots: string[] };

const CaretakerPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useLocalAuth();
  const [step, setStep] = useState(1);
  const [caretaker, setCaretaker] = useState({ name: "", age: "", gender: "", phone: "", email: "", patientCount: 1 });
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [patientMedicines, setPatientMedicines] = useState<Medicine[][]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Check for existing saved data - redirect to reminders
  useEffect(() => {
    if (!loading && user?.email) {
      const existing = loadCaretakerData(user.email);
      if (existing) {
        navigate(`/reminders?caretakerId=${existing.caretakerId}`, { replace: true });
      }
    }
  }, [user, loading]);

  if (!loading && (!user || user.role !== "caretaker")) return <Navigate to="/caretaker-login" replace />;

  // Step 1: Caretaker info
  const handleCaretakerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caretaker.name || !caretaker.age || !caretaker.gender) {
      toast.error("Please fill required fields");
      return;
    }
    const count = caretaker.patientCount;
    setPatients(Array.from({ length: count }, () => ({ name: "", age: "", gender: "", condition: "", medicineCount: 1 })));
    setStep(2);
  };

  // Step 2: Patient info
  const updatePatient = (idx: number, field: keyof PatientInfo, value: string | number) => {
    setPatients((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const handlePatientsSubmit = () => {
    const allValid = patients.every((p) => p.name && p.age && p.gender);
    if (!allValid) {
      toast.error("Please complete all patient information");
      return;
    }
    setPatientMedicines(patients.map((p) => Array.from({ length: p.medicineCount }, () => ({ name: "", type: "", dosesPerDay: 0, mealSlots: [] }))));
    setStep(3);
  };

  const updateMedicine = (pIdx: number, mIdx: number, field: keyof Medicine, value: string | number | string[]) => {
    setPatientMedicines((prev) => prev.map((meds, pi) =>
      pi === pIdx ? meds.map((m, mi) => (mi === mIdx ? { ...m, [field]: value } : m)) : meds
    ));
  };

  const toggleMealSlot = (pIdx: number, mIdx: number, slot: string) => {
    const med = patientMedicines[pIdx][mIdx];
    const selected = med.mealSlots.includes(slot) ? med.mealSlots.filter((s) => s !== slot) : [...med.mealSlots, slot];
    if (selected.length <= med.dosesPerDay) {
      updateMedicine(pIdx, mIdx, "mealSlots", selected);
    } else {
      toast.error(`Max ${med.dosesPerDay} meal times`);
    }
  };

  const handleFinalSubmit = async () => {
    const allComplete = patientMedicines.every((meds) =>
      meds.every((m) => m.name && m.type && m.dosesPerDay > 0 && m.mealSlots.length === m.dosesPerDay)
    );
    if (!allComplete) {
      toast.error("Please complete all medicine data");
      return;
    }

    setSubmitting(true);
    try {
      // Insert caretaker
      const { data: ct, error: ctErr } = await supabase
        .from("caretakers")
        .insert({ name: caretaker.name, age: parseInt(caretaker.age), gender: caretaker.gender, phone: caretaker.phone || null, email: caretaker.email || null, patient_count: caretaker.patientCount })
        .select()
        .single();
      if (ctErr) throw ctErr;

      // Insert patients + medicines
      const savedPatients: any[] = [];
      for (let pi = 0; pi < patients.length; pi++) {
        const p = patients[pi];
        const { data: pt, error: ptErr } = await supabase
          .from("patients")
          .insert({ caretaker_id: ct.id, name: p.name, age: parseInt(p.age), gender: p.gender, medical_condition: p.condition || null })
          .select()
          .single();
        if (ptErr) throw ptErr;

        const medsToInsert = patientMedicines[pi].map((m) => ({
          patient_id: pt.id,
          name: m.name,
          medicine_type: m.type,
          doses_per_day: m.dosesPerDay,
          meal_slots: m.mealSlots,
        }));
        const { data: savedMeds, error: medErr } = await supabase.from("medicines").insert(medsToInsert).select();
        if (medErr) throw medErr;

        savedPatients.push({
          patientId: pt.id,
          patientName: p.name,
          patientAge: parseInt(p.age),
          patientGender: p.gender,
          medicines: (savedMeds || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            medicine_type: m.medicine_type,
            doses_per_day: m.doses_per_day,
            meal_slots: m.meal_slots,
          })),
        });
      }

      // Save to localStorage for session persistence
      if (user?.email) {
        saveCaretakerData(user.email, {
          caretakerId: ct.id,
          caretakerName: caretaker.name,
          caretakerAge: parseInt(caretaker.age),
          caretakerGender: caretaker.gender,
          caretakerPhone: caretaker.phone || null,
          caretakerEmail: caretaker.email || null,
          patients: savedPatients,
        });
      }

      toast.success("All data saved successfully!");
      navigate(`/reminders?caretakerId=${ct.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const totalMeds = patientMedicines.flat().length;
  const completedMeds = patientMedicines.flat().filter((m) => m.name && m.type && m.dosesPerDay > 0 && m.mealSlots.length === m.dosesPerDay).length;
  const progress = totalMeds > 0 ? (completedMeds / totalMeds) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Step indicator */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step === s ? "gradient-primary text-primary-foreground" : step > s ? "gradient-success text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? "✓" : s}
              </div>
            ))}
          </div>

          {/* Step 1: Caretaker */}
          {step === 1 && (
            <div className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 relative overflow-hidden animate-fade-in-up">
              <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
              <div className="text-center mb-8">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">👨‍⚕️</div>
                <h1 className="text-3xl font-extrabold gradient-text">Caretaker Information</h1>
                <p className="text-muted-foreground mt-1">Step 1: Your basic information</p>
              </div>
              <form onSubmit={handleCaretakerSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name <span className="text-destructive">*</span></label>
                    <input value={caretaker.name} onChange={(e) => setCaretaker({ ...caretaker, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all" placeholder="Full name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Age <span className="text-destructive">*</span></label>
                    <input type="number" value={caretaker.age} onChange={(e) => setCaretaker({ ...caretaker, age: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all" placeholder="Age" min="1" max="120" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Gender <span className="text-destructive">*</span></label>
                    <select value={caretaker.gender} onChange={(e) => setCaretaker({ ...caretaker, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all" required>
                      <option value="">Select</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Phone</label>
                    <input value={caretaker.phone} onChange={(e) => setCaretaker({ ...caretaker, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all" placeholder="Phone number" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                  <input type="email" value={caretaker.email} onChange={(e) => setCaretaker({ ...caretaker, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all" placeholder="Email address" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Number of Patients <span className="text-destructive">*</span></label>
                  <select value={caretaker.patientCount} onChange={(e) => setCaretaker({ ...caretaker, patientCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all">
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full gradient-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-lg hover:-translate-y-0.5 transition-all">
                  Continue to Patient Info →
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Patients */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
                <div className="text-center mb-6">
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">👥</div>
                  <h1 className="text-3xl font-extrabold gradient-text">Patient Information</h1>
                  <p className="text-muted-foreground mt-1">Step 2: Enter details for each patient</p>
                </div>

                {patients.map((p, i) => (
                  <div key={i} className="border-l-4 border-primary bg-card rounded-2xl p-6 mb-5 shadow-[var(--shadow-card)]">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                      <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">{i + 1}</div>
                      <h2 className="text-lg font-bold text-foreground">Patient {i + 1}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">Name <span className="text-destructive">*</span></label>
                        <input value={p.name} onChange={(e) => updatePatient(i, "name", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all" placeholder="Patient name" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">Age <span className="text-destructive">*</span></label>
                        <input type="number" value={p.age} onChange={(e) => updatePatient(i, "age", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all" placeholder="Age" min="1" max="120" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">Gender <span className="text-destructive">*</span></label>
                        <select value={p.gender} onChange={(e) => updatePatient(i, "gender", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all">
                          <option value="">Select</option>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">Condition</label>
                        <input value={p.condition} onChange={(e) => updatePatient(i, "condition", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all" placeholder="Optional" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1">Number of Medicines</label>
                      <select value={p.medicineCount} onChange={(e) => updatePatient(i, "medicineCount", parseInt(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                ))}

                <button onClick={handlePatientsSubmit}
                  className="w-full gradient-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-lg hover:-translate-y-0.5 transition-all">
                  Continue to Medicine Management →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Medicines */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
                <div className="text-center mb-6">
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">💊</div>
                  <h1 className="text-3xl font-extrabold gradient-text">Medicine Management</h1>
                  <p className="text-muted-foreground mt-1">Step 3: Configure medicines for each patient</p>
                </div>

                <div className="bg-muted rounded-lg p-1.5 mb-6">
                  <div className="h-2 gradient-success rounded transition-all" style={{ width: `${progress}%` }} />
                  <p className="text-center text-sm text-muted-foreground font-semibold mt-1">
                    {Math.round(progress)}% Complete ({completedMeds}/{totalMeds} medicines)
                  </p>
                </div>

                {patients.map((patient, pi) => (
                  <div key={pi} className="border-l-4 border-primary bg-card rounded-2xl p-6 mb-6 shadow-[var(--shadow-card)]">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                      <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">{pi + 1}</div>
                      <div>
                        <h2 className="font-bold text-foreground">{patient.name} - Medicine Management</h2>
                        <p className="text-sm text-muted-foreground">Age: {patient.age} | {patient.medicineCount} medicines</p>
                      </div>
                    </div>

                    {patientMedicines[pi]?.map((med, mi) => (
                      <div key={mi} className="border-2 border-border rounded-2xl p-5 mb-4 hover:border-primary transition-colors">
                        <div className="flex items-center gap-3 mb-3 pb-2 border-b border-border">
                          <div className="w-8 h-8 gradient-info rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">{mi + 1}</div>
                          <h3 className="font-bold text-foreground text-sm">Medicine {mi + 1}</h3>
                        </div>
                        <div className="space-y-3">
                          <input value={med.name} onChange={(e) => updateMedicine(pi, mi, "name", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all" placeholder="Medicine name" />
                          <div className="grid grid-cols-2 gap-3">
                            <select value={med.type} onChange={(e) => updateMedicine(pi, mi, "type", e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all">
                              <option value="">Type</option>
                              <option value="tablet">Tablet</option>
                              <option value="syrup">Syrup</option>
                              <option value="capsule">Capsule</option>
                              <option value="injection">Injection</option>
                              <option value="drops">Drops</option>
                            </select>
                            <select value={med.dosesPerDay} onChange={(e) => updateMedicine(pi, mi, "dosesPerDay", parseInt(e.target.value))}
                              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all">
                              <option value="0">Doses/day</option>
                              {[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          {med.dosesPerDay > 0 && (
                            <div className="bg-muted rounded-xl p-4 border border-border">
                              <h4 className="font-semibold text-foreground text-sm mb-2">🍽️ Meal Times (select {med.dosesPerDay})</h4>
                              <div className="space-y-2">
                                {MEAL_SLOTS.map((slot) => {
                                  const selected = med.mealSlots.includes(slot.value);
                                  return (
                                    <label key={slot.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selected ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/50"}`}>
                                      <input type="checkbox" checked={selected} onChange={() => toggleMealSlot(pi, mi, slot.value)} className="w-4 h-4 accent-primary" />
                                      <span className="text-lg">{slot.icon}</span>
                                      <div>
                                        <div className="font-semibold text-foreground text-sm">{slot.label}</div>
                                        <div className="text-xs text-muted-foreground">{slot.sub}</div>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                <button onClick={handleFinalSubmit} disabled={submitting}
                  className="w-full gradient-success text-primary-foreground py-4 rounded-xl font-bold text-lg hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {submitting ? "Saving to Database..." : "✅ Save All Patient & Medicine Data"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ChatPopup />
    </div>
  );
};

export default CaretakerPage;
