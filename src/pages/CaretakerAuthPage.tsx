import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { toast } from "sonner";

const CaretakerAuthPage = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useLocalAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  if (user?.role === "caretaker") return <Navigate to="/caretaker" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const err = signIn(email, password, "caretaker");
        if (err) { toast.error(err); return; }
        toast.success("Welcome back!");
        navigate("/caretaker");
      } else {
        if (!displayName.trim()) { toast.error("Please enter your name"); return; }
        const err = signUp(email, password, displayName, "caretaker");
        if (err) { toast.error(err); return; }
        toast.success("Account created! You're now signed in.");
        navigate("/caretaker");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 gradient-primary" />
            <div className="text-center mb-8">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">👨‍⚕️</div>
              <h1 className="text-3xl font-extrabold gradient-text">Caretaker {isLogin ? "Login" : "Sign Up"}</h1>
              <p className="text-muted-foreground mt-1">
                {isLogin ? "Sign in to manage your patients" : "Create an account to track patient care"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                  <input
                    type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all"
                    placeholder="Your full name" required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all"
                  placeholder="you@example.com" required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-muted text-foreground focus:border-primary focus:bg-card outline-none transition-all"
                  placeholder="Min 6 characters" minLength={6} required
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full gradient-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="text-center mt-6">
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CaretakerAuthPage;
