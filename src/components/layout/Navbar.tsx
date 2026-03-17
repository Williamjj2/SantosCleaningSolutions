import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const serviceLinks = [
  { name: "Regular Cleaning", href: "/regular-cleaning" },
  { name: "Deep Cleaning", href: "/deep-cleaning" },
  { name: "Move In/Out Cleaning", href: "/move-in-out-cleaning" },
  { name: "Office Cleaning", href: "/office-cleaning" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { name: "Why Us", href: "/#why-us" },
    { name: "Reviews", href: "/#reviews" },
    { name: "Areas", href: "/#areas" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const renderLink = (
    link: { name: string; href: string },
    className: string,
    onClick?: () => void
  ) => {
    if (link.href.startsWith("/") && !link.href.startsWith("/#")) {
      return (
        <Link
          key={link.name}
          href={link.href}
          onClick={onClick}
          className={className}
        >
          {link.name}
        </Link>
      );
    }
    return (
      <a
        key={link.name}
        href={link.href}
        onClick={onClick}
        className={className}
      >
        {link.name}
      </a>
    );
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          scrolled
            ? "bg-black/80 backdrop-blur-lg border-white/10 py-3"
            : "bg-transparent border-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/images/logo.png"
              alt="Santos Cleaning Solutions"
              className="w-10 h-10 object-contain"
            />
            <span className="font-display font-semibold text-lg tracking-wide text-white">
              Santos
              <span className="text-white/50 font-light">Cleaning</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {/* Services Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Services
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform",
                    servicesOpen && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-3 w-56 py-2 rounded-xl bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl"
                  >
                    {serviceLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setServicesOpen(false)}
                        className="block px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navLinks.map((link) =>
              renderLink(
                link,
                "text-sm font-medium text-white/70 hover:text-white transition-colors"
              )
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:8663509407"
              className="text-sm font-medium text-white/90 hover:text-blue-400 transition-colors"
            >
              (866) 350-9407
            </a>
            <Button variant="brand" size="sm" asChild>
              <a href="/#quote">Get Quote</a>
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white/80 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              {/* Services Section */}
              <div className="border-b border-white/10 pb-4">
                <span className="text-2xl font-display font-medium text-white block mb-3">
                  Services
                </span>
                <div className="flex flex-col gap-2 pl-4">
                  {serviceLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-lg text-white/60 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {navLinks.map((link) =>
                renderLink(
                  link,
                  "text-2xl font-display font-medium text-white border-b border-white/10 pb-4",
                  () => setMobileOpen(false)
                )
              )}

              <div className="pt-6 flex flex-col gap-4">
                <a
                  href="tel:8663509407"
                  className="text-xl font-medium text-blue-400"
                >
                  Call (866) 350-9407
                </a>
                <Button
                  variant="brand"
                  size="lg"
                  className="w-full"
                  asChild
                  onClick={() => setMobileOpen(false)}
                >
                  <a href="/#quote">Get Instant Quote</a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
