import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { Calculator } from "@/components/sections/Calculator";
import { Services } from "@/components/sections/Services";
import { ScrollCleaningSequence } from "@/components/sections/ScrollCleaningSequence";
import { WhyUs } from "@/components/sections/WhyUs";
import { Reviews } from "@/components/sections/Reviews";
import { Areas } from "@/components/sections/Areas";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/layout/Footer";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { AnimatedSection } from "@/components/AnimatedSection";

const homeFaqs = [
  {
    question: "How much does house cleaning cost in Atlanta?",
    answer:
      "Our Atlanta cleaning prices start at $129/week for regular cleaning, $199 for deep cleaning, and $249 for move in/out cleaning. Final pricing depends on home size and condition. Call (866) 350-9407 for a free, accurate quote.",
  },
  {
    question: "Are you licensed and insured?",
    answer:
      "Yes! Santos Cleaning Solutions is fully licensed and carries $1M in general liability insurance. All team members are background-checked and professionally trained.",
  },
  {
    question: "Do you use eco-friendly cleaning products?",
    answer:
      "Yes, all our services include premium eco-friendly, plant-based cleaning products at no extra charge. Safe for kids, pets, and the environment. No harsh chemicals, ever.",
  },
  {
    question: "Do you offer same-day cleaning in Atlanta?",
    answer:
      "Yes! We frequently have same-day availability. Call us before noon at (866) 350-9407 for the best chance of same-day service. We also offer next-day guaranteed booking.",
  },
  {
    question: "What areas of Atlanta do you serve?",
    answer:
      "We serve the entire Atlanta Metro area including Buckhead, Alpharetta, Sandy Springs, Roswell, Dunwoody, Johns Creek, Brookhaven, Marietta, Milton, Vinings, Decatur, Suwanee, and surrounding communities.",
  },
  {
    question: "Do I need to be home during the cleaning?",
    answer:
      "No, you don't need to be home. Many clients provide a key, garage code, or lockbox access. Your home is fully insured and our team is background-checked for your peace of mind.",
  },
  {
    question: "What is your satisfaction guarantee?",
    answer:
      "We offer a 24-hour re-clean guarantee. If you're not 100% satisfied with any aspect of the cleaning, call us within 24 hours and we'll come back and fix it — completely free, no questions asked.",
  },
  {
    question: "How do I book a cleaning with Santos Cleaning Solutions?",
    answer:
      "You can book online through our instant quote form, call us at (866) 350-9407, or text us. We'll ask about your home size and needs, then provide an accurate quote within minutes. Most appointments can start within 24-48 hours.",
  },
];

export function Home() {
  return (
    <div className="min-h-screen bg-black w-full flex flex-col font-sans">
      <Helmet>
        <title>House Cleaning Atlanta | Santos Cleaning</title>
        <meta name="description" content="Eco-friendly house cleaning in Buckhead, Alpharetta, Sandy Springs & Atlanta Metro. Licensed & insured, 4.9★ rated. Same-day availability. Call (866) 350-9407." />
        <link rel="canonical" href="https://santoscsolutions.com/" />
      </Helmet>
      <SchemaMarkup type="home" data={{ faqs: homeFaqs }} />
      <Navbar />

      <main className="flex-1">
        <Hero />
        <QuoteForm />
        <ScrollCleaningSequence />
        <AnimatedSection>
          <Calculator />
        </AnimatedSection>
        <AnimatedSection>
          <Services />
        </AnimatedSection>
        <AnimatedSection>
          <WhyUs />
        </AnimatedSection>
        <AnimatedSection>
          <Reviews />
        </AnimatedSection>
        <AnimatedSection>
          <Areas />
        </AnimatedSection>
        <AnimatedSection>
          <FAQ />
        </AnimatedSection>
        <AnimatedSection>
          <FinalCTA />
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
