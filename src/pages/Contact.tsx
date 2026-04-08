import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function Contact() {
  const [formState, setFormState] = useState<"idle" | "sending" | "sent">(
    "idle"
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("sending");
    const form = e.currentTarget;
    const data = new FormData(form);

    fetch("https://n8n.williamjj.com/webhook/SCSform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        phone: data.get("phone"),
        zipCode: data.get("zip"),
        serviceType: data.get("service"),
        notes: data.get("notes"),
        timestamp: new Date().toISOString(),
        page: window.location.href,
      }),
    })
      .then(() => setFormState("sent"))
      .catch(() => setFormState("sent"));
  };

  const faqs = [
    {
      q: "How quickly can I get a cleaning appointment?",
      a: "We often have same-day or next-day availability. Call before noon for the fastest scheduling. For regular recurring service, we can typically start within the same week.",
    },
    {
      q: "What areas of Atlanta do you serve?",
      a: "We serve the entire metro Atlanta area including Buckhead, Alpharetta, Sandy Springs, Roswell, Dunwoody, Johns Creek, Brookhaven, Marietta, Milton, Vinings, Decatur, and Suwanee.",
    },
    {
      q: "Do I need to be home during the cleaning?",
      a: "No, you don't need to be home. Many of our clients provide a key, garage code, or lockbox access. Your home is fully insured and our team is background-checked.",
    },
    {
      q: "How do I get a quote for my home?",
      a: "Fill out the form on this page, call us at (866) 350-9407, or text us. We'll ask a few questions about your home size, condition, and service preferences to provide an accurate quote within minutes.",
    },
  ];

  return (
    <div className="min-h-screen bg-black w-full flex flex-col font-sans">
      <Helmet>
        <title>Contact Santos Cleaning Solutions | Get a Free Quote in Atlanta</title>
        <meta name="description" content="Contact Santos Cleaning Solutions for a free cleaning quote in Atlanta Metro. Call (866) 350-9407 or fill out our form. We respond within 15 minutes during business hours." />
        <link rel="canonical" href="https://santoscsolutions.com/contact" />
      </Helmet>
      <SchemaMarkup type="faq" data={{ faqs: faqs.map(f => ({ question: f.q, answer: f.a })) }} />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-black to-black pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-white tracking-tight mb-4">
            Contact <span className="text-gradient-brand">Santos Cleaning</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            We're here to help! Reach out for estimates, scheduling, or any
            questions about our services.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10">
                {formState === "sent" ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-display font-medium text-white mb-2">
                      Thank You!
                    </h3>
                    <p className="text-white/50">
                      We'll call you back within 15 minutes during business
                      hours.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-display font-medium text-white mb-2">
                      Request a Free Quote
                    </h2>
                    <p className="text-sm text-white/50 mb-6">
                      Fill out this form and we'll call you back within 15
                      minutes during business hours.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm text-white/70 mb-1.5">
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                          placeholder="John Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/70 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                          placeholder="(404) 555-0123"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/70 mb-1.5">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          name="zip"
                          required
                          pattern="[0-9]{5}"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                          placeholder="30009"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/70 mb-1.5">
                          Service Type
                        </label>
                        <select
                          name="service"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                        >
                          <option value="">Select a service...</option>
                          <option value="regular">Regular Cleaning</option>
                          <option value="deep">Deep Cleaning</option>
                          <option value="move">Move In/Out Cleaning</option>
                          <option value="office">Office Cleaning</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-white/70 mb-1.5">
                          Additional Details{" "}
                          <span className="text-white/30">(Optional)</span>
                        </label>
                        <textarea
                          name="notes"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors resize-none"
                          placeholder="Number of bedrooms, bathrooms, pets, special requests..."
                        />
                      </div>
                      <Button
                        variant="brand"
                        size="lg"
                        className="w-full"
                        type="submit"
                        disabled={formState === "sending"}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {formState === "sending"
                          ? "Sending..."
                          : "Get My Free Quote"}
                      </Button>
                      <p className="text-xs text-white/30 text-center">
                        Your information is secure and never shared.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-display font-medium text-white mb-6">
                  Get in Touch
                </h2>
                <div className="space-y-6">
                  <a
                    href="tel:8663509407"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
                        (866) 350-9407
                      </p>
                      <p className="text-sm text-white/50">
                        Call us anytime for urgent needs
                      </p>
                    </div>
                  </a>
                  <a
                    href="mailto:contact@santoscsolutions.com"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
                        contact@santoscsolutions.com
                      </p>
                      <p className="text-sm text-white/50">
                        For quotes and general inquiries
                      </p>
                    </div>
                  </a>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        Serving Metro Atlanta
                      </p>
                      <p className="text-sm text-white/50">
                        Buckhead, Alpharetta, Sandy Springs, Roswell & more
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Business Hours</p>
                      <p className="text-sm text-white/50">
                        Monday – Saturday: 8:00 AM – 3:00 PM
                      </p>
                      <p className="text-sm text-white/50">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map embed placeholder */}
              <div className="rounded-2xl overflow-hidden border border-white/10 h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d212270.5076689398!2d-84.56856627230913!3d33.76879066498498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f5045d6993098d%3A0x66fede2f990b630b!2sAtlanta%2C%20GA!5e0!3m2!1sen!2sus!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Santos Cleaning Solutions - Atlanta Service Area"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-display font-medium text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-white font-medium pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-white/50 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-white/50 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
