import { useParams } from "wouter";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

interface LegalPageContent {
  title: string;
  lastUpdated: string;
  sections: { heading: string; content: string[] }[];
}

const legalPages: Record<string, LegalPageContent> = {
  "privacy-policy": {
    title: "Privacy Policy",
    lastUpdated: "December 2024",
    sections: [
      {
        heading: "Information We Collect",
        content: [
          "We collect information you provide directly to us, including your name, email address, phone number, home address, and service preferences when you request a quote, schedule a cleaning, or communicate with us.",
          "We also collect service-related data such as scheduling history, payment information, and any special instructions you provide for your cleaning appointments.",
        ],
      },
      {
        heading: "How We Use Your Information",
        content: [
          "We use the information we collect to provide, maintain, and improve our cleaning services, process transactions, send service confirmations and reminders, respond to your inquiries, and communicate promotional offers (with your consent).",
          "Your information helps us personalize your cleaning experience and assign the right team to your home.",
        ],
      },
      {
        heading: "Information Sharing",
        content: [
          "We do NOT sell, trade, or rent your personal information to third parties.",
          "We may share your information only with service providers who assist in our operations (such as payment processors), when required by law, or to protect the safety of our clients and staff.",
        ],
      },
      {
        heading: "Data Security",
        content: [
          "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
        ],
      },
      {
        heading: "Your Rights",
        content: [
          "You have the right to access, correct, or delete your personal information at any time. You may also opt out of marketing communications by contacting us or using the unsubscribe link in our emails.",
          "To exercise any of these rights, contact us at contact@santoscsolutions.com or call (866) 350-9407.",
        ],
      },
      {
        heading: "Contact Us",
        content: [
          "If you have questions about this Privacy Policy, please contact us at contact@santoscsolutions.com or call (866) 350-9407.",
        ],
      },
    ],
  },
  "terms-of-service": {
    title: "Terms of Service",
    lastUpdated: "December 2024",
    sections: [
      {
        heading: "Service Agreement",
        content: [
          "By booking a cleaning service with Santos Cleaning Solutions, you agree to these terms. Our services include residential and commercial cleaning throughout the metro Atlanta area.",
          "All services are subject to availability and may be rescheduled with at least 24 hours' notice at no additional charge.",
        ],
      },
      {
        heading: "Pricing & Payment",
        content: [
          "Prices are based on home size, condition, and service type. We provide free estimates before any work begins. Payment is due upon completion of service unless other arrangements have been made.",
          "We accept all major credit cards, debit cards, and digital payment methods. A service fee may apply for returned payments.",
        ],
      },
      {
        heading: "Satisfaction Guarantee",
        content: [
          "We offer a 24-hour re-clean guarantee. If you are not satisfied with any aspect of our cleaning, contact us within 24 hours and we will return to address the issue at no additional cost.",
          "This guarantee applies to the specific areas of concern and does not constitute a full re-cleaning unless warranted.",
        ],
      },
      {
        heading: "Liability & Insurance",
        content: [
          "Santos Cleaning Solutions carries $1,000,000 in general liability insurance. In the unlikely event of accidental damage, our insurance covers repairs or replacement at fair market value.",
          "We are not liable for damage to items that are already in fragile or compromised condition unless specifically noted before service begins.",
        ],
      },
      {
        heading: "Cancellation Policy",
        content: [
          "Cancellations with less than 24 hours' notice may be subject to a cancellation fee of up to 50% of the scheduled service cost.",
          "No-shows without prior notice will be charged the full service amount. See our full Cancellation Policy for details.",
        ],
      },
      {
        heading: "Access & Safety",
        content: [
          "Clients must provide safe, reasonable access to the home or office. This includes securing pets and ensuring clear pathways. Our team reserves the right to decline service in unsafe conditions.",
        ],
      },
    ],
  },
  "cancellation-policy": {
    title: "Cancellation Policy",
    lastUpdated: "December 2024",
    sections: [
      {
        heading: "Standard Cancellation",
        content: [
          "We understand plans change. You may cancel or reschedule any cleaning appointment free of charge with at least 24 hours' notice before your scheduled service time.",
        ],
      },
      {
        heading: "Late Cancellation (Less Than 24 Hours)",
        content: [
          "Cancellations made with less than 24 hours' notice will be subject to a late cancellation fee of up to 50% of the scheduled service cost. This fee compensates our team for reserved time and scheduling adjustments.",
        ],
      },
      {
        heading: "No-Show Policy",
        content: [
          "If our team arrives at your home and is unable to enter or perform the service without prior communication, the full service amount may be charged. Please ensure we have updated access instructions and contact information.",
        ],
      },
      {
        heading: "Recurring Service Changes",
        content: [
          "For recurring (weekly, bi-weekly, or monthly) clients, you may skip or reschedule individual appointments with 24 hours' notice at no charge. To pause or cancel your recurring service, please provide at least one week's notice.",
          "There are no long-term contracts. You may cancel your recurring service at any time.",
        ],
      },
      {
        heading: "How to Cancel or Reschedule",
        content: [
          "You can cancel or reschedule by calling (866) 350-9407, texting us, or emailing contact@santoscsolutions.com. Please include your name, scheduled date, and whether you'd like to reschedule or cancel entirely.",
        ],
      },
      {
        heading: "Refund Policy",
        content: [
          "If you are unsatisfied with a completed service, please contact us within 24 hours. We offer a re-clean guarantee and will address any concerns before issuing a refund. Refunds, when applicable, are processed within 5-7 business days.",
        ],
      },
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    lastUpdated: "December 2024",
    sections: [
      {
        heading: "General Information",
        content: [
          "The information provided on this website is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind about the completeness, accuracy, reliability, or suitability of the information.",
        ],
      },
      {
        heading: "Service Estimates",
        content: [
          "All pricing shown on this website is estimated and for informational purposes only. Actual pricing may vary based on home size, condition, location, and specific service requirements. Final pricing is provided after a detailed assessment.",
        ],
      },
      {
        heading: "Results May Vary",
        content: [
          "While we strive for the highest quality cleaning results, outcomes may vary based on the condition of the home, type of surfaces, age of stains, and other factors. Our satisfaction guarantee covers re-cleaning of specific areas, not guaranteed removal of all stains or damage.",
        ],
      },
      {
        heading: "Third-Party Links",
        content: [
          "This website may contain links to third-party websites. These links are provided for convenience only and do not constitute an endorsement. We are not responsible for the content or practices of any linked websites.",
        ],
      },
      {
        heading: "Limitation of Liability",
        content: [
          "Santos Cleaning Solutions shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our services or this website. Our total liability shall not exceed the amount paid for the specific service in question.",
        ],
      },
      {
        heading: "Changes to This Disclaimer",
        content: [
          "We reserve the right to modify this disclaimer at any time. Changes will be posted on this page with an updated revision date.",
        ],
      },
    ],
  },
};

export default function Legal() {
  const params = useParams() as { page?: string };
  const pageSlug = params.page || "";
  const page = legalPages[pageSlug];

  if (!page) {
    return (
      <div className="min-h-screen bg-black w-full flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-display text-white mb-4">
              Page Not Found
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
        <title>{page.title} | Santos Cleaning Solutions</title>
        <meta name="description" content={`${page.title} for Santos Cleaning Solutions. Last updated ${page.lastUpdated}.`} />
        <link rel="canonical" href={`https://santoscsolutions.com/legal/${pageSlug}`} />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black to-black pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-white tracking-tight mb-3">
            {page.title}
          </h1>
          <p className="text-white/40 text-sm">
            Last updated: {page.lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {page.sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-xl font-display font-medium text-white mb-4">
                  {i + 1}. {section.heading}
                </h2>
                <div className="space-y-3">
                  {section.content.map((paragraph, j) => (
                    <p
                      key={j}
                      className="text-white/50 text-sm leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
            <p className="text-white/50 text-sm mb-4">
              Questions about this policy? Contact us anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="brand" size="sm" asChild>
                <a href="mailto:contact@santoscsolutions.com">
                  Email Us
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <a href="tel:8663509407">(866) 350-9407</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
