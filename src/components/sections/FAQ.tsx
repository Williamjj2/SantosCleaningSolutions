import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How quickly can I get a cleaning appointment?",
    a: "We often have same-day availability! Call us before noon at (866) 350-9407 to check today's schedule. For regular appointments, we can usually schedule within 2-3 business days."
  },
  {
    q: "What areas of Atlanta do you serve?",
    a: "We serve the greater Atlanta area including Marietta, Alpharetta, Buckhead, Sandy Springs, Dunwoody, Roswell, Johns Creek, Brookhaven, Decatur, Milton, Suwanee, Vinings, and all of Cobb County."
  },
  {
    q: "Do I need to be home during the cleaning?",
    a: "No, you don't need to be present. Many clients provide a key or garage code so we can clean while they're at work. All our team members are background-checked and fully insured for your peace of mind."
  },
  {
    q: "What's included in a deep cleaning vs regular cleaning?",
    a: "Regular Cleaning includes dusting, vacuuming, mopping, and sanitizing kitchens/bathrooms. Deep Cleaning adds inside cabinets/appliances, baseboards, light fixtures, behind furniture, and detailed scrubbing."
  },
  {
    q: "Are your cleaning products safe for pets and children?",
    a: "Yes! We use eco-friendly, non-toxic cleaning products that are safe for pets, children, and anyone with sensitivities. If you have specific preferences, just let us know."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-white/50">Quick answers to common questions about our cleaning services.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-medium text-white/90">{faq.q}</span>
                {openIndex === i ? (
                  <Minus className="w-5 h-5 text-blue-400 shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-white/40 shrink-0" />
                )}
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-white/50 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
