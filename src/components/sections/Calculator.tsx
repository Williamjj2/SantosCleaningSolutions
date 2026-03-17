import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Calculator() {
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(2);
  type ServiceType = "regular" | "deep" | "move";
  const [type, setType] = useState<ServiceType>("regular");

  // Pricing Logic
  const getPrice = () => {
    let base = 0;
    let bedPrice = 0;
    let bathPrice = 0;

    if (type === "regular") {
      base = 90; bedPrice = 30; bathPrice = 20;
    } else if (type === "deep") {
      base = 180; bedPrice = 50; bathPrice = 35;
    } else if (type === "move") {
      base = 200; bedPrice = 55; bathPrice = 40;
    }

    return base + (beds * bedPrice) + (baths * bathPrice);
  };

  const price = getPrice();

  return (
    <section id="calculator" className="py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl md:text-5xl font-display text-white mb-6">Instant Price Estimate</h2>
            <p className="text-white/50 text-lg mb-10 leading-relaxed">
              Transparency is key. Use our calculator to get an immediate estimate for your home. No hidden fees, no surprises.
            </p>

            <div className="space-y-8">
              {/* Type Selection */}
              <div>
                <label className="text-sm font-medium text-white/80 block mb-4">Service Type</label>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                  {([
                    { id: "regular" as const, label: "Regular" },
                    { id: "deep" as const, label: "Deep Clean" },
                    { id: "move" as const, label: "Move In/Out" }
                  ] satisfies Array<{ id: ServiceType; label: string }>).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all ${
                        type === t.id 
                          ? "bg-white/10 text-white shadow-sm border border-white/10" 
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <div className="flex justify-between mb-4">
                  <label className="text-sm font-medium text-white/80">Bedrooms</label>
                  <span className="text-blue-400 font-medium">{beds} {beds === 5 ? "or more" : ""}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={beds} 
                  onChange={(e) => setBeds(parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/30 mt-2">
                  <span>1</span>
                  <span>5+</span>
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <div className="flex justify-between mb-4">
                  <label className="text-sm font-medium text-white/80">Bathrooms</label>
                  <span className="text-blue-400 font-medium">{baths}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="4" 
                  value={baths} 
                  onChange={(e) => setBaths(parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/30 mt-2">
                  <span>1</span>
                  <span>4+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Display */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
            <motion.div 
              className="relative glass-panel rounded-3xl p-10 border border-blue-500/20 flex flex-col items-center justify-center text-center overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />
              
              <span className="text-white/50 text-sm font-medium uppercase tracking-wider mb-6">Your Estimated Price</span>
              
              <div className="flex items-start justify-center gap-1 mb-2">
                <span className="text-3xl text-white/50 mt-2">$</span>
                <AnimatePresence mode="popLayout">
                  <motion.span 
                    key={price}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-7xl font-display font-medium text-white tracking-tight"
                  >
                    {price}
                  </motion.span>
                </AnimatePresence>
                <span className="text-xl text-white/50 mt-auto mb-2 opacity-50">.00</span>
              </div>
              
              <p className="text-blue-400 font-medium mb-10">
                {beds} Bed / {baths} Bath • {type === "regular" ? "Regular" : type === "deep" ? "Deep Clean" : "Move In/Out"}
              </p>

              <Button variant="brand" size="lg" className="w-full h-14 text-lg" asChild>
                <a href="#quote">Book This Service</a>
              </Button>
              <p className="text-white/30 text-xs mt-4">Final price may vary based on actual home condition.</p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
