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
      "Our Atlanta cleaning prices start at $129/week for regular cleaning, $199 for deep cleaning, and $249 for move in/out cleaning. Final pricing depends on home size and condition.",
  },
  {
    question: "Are you licensed and insured?",
    answer:
      "Yes! Santos Cleaning Solutions is fully licensed and carries $1M in general liability insurance. All team members are background-checked.",
  },
  {
    question: "Do you use eco-friendly cleaning products?",
    answer:
      "Yes, all our services include premium eco-friendly, plant-based cleaning products at no extra charge. Safe for kids, pets, and the environment.",
  },
  {
    question: "Do you offer same-day cleaning in Atlanta?",
    answer:
      "Yes! We frequently have same-day availability. Call us before noon at (866) 350-9407 for the best chance of same-day service.",
  },
];

export function Home() {
  return (
    <div className="min-h-screen bg-black w-full flex flex-col font-sans">
      <Helmet>
        <title>Santos Cleaning Solutions | Premium House Cleaning in Buckhead, Alpharetta & Atlanta Metro</title>
        <meta name="description" content="Premium eco-friendly house cleaning in Buckhead, Alpharetta, Sandy Springs, Roswell, Dunwoody, Johns Creek & Atlanta Metro. Licensed & insured, 4.9★ rated. Same-day availability. Call (866) 350-9407." />
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
