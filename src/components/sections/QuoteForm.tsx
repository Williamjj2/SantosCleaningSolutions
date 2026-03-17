import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  zipCode: z.string().min(5, "ZIP code required"),
  serviceType: z.string().min(1, "Please select a service"),
  details: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuoteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    toast({
      title: "Quote Request Sent!",
      description: "We'll call you back within 15 minutes.",
    });
    
    // Reset success state after a few seconds
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <section id="quote" className="py-24 relative bg-black">
      <div className="absolute inset-0 bg-blue-900/5 blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display text-white mb-4">Get Your Free Quote in 60 Seconds</h2>
          <p className="text-white/50 text-lg">No obligation • Same-day response • 100% satisfaction guaranteed</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel rounded-3xl p-6 md:p-10 max-w-2xl mx-auto"
        >
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-display text-white mb-2">Thank You!</h3>
              <p className="text-white/60">We received your request and will call you back shortly during business hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Your Name *</label>
                  <input 
                    {...register("name")}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    placeholder="John Doe"
                  />
                  {errors.name && <span className="text-destructive text-xs">{errors.name.message}</span>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Phone Number *</label>
                  <input 
                    {...register("phone")}
                    type="tel"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    placeholder="(404) 555-0123"
                  />
                  {errors.phone && <span className="text-destructive text-xs">{errors.phone.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">ZIP Code *</label>
                  <input 
                    {...register("zipCode")}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    placeholder="30305"
                  />
                  {errors.zipCode && <span className="text-destructive text-xs">{errors.zipCode.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Service Type *</label>
                  <select 
                    {...register("serviceType")}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
                  >
                    <option value="" disabled className="bg-black text-white/50">Select service...</option>
                    <option value="regular" className="bg-black">Regular Cleaning</option>
                    <option value="deep" className="bg-black">Deep Cleaning</option>
                    <option value="move" className="bg-black">Move In/Out Cleaning</option>
                  </select>
                  {errors.serviceType && <span className="text-destructive text-xs">{errors.serviceType.message}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Additional Details (optional)</label>
                <textarea 
                  {...register("details")}
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                  placeholder="Any specific instructions or areas to focus on?"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                variant="brand" 
                size="lg" 
                className="w-full h-14 text-lg mt-4"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                  "Get My Free Quote"
                )}
              </Button>
            </form>
          )}
        </motion.div>

        {/* Stats Row */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-white/10 border-t border-b border-white/10 py-6">
          <div className="px-4">
            <div className="text-2xl font-display text-white mb-1">4.9/5</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Google Rating</div>
          </div>
          <div className="px-4">
            <div className="text-2xl font-display text-white mb-1">Mon-Sat</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">8 AM - 3 PM</div>
          </div>
          <div className="px-4">
            <div className="text-2xl font-display text-white mb-1">Family</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Owned</div>
          </div>
          <div className="px-4">
            <div className="text-2xl font-display text-white mb-1">100%</div>
            <div className="text-xs text-white/50 uppercase tracking-wider">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
}
