import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Droplets, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Services() {
  const services = [
    {
      title: "Regular Cleaning",
      price: "90",
      desc: "Weekly or bi-weekly maintenance. Same trusted team every visit, flexible scheduling.",
      icon: <Sparkles className="w-6 h-6 text-blue-400" />,
      features: [
        "All rooms dusted & vacuumed",
        "Kitchens & bathrooms sanitized",
        "Floors mopped & polished",
        "Trash emptied"
      ]
    },
    {
      title: "Deep Cleaning",
      price: "280",
      desc: "Top-to-bottom thorough cleaning. Perfect for first visits, special occasions.",
      icon: <Droplets className="w-6 h-6 text-blue-400" />,
      highlight: true,
      features: [
        "Everything in regular cleaning",
        "Inside cabinets & appliances",
        "Baseboards & light fixtures",
        "Behind & under furniture"
      ]
    },
    {
      title: "Move In/Out",
      price: "290",
      desc: "Get your full deposit back. Landlord-approved cleaning that exceeds expectations.",
      icon: <Home className="w-6 h-6 text-purple-400" />,
      features: [
        "Complete property reset",
        "Oven & refrigerator deep clean",
        "Inside all drawers & closets",
        "Wall spot cleaning"
      ]
    }
  ];

  return (
    <section id="services" className="py-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-display text-white mb-6">House Cleaning &amp; Maid Services in Atlanta</h2>
          <p className="text-white/50 text-lg">
            Premium house cleaning for Buckhead, Alpharetta, Sandy Springs, and the greater Atlanta area. From deep cleaning to regular maintenance, we handle everything.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative glass-panel rounded-3xl p-8 flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 ${
                service.highlight ? 'border-blue-500/30 bg-blue-900/5' : ''
              }`}
            >
              {service.highlight && (
                <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
                  <span className="bg-blue-500 text-black text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                {service.icon}
              </div>
              
              <h3 className="text-2xl font-display text-white mb-2">{service.title}</h3>
              <p className="text-white/50 text-sm h-16">{service.desc}</p>
              
              <div className="my-8 pb-8 border-b border-white/10">
                <span className="text-white/40 text-sm">Starting at</span>
                <div className="flex items-baseline text-white">
                  <span className="text-2xl">$</span>
                  <span className="text-5xl font-display font-medium">{service.price}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                    <span className="text-white/70 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant={service.highlight ? "brand" : "secondary"} className="w-full" asChild>
                <a href="#quote">Select Plan</a>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
