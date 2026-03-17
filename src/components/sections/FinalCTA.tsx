import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-5xl md:text-7xl font-display font-medium text-white tracking-tight mb-8">
          Ready to Love <br className="hidden md:block"/> Coming Home?
        </h2>
        
        <p className="text-xl text-white/60 mb-12">
          Join 100+ Atlanta families who trust Santos Cleaning for a spotless home.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button variant="brand" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg" asChild>
            <a href="#quote">Get Instant Quote</a>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10" asChild>
            <a href="tel:8663509407">Call (866) 350-9407</a>
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-white/40">
          <span>100% Satisfaction Guaranteed</span>
          <span>•</span>
          <span>No Hidden Fees</span>
        </div>
      </div>
    </section>
  );
}
