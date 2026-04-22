import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => (
  <section className="gradient-primary pt-32 pb-20 text-center relative overflow-hidden">
    <div className="max-w-4xl mx-auto px-6 relative z-10">
      <div className="flex justify-center gap-0 mb-6">
        {["👨‍⚕️", "👩‍⚕️", "🤖", "👨‍⚕️", "👩‍⚕️"].map((emoji, i) => (
          <div
            key={i}
            className="-ml-2.5 first:ml-0 w-14 h-14 rounded-full border-4 border-primary-foreground flex items-center justify-center text-2xl bg-gradient-to-br from-destructive/50 to-accent/50 hover:scale-110 hover:-translate-y-1 transition-transform cursor-default"
          >
            {emoji}
          </div>
        ))}
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold text-primary-foreground mb-4 leading-tight">
        Hi, I'm MediBot
      </h1>
      <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-2">
        Your AI healthcare assistant — trained by leading medical professionals with the latest healthcare data. Get expert guidance 24/7.
      </p>
      <p className="text-base text-primary-foreground/80 max-w-xl mx-auto mb-10">
        Connect instantly with licensed healthcare providers for prescriptions and specialized care.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link to="/patient">
          <Button variant="heroPrimary" size="lg" className="px-8 py-6 text-lg">
            🩺 PATIENT
          </Button>
        </Link>
        <Link to="/caretaker">
          <Button variant="heroOutline" size="lg" className="px-8 py-6 text-lg">
            🤝 CARETAKER
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default HeroSection;
