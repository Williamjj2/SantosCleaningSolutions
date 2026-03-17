import { Users, Shield, Leaf, RotateCcw } from "lucide-react";

export function WhyUs() {
  const reasons = [
    {
      title: "Same Team Every Visit",
      desc: "You'll see the same trusted faces every time. They know your home and your preferences perfectly.",
      icon: <Users className="w-8 h-8 text-blue-400" />
    },
    {
      title: "Fully Licensed & Insured",
      desc: "Complete peace of mind with our comprehensive $1M liability coverage.",
      icon: <Shield className="w-8 h-8 text-blue-400" />
    },
    {
      title: "Eco-Friendly Products",
      desc: "Safe for kids, pets, and the planet. We avoid harsh chemicals without compromising on cleanliness.",
      icon: <Leaf className="w-8 h-8 text-blue-400" />
    },
    {
      title: "24-Hour Guarantee",
      desc: "Not 100% satisfied? Let us know within 24 hours and we'll come back and fix it for free.",
      icon: <RotateCcw className="w-8 h-8 text-blue-400" />
    }
  ];

  return (
    <section id="why-us" className="py-24 bg-[#030303] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display text-white mb-4">Meet Your Cleaning Team</h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            At Santos Cleaning, every team member is treated like family – and we treat your home the same way. That's the difference when you choose a family-owned business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, i) => (
            <div 
              key={i} 
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="mb-6">{reason.icon}</div>
              <h3 className="text-xl font-medium text-white mb-3">{reason.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{reason.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
