import { useParams } from "wouter";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Leaf,
  Sparkles,
  Home,
} from "lucide-react";

interface GuideSection {
  title: string;
  content: string;
  tips?: string[];
}

interface GuidePageData {
  slug: string;
  badge: string;
  title: string;
  meta: string;
  intro: string;
  sections: GuideSection[];
  ctaTitle: string;
  ctaText: string;
  relatedGuides: { title: string; slug: string }[];
}

const guides: Record<string, GuidePageData> = {
  "deep-cleaning": {
    slug: "deep-cleaning",
    badge: "Expert Advice",
    title: "Comprehensive Deep Cleaning Guide: What to Expect",
    meta: "By Santos Cleaning Team • 10 min read",
    intro:
      "This comprehensive guide explains everything you can expect from a professional deep cleaning service. Deep cleaning goes far beyond regular maintenance — it's designed to thoroughly clean every surface, corner, and hard-to-reach area in your home. Professional deep cleaning is perfect for spring cleaning, preparing your home for sale, or when you need a total refresh. We recommend a deep clean for all first-time clients to establish a baseline of cleanliness.",
    sections: [
      {
        title: "What's Included in a Deep Clean",
        content:
          "A professional deep cleaning covers every room in your home with meticulous attention to detail. Here's what our team tackles during a full deep clean:",
        tips: [
          "Kitchen: Inside oven & fridge, detailed cabinet scrubbing, grout cleaning, degrease stovetop and range hood",
          "Bathrooms: Tile descaling, inside cabinets, exhaust fans, light fixtures, scrub grout lines",
          "Living Areas: Baseboards, window sills, door frames, switch plates, air vents",
          "Bedrooms: Under accessible furniture, detailed dusting, closet floors, ceiling fans",
          "Everywhere: Interior windows, blinds dusting, cobweb removal, light switch sanitization",
        ],
      },
      {
        title: "When to Schedule a Deep Clean",
        content:
          "Deep cleaning is particularly beneficial for homes that haven't been professionally cleaned in over 3 months. It's also ideal for specific situations:",
        tips: [
          "Allergy sufferers: Removes built-up dust, dander, and allergens from hidden areas",
          "Before hosting: Major holidays, parties, or overnight guests",
          "Seasonal resets: Spring and fall deep cleans keep your home fresh year-round",
          "After renovations: Construction dust settles everywhere, even in closed cabinets",
          "Before starting regular service: Establishes a clean baseline",
          "Before listing your home: First impressions matter to buyers",
        ],
      },
      {
        title: "How to Prepare for Your Deep Cleaning",
        content:
          "To get the most out of your deep cleaning service, a little preparation goes a long way. Here's what we recommend:",
        tips: [
          "Declutter surfaces: Clear countertops, tables, and desks so our team can clean underneath",
          "Pick up personal items: Clothes, toys, and personal belongings should be put away",
          "Secure pets: Let us know about pets so we can plan accordingly",
          "Provide access: Ensure we can reach all rooms, closets, and areas you want cleaned",
          "Note priorities: Tell us about any specific areas that need extra attention",
        ],
      },
      {
        title: "Deep Cleaning vs. Regular Cleaning",
        content:
          "Understanding the difference helps you choose the right service. Regular cleaning maintains cleanliness — it covers surfaces, vacuuming, mopping, and bathroom sanitization. Deep cleaning is intensive and reaches areas that accumulate grime over time: inside appliances, behind furniture, baseboards, grout lines, window tracks, and more. Most homes benefit from a deep clean every 3-6 months with regular maintenance cleaning in between.",
      },
      {
        title: "What Results to Expect",
        content:
          "After a professional deep cleaning, you'll notice immediately cleaner air, brighter surfaces, and a fresh-smelling home. Baseboards will gleam, grout will look restored, and surfaces you forgot could shine will sparkle again. Most clients describe the feeling as 'like moving into a new home.' The deep clean effect lasts 2-4 weeks with normal use, and even longer when followed by regular maintenance cleaning.",
      },
    ],
    ctaTitle: "Ready for a Fresh Start?",
    ctaText:
      "Our deep cleaning team is ready to transform your home. Get a free, no-obligation quote today.",
    relatedGuides: [
      { title: "Eco-Friendly Cleaning Guide", slug: "eco-friendly" },
      { title: "Moving Cleaning Guide", slug: "moving" },
    ],
  },
  "eco-friendly": {
    slug: "eco-friendly",
    badge: "Green Living",
    title: "Eco-Friendly Cleaning: A Complete Guide",
    meta: "By Santos Cleaning Team • 8 min read",
    intro:
      "Going green with your cleaning routine doesn't mean sacrificing cleanliness. Modern eco-friendly cleaning products and techniques are just as effective as traditional methods — without the harsh chemicals. At Santos Cleaning Solutions, we use plant-based, biodegradable products that are safe for your family, pets, and the environment.",
    sections: [
      {
        title: "Why Choose Eco-Friendly Cleaning",
        content:
          "Traditional cleaning products can contain volatile organic compounds (VOCs), synthetic fragrances, and harsh chemicals that linger in your home's air. Eco-friendly alternatives eliminate these risks while delivering the same sparkling results.",
        tips: [
          "Healthier indoor air quality — no harsh chemical fumes",
          "Safe for children who play on floors and touch surfaces",
          "Pet-friendly — no toxic residue on surfaces pets contact",
          "Better for the environment — biodegradable ingredients",
          "Gentle on surfaces — won't damage natural stone, wood, or delicate finishes",
        ],
      },
      {
        title: "Our Green Cleaning Products",
        content:
          "We carefully select professional-grade eco-friendly products that meet strict environmental and safety standards. Our product lineup includes plant-based all-purpose cleaners, enzyme-based stain removers, natural disinfectants, and HEPA-filtered vacuums that capture 99.97% of allergens.",
      },
      {
        title: "Eco-Friendly Cleaning Tips for Home",
        content:
          "Between professional cleanings, you can maintain your home with these green cleaning practices:",
        tips: [
          "Use white vinegar and water (1:1) for glass and mirrors",
          "Baking soda paste removes stubborn kitchen stains naturally",
          "Microfiber cloths clean effectively with just water",
          "Lemon juice is a natural deodorizer and mild disinfectant",
          "Steam cleaning sanitizes without any chemicals",
          "Open windows regularly to improve indoor air quality",
        ],
      },
      {
        title: "Green Cleaning for Allergy Sufferers",
        content:
          "Eco-friendly cleaning is especially beneficial for allergy sufferers. By eliminating synthetic fragrances and harsh chemicals, we reduce the triggers that can cause allergic reactions. Combined with HEPA-filtered vacuums and thorough dusting techniques, our green cleaning service creates a healthier indoor environment for sensitive individuals.",
      },
    ],
    ctaTitle: "Go Green with Professional Cleaning",
    ctaText:
      "Experience the difference eco-friendly cleaning makes. All our services include green products at no extra charge.",
    relatedGuides: [
      { title: "Deep Cleaning Guide", slug: "deep-cleaning" },
      { title: "Moving Cleaning Guide", slug: "moving" },
    ],
  },
  moving: {
    slug: "moving",
    badge: "Moving Guide",
    title: "The Complete Moving Cleaning Guide",
    meta: "By Santos Cleaning Team • 9 min read",
    intro:
      "Moving is stressful enough without worrying about cleaning. Whether you're moving out and need to secure your deposit, or moving in and want a fresh start, this guide covers everything you need to know about move cleaning services and what to expect.",
    sections: [
      {
        title: "Move-Out Cleaning Essentials",
        content:
          "Move-out cleaning is specifically designed to meet landlord and property management inspection standards. It goes beyond regular cleaning to ensure every surface, cabinet, and appliance meets the expectations for returning a rental property.",
        tips: [
          "Inside all cabinets, drawers, and closets — wiped clean",
          "Inside oven, refrigerator, microwave, and dishwasher",
          "All bathrooms scrubbed — tile, grout, fixtures, behind toilet",
          "Wall spot cleaning — remove scuffs, marks, and fingerprints",
          "Baseboards, door frames, and light switch plates cleaned",
          "Windows, window sills, and tracks cleaned",
          "All floors swept, vacuumed, and mopped",
        ],
      },
      {
        title: "How to Maximize Your Deposit Return",
        content:
          "Professional move-out cleaning is one of the best investments you can make when leaving a rental. Here's how to maximize your chances of getting your full deposit back:",
        tips: [
          "Schedule cleaning after all items are removed — empty homes clean faster and more thoroughly",
          "Document the condition with photos before and after cleaning",
          "Address any minor repairs (nail holes, scuffs) before cleaning",
          "Provide your landlord's cleaning checklist to us if available",
          "Schedule cleaning 1-2 days before your final walkthrough",
        ],
      },
      {
        title: "Move-In Cleaning: Starting Fresh",
        content:
          "Even if the previous tenant cleaned, we recommend a move-in cleaning before you unpack. You don't know how thoroughly the previous occupant cleaned, and starting with a professionally sanitized home gives you peace of mind. Move-in cleaning focuses on deep sanitization of all surfaces, especially kitchens and bathrooms, where hygiene matters most.",
      },
      {
        title: "Timing Your Move Cleaning",
        content:
          "The best time to schedule move cleaning depends on your situation:",
        tips: [
          "Move-out: Schedule for the day after your last load of belongings leaves",
          "Move-in: Schedule 1-2 days before your moving truck arrives",
          "Same-day service: Available for urgent situations — call before noon",
          "Last-minute: We accommodate rush bookings when possible",
        ],
      },
      {
        title: "What Sets Our Move Cleaning Apart",
        content:
          "Our move cleaning service includes a re-clean guarantee. If your landlord identifies any cleaning issues within 24 hours of our service, we return and address them at no additional cost. We follow detailed checklists designed specifically for rental inspection standards, ensuring nothing is missed during your walkthrough.",
      },
    ],
    ctaTitle: "Make Your Move Stress-Free",
    ctaText:
      "Let our team handle the cleaning so you can focus on settling into your new home. Book your move cleaning today.",
    relatedGuides: [
      { title: "Deep Cleaning Guide", slug: "deep-cleaning" },
      { title: "Eco-Friendly Cleaning Guide", slug: "eco-friendly" },
    ],
  },
};

