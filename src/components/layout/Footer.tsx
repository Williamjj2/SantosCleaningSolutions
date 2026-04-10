import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";

const SERVICE_AREAS = [
  { name: "Acworth", slug: "acworth" },
  { name: "Alpharetta", slug: "alpharetta" },
  { name: "Atlanta", slug: "atlanta" },
  { name: "Austell", slug: "austell" },
  { name: "Avondale Estates", slug: "avondale-estates" },
  { name: "Brookhaven", slug: "brookhaven" },
  { name: "Buckhead", slug: "buckhead" },
  { name: "Buford", slug: "buford" },
  { name: "Canton", slug: "canton" },
  { name: "Chamblee", slug: "chamblee" },
  { name: "Cumming", slug: "cumming" },
  { name: "Decatur", slug: "decatur" },
  { name: "Doraville", slug: "doraville" },
  { name: "Druid Hills", slug: "druid-hills" },
  { name: "Duluth", slug: "duluth" },
  { name: "Dunwoody", slug: "dunwoody" },
  { name: "East Cobb", slug: "east-cobb" },
  { name: "Flowery Branch", slug: "flowery-branch" },
  { name: "Gainesville", slug: "gainesville" },
  { name: "Grayson", slug: "grayson" },
  { name: "Holly Springs", slug: "holly-springs" },
  { name: "Johns Creek", slug: "johns-creek" },
  { name: "Kennesaw", slug: "kennesaw" },
  { name: "Lawrenceville", slug: "lawrenceville" },
  { name: "Lilburn", slug: "lilburn" },
  { name: "Loganville", slug: "loganville" },
  { name: "Mableton", slug: "mableton" },
  { name: "Marietta", slug: "marietta" },
  { name: "Milton", slug: "milton" },
  { name: "Mountain Park", slug: "mountain-park" },
  { name: "Norcross", slug: "norcross" },
  { name: "Peachtree Corners", slug: "peachtree-corners" },
  { name: "Powder Springs", slug: "powder-springs" },
  { name: "Roswell", slug: "roswell" },
  { name: "Sandy Springs", slug: "sandy-springs" },
  { name: "Smyrna", slug: "smyrna" },
  { name: "Snellville", slug: "snellville" },
  { name: "Stone Mountain", slug: "stone-mountain" },
  { name: "Sugar Hill", slug: "sugar-hill" },
  { name: "Suwanee", slug: "suwanee" },
  { name: "Tucker", slug: "tucker" },
  { name: "Vinings", slug: "vinings" },
  { name: "Woodstock", slug: "woodstock" },
];

export function Footer() {
  const [areasExpanded, setAreasExpanded] = useState(false);
  const visibleAreas = areasExpanded ? SERVICE_AREAS : SERVICE_AREAS.slice(0, 12);

  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 group mb-6">
              <img src="/images/logo.png" alt="Santos Cleaning Solutions" className="w-10 h-10 object-contain" />
              <span className="font-display font-semibold text-xl tracking-wide text-white">
                Santos<span className="text-white/50 font-light">Cleaning</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Premium house cleaning services for discerning homeowners in the greater Atlanta area. Licensed, insured, and 100% satisfaction guaranteed.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-medium mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:8663509407" className="flex items-center gap-3 text-white/60 hover:text-blue-400 transition-colors text-sm">
                  <Phone className="w-4 h-4" />
                  (866) 350-9407
                </a>
              </li>
              <li>
                <a href="mailto:contact@santoscsolutions.com" className="flex items-center gap-3 text-white/60 hover:text-blue-400 transition-colors text-sm">
                  <Mail className="w-4 h-4" />
                  contact@santoscsolutions.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/60 text-sm">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Serving Buckhead, Alpharetta, Sandy Springs & Metro Atlanta</span>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-medium mb-6">Services</h4>
            <ul className="space-y-3">
              <li><Link href="/regular-cleaning" className="text-white/60 hover:text-white transition-colors text-sm">Regular Cleaning</Link></li>
              <li><Link href="/deep-cleaning" className="text-white/60 hover:text-white transition-colors text-sm">Deep Cleaning</Link></li>
              <li><Link href="/move-in-out-cleaning" className="text-white/60 hover:text-white transition-colors text-sm">Move In/Out Cleaning</Link></li>
              <li><Link href="/office-cleaning" className="text-white/60 hover:text-white transition-colors text-sm">Office Cleaning</Link></li>
              <li><a href="/#calculator" className="text-white/60 hover:text-white transition-colors text-sm">Price Estimate</a></li>
              <li><Link href="/blog" className="text-white/60 hover:text-white transition-colors text-sm">Blog & Insights</Link></li>
              <li><Link href="/contact" className="text-white/60 hover:text-white transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal/Hours */}
          <div>
            <h4 className="text-white font-medium mb-6">Business Hours</h4>
            <ul className="space-y-2 text-sm text-white/60 mb-6">
              <li className="flex justify-between"><span>Monday - Saturday:</span> <span>8:00 AM - 3:00 PM</span></li>
              <li className="flex justify-between"><span>Sunday:</span> <span>Closed</span></li>
            </ul>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <span className="text-xs text-white/80 font-medium">Fully Licensed & Insured</span>
              <span className="text-xs text-white/50">$1M Liability Coverage</span>
            </div>
          </div>
        </div>

        {/* Service Areas Grid */}
        <div className="mb-12">
          <h4 className="text-white font-medium mb-4">Service Areas</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-2">
            {visibleAreas.map((area) => (
              <a
                key={area.slug}
                href={`/${area.slug}-house-cleaning/`}
                className="text-white/50 hover:text-white transition-colors text-xs"
              >
                {area.name}
              </a>
            ))}
          </div>
          {!areasExpanded && (
            <button
              onClick={() => setAreasExpanded(true)}
              className="mt-3 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
            >
              Show all {SERVICE_AREAS.length} cities +
            </button>
          )}
        </div>

        {/* Guides */}
        <div className="mb-12">
          <h4 className="text-white font-medium mb-4">Cleaning Guides</h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/guides/deep-cleaning" className="text-white/50 hover:text-white transition-colors text-xs">Deep Cleaning Guide</Link>
            <Link href="/guides/eco-friendly" className="text-white/50 hover:text-white transition-colors text-xs">Eco-Friendly Cleaning</Link>
            <Link href="/guides/moving" className="text-white/50 hover:text-white transition-colors text-xs">Moving Cleaning Guide</Link>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Santos Cleaning Solutions. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link href="/legal/privacy-policy" className="text-white/40 hover:text-white text-sm">Privacy Policy</Link>
            <Link href="/legal/terms-of-service" className="text-white/40 hover:text-white text-sm">Terms of Service</Link>
            <Link href="/legal/cancellation-policy" className="text-white/40 hover:text-white text-sm">Cancellation Policy</Link>
            <Link href="/legal/disclaimer" className="text-white/40 hover:text-white text-sm">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
