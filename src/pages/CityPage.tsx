import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { getCityPage, otherCities } from "@/lib/cityData";
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
  MapPin,
  Home,
  Users,
  ArrowRight,
} from "lucide-react";

export default function CityPage() {
  const params = useParams() as { slug?: string };
  const slug = params.slug || "";
  const page = getCityPage(slug);

  if (!page) {
    return (
      <div className="min-h-screen bg-black w-full flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-display text-white mb-4">
              Area Not Found
            </h1>
            <p className="text-white/50 mb-8">
              We couldn't find that service area.
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

  const others = otherCities(slug);

  return (
    <div className="min-h-screen bg-black w-full flex flex-col font-sans">
      <Helmet>
        <title>{`${page.city} House Cleaning | Santos Cleaning`}</title>
        <meta name="description" content={`Professional house cleaning in ${page.city}, GA. Licensed & insured, eco-friendly products, 4.9★ rated. Deep cleaning, regular maid service & move-out cleaning. Same-day availability. Call (866) 350-9407.`} />
        <link rel="canonical" href={`https://santoscsolutions.com/${page.slug}/`} />
        <meta property="og:title" content={`House Cleaning in ${page.city}, GA | Santos Cleaning Solutions`} />
        <meta property="og:description" content={`Professional house cleaning in ${page.city}, GA. Licensed & insured, eco-friendly, 4.9★ rated. Same-day availability.`} />
        <meta property="og:url" content={`https://santoscsolutions.com/${page.slug}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://santoscsolutions.com/opengraph.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`House Cleaning in ${page.city}, GA | Santos Cleaning Solutions`} />
        <meta name="twitter:description" content={`Professional house cleaning in ${page.city}, GA. Licensed & insured, eco-friendly, 4.9★ rated.`} />
        <meta name="twitter:image" content="https://santoscsolutions.com/opengraph.jpg" />
        <meta name="geo.region" content="US-GA" />
        <meta name="geo.placename" content={`${page.city}, Georgia`} />
        <meta name="geo.position" content={`${page.lat};${page.lng}`} />
        <meta name="ICBM" content={`${page.lat}, ${page.lng}`} />
      </Helmet>
      <SchemaMarkup
        type="city"
        data={{
          slug: page.slug,
          city: page.city,
          zip: page.zip,
          lat: page.lat,
          lng: page.lng,
          faqs: cityFaqs(page.city),
          breadcrumbs: [
            { name: "Home", url: "https://santoscsolutions.com" },
            { name: `${page.city} House Cleaning`, url: `https://santoscsolutions.com/${page.slug}/` },
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
            Serving {page.city}, {page.state} & {page.region}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white tracking-tight mb-6">
            Professional House Cleaning in{" "}
            <span className="text-gradient-brand">{page.city}</span>, GA
          </h1>
          <p className="text-lg text-white/50 max-w-3xl mx-auto mb-10 leading-relaxed">
            {page.description}
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
            { icon: Star, text: "4.9★ Average Rating" },
            { icon: Clock, text: "Same-Day Available" },
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

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
              Our Services in {page.city}
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Comprehensive cleaning services tailored for {page.city}{" "}
              homeowners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Deep Cleaning",
                description: `Our most thorough service. Perfect for first-time clients, seasonal resets, or homes that need extra attention. We clean inside appliances, baseboards, and every corner of your ${page.city} home.`,
                tag: "From $199",
                href: "/deep-cleaning",
              },
              {
                title: "Regular Cleaning",
                description: `Keep your ${page.city} home consistently spotless with weekly, bi-weekly, or monthly service. Customized cleaning plans based on your lifestyle and preferences.`,
                tag: "From $149",
                href: "/regular-cleaning",
              },
              {
                title: "Move In/Out Cleaning",
                description: `Essential for ${page.city} renters and homeowners. We meet landlord requirements and ensure you get your deposit back. Complete property cleaning including inside cabinets.`,
                tag: "From $299",
                href: "/move-in-out-cleaning",
              },
              {
                title: "Luxury Home Cleaning",
                description: page.luxuryNote,
                tag: "Custom Quote",
                href: "/#quote",
              },
              {
                title: "Eco-Friendly Cleaning",
                description: `${page.city} families deserve green cleaning. We use plant-based, biodegradable products that are gentle on your home's surfaces and safe for children and pets.`,
                tag: "Included Free",
                href: "/#services",
              },
              {
                title: "Fast Booking",
                description: `Need cleaning today in ${page.city}? We often have same-day availability. Call before noon for fastest scheduling. Perfect for last-minute guests or events.`,
                tag: "Call Now",
                href: "tel:8663509407",
              },
            ].map((service) => (
              <a
                key={service.title}
                href={service.href}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all duration-300 block"
              >
                <div className="flex items-center justify-between mb-4">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {service.tag}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {service.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="py-16 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-display font-medium text-white mb-2">
            Neighborhoods We Serve in {page.city}
          </h2>
          <p className="text-white/50 text-sm mb-8">
            Proudly serving all {page.city} communities and surrounding areas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {page.neighborhoods.map((n) => (
              <span
                key={n.name}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm"
              >
                {n.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
              Why {page.city} Families Choose Us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Users,
                title: "Same Team Every Visit",
                desc: "You'll see the same trusted faces. They know your home and preferences.",
              },
              {
                icon: Shield,
                title: "Fully Licensed & Insured",
                desc: "Complete peace of mind with $1M liability coverage.",
              },
              {
                icon: Leaf,
                title: "Eco-Friendly Products",
                desc: "Safe for kids, pets, and the planet. No harsh chemicals.",
              },
              {
                icon: Star,
                title: "24-Hour Re-Clean Guarantee",
                desc: "Not 100% satisfied? We'll come back and fix it — free.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <CityFAQ city={page.city} />

      {/* Other Areas */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-display font-medium text-white mb-8">
            We Also Serve
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {others.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:border-blue-500/30 hover:text-blue-400 transition-all"
              >
                {c.city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-blue-900/20 to-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
            Ready for a Spotless Home in {page.city}?
          </h2>
          <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto">
            Join hundreds of {page.city} families who trust Santos Cleaning for
            a consistently clean home. Book your first cleaning today.
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
              <a href="/#quote">
                Get Your Free Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function cityFaqs(city: string) {
  return [
    {
      question: `How much does house cleaning cost in ${city}, GA?`,
      answer: `Our ${city} cleaning prices start at $149 for regular cleaning, $199 for deep cleaning, and $299 for move in/out cleaning. Final pricing depends on home size, condition, and specific needs. Call (866) 350-9407 for a free, accurate quote.`,
    },
    {
      question: `Do you offer same-day house cleaning in ${city}?`,
      answer: `Yes! We frequently have same-day availability in ${city}. Call us before noon for the best chance of same-day service. We also offer next-day guaranteed booking.`,
    },
    {
      question: `What areas of ${city} do you serve?`,
      answer: `We serve all neighborhoods and communities in ${city} and surrounding areas. Our team is familiar with the area and can reach any location quickly.`,
    },
    {
      question: `Do you clean luxury homes in ${city}?`,
      answer: `Absolutely! We specialize in luxury and high-end homes in ${city}. Our team is trained to handle fine finishes, marble, hardwood, and premium materials with white-glove care.`,
    },
    {
      question: `Are your ${city} cleaners licensed and insured?`,
      answer: `Yes! Santos Cleaning Solutions is fully licensed and carries $1M in general liability insurance. Every team member serving ${city} homes is background-checked and professionally trained.`,
    },
    {
      question: `Do you use eco-friendly cleaning products in ${city}?`,
      answer: `All our ${city} cleaning services include premium eco-friendly, plant-based products at no extra charge. Our products are safe for children, pets, and the environment — no harsh chemicals, ever.`,
    },
    {
      question: `How do I prepare my ${city} home for a cleaning visit?`,
      answer: `Just pick up personal items and declutter surfaces so our team can clean thoroughly. No need to pre-clean! Let us know about pets and any areas that need special attention. We handle the rest.`,
    },
    {
      question: `What if I'm not satisfied with my ${city} house cleaning?`,
      answer: `We offer a 24-hour re-clean guarantee. If you're not 100% satisfied with any part of the cleaning, call us within 24 hours and we'll come back and fix it — completely free.`,
    },
  ];
}

function CityFAQ({ city }: { city: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = cityFaqs(city);

  return (
    <section className="py-20 bg-white/[0.02]">
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