export default function Guide() {
  const params = useParams() as { slug?: string };
  const slug = params.slug || "";
  const guide = guides[slug];

  if (!guide) {
    return (
      <div className="min-h-screen bg-black w-full flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-display text-white mb-4">
              Guide Not Found
            </h1>
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
        <title>{guide.title} | Santos Cleaning Solutions</title>
        <meta name="description" content={guide.intro.slice(0, 160)} />
        <link rel="canonical" href={`https://santoscsolutions.com/guides/${guide.slug}`} />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-black to-black pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            {guide.badge}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-white tracking-tight mb-4">
            {guide.title}
          </h1>
          <p className="text-white/40 text-sm mb-8">{guide.meta}</p>
          <Button variant="brand" asChild>
            <a href="/#quote">
              Get a Free Quote
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
            {/* Main Content */}
            <article>
              {/* Intro */}
              <p className="text-white/60 leading-relaxed mb-12 text-base">
                {guide.intro}
              </p>

              {/* Sections */}
              <div className="space-y-12">
                {guide.sections.map((section, i) => (
                  <div key={i}>
                    <h2 className="text-2xl font-display font-medium text-white mb-4">
                      {section.title}
                    </h2>
                    <p className="text-white/50 leading-relaxed mb-4">
                      {section.content}
                    </p>
                    {section.tips && (
                      <ul className="space-y-2">
                        {section.tips.map((tip, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <span className="text-white/50 text-sm leading-relaxed">
                              {tip}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* CTA Box */}
              <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-500/20">
                <h3 className="text-2xl font-display font-medium text-white mb-2">
                  {guide.ctaTitle}
                </h3>
                <p className="text-white/50 mb-6">{guide.ctaText}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="brand" asChild>
                    <a href="/#quote">
                      Get Free Quote
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    asChild
                  >
                    <a href="tel:8663509407">
                      <Phone className="w-4 h-4 mr-2" />
                      (866) 350-9407
                    </a>
                  </Button>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Related Guides */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                <h3 className="text-sm font-medium text-white mb-4">
                  Related Guides
                </h3>
                <div className="space-y-3">
                  {guide.relatedGuides.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/guides/${related.slug}`}
                      className="flex items-center gap-2 text-sm text-white/50 hover:text-blue-400 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      {related.title}
                    </Link>
                  ))}
                  <Link
                    href="/#services"
                    className="flex items-center gap-2 text-sm text-white/50 hover:text-blue-400 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    All Services
                  </Link>
                </div>
              </div>

              {/* Quick Quote CTA */}
              <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                <Sparkles className="w-6 h-6 text-blue-400 mb-3" />
                <h3 className="text-sm font-medium text-white mb-2">
                  Need a Cleaning Quote?
                </h3>
                <p className="text-xs text-white/50 mb-4">
                  Get a free, no-obligation quote for your home.
                </p>
                <Button variant="brand" size="sm" className="w-full" asChild>
                  <a href="/#quote">Start Now</a>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
