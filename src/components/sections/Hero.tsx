import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroVideo from "@assets/4ba35ef46bc69c9e5f2aa4067f6fc579_1773629643_1773630112685.mp4";
import { ShieldCheck, Star, Leaf } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover opacity-30 scale-105"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-noise pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 w-full flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-8"
        >
          <Badge icon={<Leaf className="w-3.5 h-3.5 text-blue-400" />} text="Eco-Friendly" />
          <Badge icon={<ShieldCheck className="w-3.5 h-3.5 text-blue-400" />} text="Licensed & Insured" />
          <Badge icon={<Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />} text="4.9★ Rating" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-medium text-white tracking-tight leading-[1.05] max-w-5xl"
        >
          Your Atlanta Home, <br/>
          <span className="text-gradient-brand italic pr-2">Sparkling Clean</span> Tomorrow.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 text-lg md:text-xl text-white/60 max-w-2xl font-light"
        >
          Premium residential cleaning for Buckhead, Alpharetta, and Metro Atlanta. 
          100% Satisfaction or a Free Re-Clean.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Button variant="brand" size="lg" className="w-full sm:w-auto text-lg h-14 px-8" asChild>
            <a href="#quote">Get Instant Quote</a>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 text-white border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10" asChild>
            <a href="tel:8663509407">Call (866) 350-9407</a>
          </Button>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/30 tracking-widest uppercase font-medium">Scroll to explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </motion.div>
    </section>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
      {icon}
      <span className="text-xs font-medium text-white/80">{text}</span>
    </div>
  );
}
