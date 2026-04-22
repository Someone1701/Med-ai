import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { toast } from "sonner";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useLocalAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-card/95 backdrop-blur-md shadow-sm">
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-foreground hover:text-primary transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="text-2xl font-bold text-foreground">
            🤖 MediBot AI
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground/80 hover:text-primary font-medium transition-colors">Home</Link>
          {user && (
            <>
              {user.role === "patient" && (
                <Link to="/patient" className="text-foreground/80 hover:text-primary font-medium transition-colors">Patient</Link>
              )}
              {user.role === "caretaker" && (
                <>
                  <Link to="/caretaker" className="text-foreground/80 hover:text-primary font-medium transition-colors">Caretaker</Link>
                  <Link to="/reminders" className="text-foreground/80 hover:text-primary font-medium transition-colors">Reminders</Link>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden md:block text-sm font-medium text-muted-foreground">
                {user.displayName}
                <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{user.role}</span>
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-1" /> Sign Out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/patient-login">
                <Button variant="outline" size="sm">Patient Login</Button>
              </Link>
              <Link to="/caretaker-login">
                <Button variant="default" size="sm">Caretaker Login</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-foreground/50 z-40" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-0 left-0 w-72 h-full bg-card z-50 shadow-xl">
            <div className="gradient-primary p-6 flex justify-between items-center">
              <h3 className="text-primary-foreground font-bold text-lg">Dashboard</h3>
              <button onClick={() => setMenuOpen(false)} className="text-primary-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-foreground transition-colors">Home</Link>
              {user ? (
                <>
                  {user.role === "patient" && (
                    <Link to="/patient" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-foreground transition-colors">Patient Form</Link>
                  )}
                  {user.role === "caretaker" && (
                    <>
                      <Link to="/caretaker" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-foreground transition-colors">Caretaker</Link>
                      <Link to="/reminders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-foreground transition-colors">Reminders</Link>
                    </>
                  )}
                  <button onClick={() => { setMenuOpen(false); handleSignOut(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors w-full text-left">
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/patient-login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-foreground transition-colors">Patient Login</Link>
                  <Link to="/caretaker-login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent text-foreground transition-colors">Caretaker Login</Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
