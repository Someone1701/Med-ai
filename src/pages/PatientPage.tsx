import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatPopup from "@/components/ChatPopup";
import { supabase } from "@/integrations/supabase/client";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { toast } from "sonner";
import { savePatientData, loadPatientData } from "@/lib/userDataStore";

const MEAL_SLOTS = [
  { value: "before_breakfast", label: "Before Breakfast", icon: "🌅", sub: "Early morning, before eating" },
  { value: "after_breakfast", label: "After Breakfast", icon: "☀️", sub: "Morning, after eating" },
  { value: "lunch", label: "Lunch", icon: "🍱", sub: "Afternoon meal" },
  { value: "dinner", label: "Dinner", icon: "🌙", sub: "Evening meal" },
];

type Medicine = {
  name: string;
  type: string;
  dosesPerDay: number;
  mealSlots: string[];
};

const PatientPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useLocalAuth();
  const [step, setStep] = useState(1);
  const [patientData, setPatientData] = useState({ name: "", age: "", gender: "" });
  const [medicineCount, setMedicineCount] = useState(1);
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: "", type: "", dosesPerDay: 0, mealSlots: [] }]);
  const [submitting, setSubmitting] = useState(false);

  // Check if user already has saved data - redirect to reminders
  useEffect(() => {
    if (!loading && user?.email) {
      const existing = loadPatientData(user.email);
      if (existing) {
        navigate(`/reminders?patientId=${existing.patientId}`, { replace: true });
      }
    }
  }, [user, loading]);

  if (!loading && (!user || user.role !== "patient")) return <Navigate to="/patient-login" replace />;

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientData.name || !patientData.age || !patientData.gender) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep(2);
  };

  const updateMedicineCount = (count: number) => {
    setMedicineCount(count);
    const newMeds = Array.from({ length: count }, (_, i) => medicines[i] || { name: "", type: "", dosesPerDay: 0, mealSlots: [] });
    setMedicines(newMeds);
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string | number | string[]) => {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const toggleMealSlot = (medIndex: number, slot: string) => {
    const med = medicines[medIndex];
    const selected = med.mealSlots.includes(slot) ? med.mealSlots.filter((s) => s !== slot) : [...med.mealSlots, slot];
    if (selected.length <= med.dosesPerDay) {
      updateMedicine(medIndex, "mealSlots", selected);
    } else {
      toast.error(`You can select up to ${med.dosesPerDay} meal times`);
    }
  };

  const handleFinalSubmit = async () => {
    const allComplete = medicines.every((m) => m.name && m.type && m.dosesPerDay > 0 && m.mealSlots.length === m.dosesPerDay);
    if (!allComplete) {
      toast.error("Please complete all medicine information");
      return;
    }

    setSubmitting(true);
    try {
      // Insert patient
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .insert({ name: patientData.name, age: parseInt(patientData.age), gender: patientData.gender })
        .select()
        .single();

      if (patientError) throw patientError;

      // Insert medicines
      const medsToInsert = medicines.map((m) => ({
        patient_id: patient.id,
        name: m.name,
        medicine_type: m.type,
        doses_per_day: m.dosesPerDay,
        meal_slots: m.mealSlots,
      }));

      const { data: savedMeds, error: medError } = await supabase.from("medicines").insert(medsToInsert).select();
      if (medError) throw medError;

      // Save to localStorage for session persistence
      if (user?.email) {
        savePatientData(user.email, {
          patientId: patient.id,
          patientName: patientData.name,
          patientAge: parseInt(patientData.age),
          patientGender: patientData.gender,
          medicines: (savedMeds || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            medicine_type: m.medicine_type,
            doses_per_day: m.doses_per_day,
            meal_slots: m.meal_slots,
          })),
        });
      }

      toast.success("Patient & medicine data saved successfully!");
      navigate(`/reminders?patientId=${patient.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save data");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = medicines.length > 0
    ? (medicines.filter((m) => m.name && m.type && m.dosesPerDay > 0 && m.mealSlots.length === m.dosesPerDay).length / medicines.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Step indicator */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-primary-foreground text-sm ${
                step === s ? "gradient-primary" : step > s ? "gradient-success" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? "✓" : s}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 relative overflow-hidden animate-fade-in-up">
              <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
              <div className="text-center mb-8">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🩺</div>
                <h1 className="text-3xl font-extrabold gradient-text">Patient Details</h1>
                <p className="text-muted-foreground mt-1">Please provide your information</p>
              </div>
              <form onSubmit={handlePatientSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name <span className="text-destructive">*</span></label>
                  <input
                    type="text" value={patientData.name} onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all"
                    placeholder="Enter your full name" required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Age <span className="text-destructive">*</span></label>
                    <input
                      type="number" value={patientData.age} onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all"
                      placeholder="Age" min="1" max="120" required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Gender <span className="text-destructive">*</span></label>
                    <select
                      value={patientData.gender} onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all" required
                    >
                      <option value="">Select</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full gradient-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-lg hover:-translate-y-0.5 transition-all">
                  Next → Medicine Schedule
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
                <div className="text-center mb-6">
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">💊</div>
                  <h1 className="text-3xl font-extrabold gradient-text">Medicine Schedule</h1>
                  <p className="text-muted-foreground mt-1">Patient: {patientData.name}</p>
                </div>

                {/* Progress bar */}
                <div className="bg-muted rounded-lg p-1.5 mb-6">
                  <div className="h-2 gradient-success rounded transition-all" style={{ width: `${progress}%` }} />
                  <p className="text-center text-sm text-muted-foreground font-semibold mt-1">{Math.round(progress)}% Complete</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Number of medicines</label>
                  <input
                    type="number" value={medicineCount} onChange={(e) => updateMedicineCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all"
                    min="1" max="10"
                  />
                </div>

                {medicines.map((med, i) => (
                  <div key={i} className="border-2 border-border rounded-2xl p-5 mb-5 hover:border-primary transition-colors">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                      <div className="w-9 h-9 gradient-info rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">{i + 1}</div>
                      <h3 className="font-bold text-foreground">Medicine {i + 1}</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">Medicine Name <span className="text-destructive">*</span></label>
                        <input
                          type="text" value={med.name} onChange={(e) => updateMedicine(i, "name", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all"
                          placeholder="Enter medicine name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-1">Type <span className="text-destructive">*</span></label>
                          <select
                            value={med.type} onChange={(e) => updateMedicine(i, "type", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all"
                          >
                            <option value="">Select</option>
                            <option value="tablet">Tablet</option>
                            <option value="syrup">Syrup</option>
                            <option value="capsule">Capsule</option>
                            <option value="injection">Injection</option>
                            <option value="drops">Drops</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-1">Doses/Day <span className="text-destructive">*</span></label>
                          <select
                            value={med.dosesPerDay} onChange={(e) => updateMedicine(i, "dosesPerDay", parseInt(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all"
                          >
                            <option value="0">Select</option>
                            {[1, 2, 3, 4].map((d) => <option key={d} value={d}>{d} dose{d > 1 ? "s" : ""}/day</option>)}
                          </select>
                        </div>
                      </div>

                      {med.dosesPerDay > 0 && (
                        <div className="bg-muted rounded-xl p-4 border border-border">
                          <h4 className="font-semibold text-foreground text-sm mb-3">
                            🍽️ Select Meal Times <span className="text-muted-foreground font-normal">(select {med.dosesPerDay})</span>
                          </h4>
                          <div className="space-y-2">
                            {MEAL_SLOTS.map((slot) => {
                              const selected = med.mealSlots.includes(slot.value);
                              return (
                                <label
                                  key={slot.value}
                                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    selected ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/50"
                                  }`}
                                >
                                  <input
                                    type="checkbox" checked={selected} onChange={() => toggleMealSlot(i, slot.value)}
                                    className="w-5 h-5 accent-primary"
                                  />
                                  <span className="text-xl">{slot.icon}</span>
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

                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="w-full gradient-success text-primary-foreground py-4 rounded-xl font-bold text-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "✅ Save Patient & Medicine Data"}
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

export default PatientPage;
