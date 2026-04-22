const Footer = () => (
  <footer className="bg-foreground text-background py-16">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="text-primary font-bold text-lg mb-3">MediBot AI</h3>
          <p className="text-background/60 text-sm">Revolutionizing healthcare with AI-powered assistance and personalized medical guidance.</p>
        </div>
        <div>
          <h3 className="text-primary font-bold mb-3">Services</h3>
          <ul className="space-y-2 text-background/60 text-sm">
            <li>AI Health Assistant</li>
            <li>Telehealth Consultations</li>
            <li>Health Monitoring</li>
            <li>Prescription Services</li>
          </ul>
        </div>
        <div>
          <h3 className="text-primary font-bold mb-3">Company</h3>
          <ul className="space-y-2 text-background/60 text-sm">
            <li>About Us</li>
            <li>Our Mission</li>
            <li>Careers</li>
            <li>Press</li>
          </ul>
        </div>
        <div>
          <h3 className="text-primary font-bold mb-3">Support</h3>
          <ul className="space-y-2 text-background/60 text-sm">
            <li>Help Center</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Contact Us</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/20 mt-10 pt-6 text-center text-background/50 text-sm">
        &copy; 2025 MediBot AI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
