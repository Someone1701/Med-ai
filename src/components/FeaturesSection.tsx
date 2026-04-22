import { Brain, Clock, Video, Shield, Heart, Banknote } from "lucide-react";

const features = [
  { icon: Brain, title: "AI-Powered Insights", desc: "Advanced AI trained on the latest medical research, providing accurate, up-to-date health information." },
  { icon: Clock, title: "24/7 Availability", desc: "Get instant access to healthcare guidance anytime, anywhere. No appointments needed." },
  { icon: Video, title: "Telehealth Integration", desc: "Seamlessly connect with licensed healthcare providers for video consultations." },
  { icon: Shield, title: "Privacy & Security", desc: "Enterprise-grade security and full HIPAA compliance. Your privacy is our top priority." },
  { icon: Heart, title: "Personalized Care", desc: "Tailored health recommendations based on your medical history and personal health goals." },
  { icon: Banknote, title: "Insurance Accepted", desc: "We work with major insurance providers to make quality healthcare accessible and affordable." },
];

const FeaturesSection = () => (
  <section className="py-24 bg-background">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-4xl md:text-5xl font-extrabold text-center gradient-text mb-3">
        Why Choose MediBot?
      </h2>
      <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-16">
        Advanced AI technology meets compassionate healthcare to provide you with the best possible medical guidance.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-card p-8 rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 gradient-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6">
              <f.icon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground mb-3">{f.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
