import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { getServicePage } from "@/lib/serviceData";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import {
  Phone,
  Mail,
  ChevronDown,
  CheckCircle2,
  Shield,
  Leaf,
  Clock,
  Star,
  Sparkles,
  ArrowRight,
  MapPin,
} from "lucide-react";

export default function ServicePage() {
  const [location] = useLocation();
  const slug = location.replace(/^\//, "").replace(/\/$/, "");
  const page = getServicePage(slug);

  if (!page) {
    return (
      <div className="min-h-screen bg-black w-full flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-display text-white mb-4">
              Service Not Found
            </h1>
            <p className="text-white/50 mb-8">
              The service page you're looking for doesn't exist.
            </p>
            <Button variant="brand" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black w-full flex flex-col font-sans">
      <Helmet>
        <title>{page.title} in Atlanta | Santos Cleaning Solutions</title>
        <meta name="description" content={page.subheadline} />
        <link rel="canonical" href={`https://santoscsolutions.com/${page.slug}/`} />
        <meta property="og:title" content={`${page.title} | Santos Cleaning Solutions`} />
        <meta property="og:description" content={page.subheadline} />
        <meta property="og:url" content={`https://santoscsolutions.com/${page.slug}/`} />
      </Helmet>
      <SchemaMarkup
        type="service"
        data={{
          slug: page.slug,
          title: page.title,
          description: page.subheadline,
          faqs: page.faqs,
          breadcrumbs: [
            { name: "Home", url: "https://santoscsolutions.com" },
            { name: page.title, url: `https://santoscsolutions.com/${page.slug}/` },
          ],
        }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-black to-black pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <MapPin className="w-3.5 h-3.5" />
            {page.badge}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white tracking-tight mb-6">
            {page.headline}
          </h1>
          <p className="text-lg text-white/50 max-w-3xl mx-auto mb-10 leading-relaxed">
            {page.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="brand" size="lg" asChild>
              <a href="tel:8663509407">
                <Phone className="w-4 h-4 mr-2" />
                Call (866) 350-9407
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10"
              asChild
            >
              <a href="/#quote">Get Free Estimate</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-10">
          {[
            { icon: Shield, text: "Licensed & Insured" },
            { icon: CheckCircle2, text: "Background Checked" },
            { icon: Leaf, text: "Eco-Friendly Products" },
            { icon: Star, text: "100% Satisfaction" },
            { icon: Clock, text: "Fast Booking" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-white/60 text-sm"
            >
              <Icon className="w-4 h-4 text-blue-400" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
              What's Included
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Everything you need for a thorough, professional clean.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {page.features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
              Why Choose Santos Cleaning
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {page.whyChoose.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection faqs={page.faqs} />

      {/* Areas Served */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-display font-medium text-white mb-8">
            We Also Serve
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Alpharetta",
              "Buckhead",
              "Sandy Springs",
              "Roswell",
              "Brookhaven",
              "Dunwoody",
              "Johns Creek",
              "Vinings",
              "Milton",
              "Decatur",
              "Suwanee",
            ].map((city) => (
              <Link
                key={city}
                href={`/${city.toLowerCase().replace(/\s+/g, "-")}-house-cleaning`}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:border-blue-500/30 hover:text-blue-400 transition-all"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-blue-900/20 to-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
            {page.ctaHeadline}
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto">
            {page.ctaSubheadline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="brand" size="lg" asChild>
              <a href="tel:8663509407">
                <Phone className="w-4 h-4 mr-2" />
                Call (866) 350-9407
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10"
              asChild
            >
              <a href="mailto:contact@santoscsolutions.com">
                <Mail className="w-4 h-4 mr-2" />
                Email for Quote
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FAQSection({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-medium pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-white/50 shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-white/50 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
