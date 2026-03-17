import { useState, useEffect } from "react";
import { X, Gift, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("exit-popup-dismissed");
    if (dismissed) return;

    let triggered = false;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !triggered) {
        triggered = true;
        setShow(true);
      }
    };

    // Desktop: mouse leaves viewport top
    document.addEventListener("mouseleave", handleMouseLeave);

    // Mobile: after 45 seconds on page
    const mobileTimer = setTimeout(() => {
      if (window.innerWidth < 768 && !triggered) {
        triggered = true;
        setShow(true);
      }
    }, 45000);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(mobileTimer);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("exit-popup-dismissed", "1");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#0a1628] to-black border border-blue-500/20 p-8 shadow-2xl shadow-blue-500/10"
          >
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8 text-amber-400" />
              </div>

              <h3 className="text-2xl font-display font-medium text-white mb-2">
                Wait! Don't Miss This
              </h3>
              <p className="text-white/50 text-sm mb-6">
                Get <span className="text-amber-400 font-semibold">15% OFF</span> your first cleaning when you book today. Limited availability in your area.
              </p>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                <div className="flex items-center justify-center gap-3 text-white">
                  <span className="text-3xl font-display font-bold text-amber-400">15%</span>
                  <div className="text-left">
                    <p className="text-sm font-medium">First Clean Discount</p>
                    <p className="text-xs text-white/40">Mention code: WELCOME15</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="brand"
                  size="lg"
                  className="w-full"
                  asChild
                  onClick={dismiss}
                >
                  <a href="/#quote">
                    Claim My 15% Off
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <a
                  href="tel:8663509407"
                  onClick={dismiss}
                  className="flex items-center justify-center gap-2 text-sm text-white/50 hover:text-blue-400 transition-colors py-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Or call (866) 350-9407
                </a>
              </div>

              <p className="text-[11px] text-white/30 mt-4">
                Valid for new customers only. Cannot be combined with other offers.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
