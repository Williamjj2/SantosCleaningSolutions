import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getBlogPost, getRelatedPosts, loadDynamicPosts } from "@/lib/blogPosts";
import { Calendar, MapPin, Clock, ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SchemaMarkup } from "@/components/SchemaMarkup";

export default function BlogPost() {
  const params = useParams() as { slug?: string };
  const slug = params.slug || "";
  const [dynamicContent, setDynamicContent] = useState<string | null>(null);
  const [post, setPost] = useState(getBlogPost(slug));
  const related = getRelatedPosts(slug, 3);

  useEffect(() => {
    // Load dynamic posts first (in case this is a Supabase post)
    loadDynamicPosts().then(() => {
      const found = getBlogPost(slug);
      if (found) setPost(found);
    });
    // Fetch full content from API
    fetch(`/api/blog/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.post?.content) {
          setDynamicContent(data.post.content);
        }
      })
      .catch(() => {});
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-black w-full flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-display text-white mb-4">Article Not Found</h1>
            <p className="text-white/50 mb-8">The article you're looking for doesn't exist.</p>
            <Button variant="brand" asChild>
              <Link href="/blog">Back to Blog</Link>
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
        <title>{post.title} | Santos Cleaning Blog</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={`https://santoscsolutions.com/blog/${post.slug}/`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:image" content={post.image} />
        <meta property="og:url" content={`https://santoscsolutions.com/blog/${post.slug}/`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={post.image} />
      </Helmet>
      <SchemaMarkup
        type="article"
        data={{
          title: post.title,
          description: post.description,
          image: post.image,
          date: post.date,
          category: post.category,
          breadcrumbs: [
            { name: "Home", url: "https://santoscsolutions.com" },
            { name: "Blog", url: "https://santoscsolutions.com/blog" },
            { name: post.title, url: `https://santoscsolutions.com/blog/${post.slug}/` },
          ],
        }}
      />
      <Navbar />

      {/* Hero with Image */}
      <header className="relative pt-24">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-sm text-white/40 mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-white/60 truncate">{post.title}</span>
              </nav>

              <span className="inline-block px-3 py-1 rounded-full bg-blue-500/90 text-white text-xs font-medium mb-4">
                {post.category}
              </span>

              <h1 className="text-3xl md:text-5xl font-display font-medium text-white tracking-tight leading-tight mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-sm text-white/50">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.date)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {post.location}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Article Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            <p className="text-xl text-white/70 leading-relaxed mb-8">
              {post.description}
            </p>

            <div className="space-y-8 text-white/70 leading-relaxed">
              {dynamicContent ? (
                <MarkdownContent content={dynamicContent} />
              ) : (
                <ArticleContent slug={post.slug} location={post.location} />
              )}
            </div>
          </article>

          {/* CTA Box */}
          <div className="mt-16 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-500/20 text-center">
            <h3 className="text-2xl md:text-3xl font-display text-white mb-4">
              Ready for a Spotless Home in {post.location.split(",")[0]}?
            </h3>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Santos Cleaning Solutions provides professional cleaning services throughout the Atlanta Metro area.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="brand" size="lg" className="h-14 px-8 text-lg" asChild>
                <a href="/#quote">Get Free Quote</a>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg text-white border-white/20 hover:bg-white/10" asChild>
                <a href="tel:8663509407" className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  (866) 350-9407
                </a>
              </Button>
            </div>
          </div>

          {/* Related Posts */}
          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="text-2xl font-display text-white mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="group block"
                  >
                    <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all">
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={rp.image}
                          alt={rp.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <div className="p-5">
                        <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                          {rp.title}
                        </h4>
                        <span className="text-xs text-white/40">{rp.location}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to Blog */}
          <div className="mt-16 flex justify-between items-center">
            <Link href="/blog" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
            <a href="/#quote" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
              Get a Quote <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ArticleContent({ slug, location }: { slug: string; location: string }) {
  const city = location.split(",")[0].trim();

  const contentMap: Record<string, JSX.Element> = {
    "deep-cleaning": (
      <>
        <Section title="Why Deep Cleaning Matters">
          <p>A thorough deep cleaning goes beyond regular maintenance. It reaches the hidden areas where dust, allergens, and bacteria accumulate over time. For {city} homeowners, seasonal deep cleaning is especially important due to Atlanta's high pollen counts and humidity levels.</p>
        </Section>
        <Section title="Kitchen Deep Cleaning Checklist">
          <ul className="list-disc pl-6 space-y-2">
            <li>Clean inside and behind refrigerator, including coils</li>
            <li>Degrease range hood and vent filters</li>
            <li>Scrub oven interior and stovetop thoroughly</li>
            <li>Wipe down all cabinet fronts and handles</li>
            <li>Clean inside microwave, dishwasher, and small appliances</li>
            <li>Sanitize countertops, backsplash, and sink</li>
          </ul>
        </Section>
        <Section title="Bathroom Deep Cleaning">
          <ul className="list-disc pl-6 space-y-2">
            <li>Scrub tile grout and re-seal if needed</li>
            <li>Deep clean toilet including base and behind</li>
            <li>Remove hard water deposits from shower doors and fixtures</li>
            <li>Clean exhaust fan and light fixtures</li>
            <li>Wash shower curtain and bath mats</li>
          </ul>
        </Section>
        <Section title="Living Areas & Bedrooms">
          <ul className="list-disc pl-6 space-y-2">
            <li>Dust ceiling fans, light fixtures, and vents</li>
            <li>Clean baseboards and window sills</li>
            <li>Vacuum under and behind furniture</li>
            <li>Wash windows inside and out</li>
            <li>Deep clean carpets or polish hardwood floors</li>
            <li>Flip and vacuum mattresses</li>
          </ul>
        </Section>
        <TipBox>Schedule deep cleaning at least twice a year — once in spring to remove winter buildup and pollen, and once in fall before the holiday season.</TipBox>
      </>
    ),
    "move-out": (
      <>
        <Section title="Getting Your Full Deposit Back">
          <p>Moving out of your {city} apartment? A thorough cleaning is essential for getting your full security deposit back. Landlords and property managers inspect every detail — from baseboards to light fixtures. Here's your complete move-out cleaning guide.</p>
        </Section>
        <Section title="Kitchen Checklist">
          <ul className="list-disc pl-6 space-y-2">
            <li>Clean inside all cabinets and drawers</li>
            <li>Deep clean oven, stovetop, and range hood</li>
            <li>Clean refrigerator inside and out (remove all shelves and drawers)</li>
            <li>Sanitize countertops, backsplash, and sink</li>
            <li>Clean dishwasher interior and exterior</li>
            <li>Wipe down all appliance surfaces</li>
          </ul>
        </Section>
        <Section title="Bathroom Checklist">
          <ul className="list-disc pl-6 space-y-2">
            <li>Scrub tub, shower, and tile grout</li>
            <li>Clean toilet thoroughly, including behind and around base</li>
            <li>Remove soap scum and hard water stains</li>
            <li>Clean mirrors and glass surfaces</li>
            <li>Wipe down vanity, medicine cabinet, and fixtures</li>
          </ul>
        </Section>
        <Section title="General Areas">
          <ul className="list-disc pl-6 space-y-2">
            <li>Clean all light fixtures and ceiling fans</li>
            <li>Wipe down all baseboards and door frames</li>
            <li>Clean inside all closets (shelves, rods, floors)</li>
            <li>Patch and paint small nail holes</li>
            <li>Vacuum and mop all floors</li>
            <li>Clean windows, blinds, and window tracks</li>
          </ul>
        </Section>
        <TipBox>Take photos of every room after cleaning. This documentation protects you if there's a deposit dispute with your landlord.</TipBox>
      </>
    ),
    "pet-friendly": (
      <>
        <Section title="Safe Cleaning with Pets at Home">
          <p>As a pet owner in {city}, keeping your home clean without exposing your furry family to harsh chemicals is a top priority. Here are professional strategies for maintaining a spotless, pet-safe home.</p>
        </Section>
        <Section title="Non-Toxic Cleaning Solutions">
          <ul className="list-disc pl-6 space-y-2">
            <li>Use vinegar and baking soda for general surface cleaning</li>
            <li>Choose plant-based, enzymatic cleaners for pet accidents</li>
            <li>Avoid products with bleach, ammonia, or phenols near pets</li>
            <li>Use HEPA vacuums to capture pet dander and allergens</li>
            <li>Wash pet bedding weekly in hot water with fragrance-free detergent</li>
          </ul>
        </Section>
        <Section title="Managing Pet Hair & Odors">
          <ul className="list-disc pl-6 space-y-2">
            <li>Vacuum high-traffic areas daily during shedding season</li>
            <li>Use rubber gloves or lint rollers on upholstery</li>
            <li>Sprinkle baking soda on carpets before vacuuming for odor control</li>
            <li>Groom pets regularly to reduce loose fur</li>
            <li>Use air purifiers with HEPA filters in main living areas</li>
          </ul>
        </Section>
        <TipBox>Keep pets out of freshly cleaned rooms for at least 30 minutes, even when using natural products. This allows surfaces to dry completely.</TipBox>
      </>
    ),
    "trends": (
      <>
        <Section title="Eco-Friendly Cleaning Revolution">
          <p>{city} homeowners are increasingly turning to eco-friendly cleaning products that minimize environmental impact while improving indoor air quality. This shift towards non-toxic, biodegradable cleaners is about both sustainability and health.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Green Products</strong>: Plant-based, hypoallergenic cleaning agents ensure homes remain free from harmful chemicals</li>
            <li><strong>DIY Solutions</strong>: Homemade solutions using vinegar and baking soda are effective and safe for families and pets</li>
          </ul>
        </Section>
        <Section title="Smart Cleaning Technology">
          <p>Technological advancements are revolutionizing cleaning routines. From robotic vacuums to smart home integrations, these technologies make home maintenance more efficient.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Robotic Cleaners</strong>: AI-powered systems like Roomba and Roborock enhance daily floor maintenance</li>
            <li><strong>App-Based Control</strong>: Manage cleaning schedules and monitor tasks through smart home integrations</li>
          </ul>
        </Section>
        <Section title="Personalized Cleaning Services">
          <p>The demand for personalized cleaning services is growing, with options tailored to individual household needs.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Custom Plans</strong>: Flexible subscription models — weekly, bi-weekly, or monthly services</li>
            <li><strong>Specialized Services</strong>: Air duct cleaning, upholstery care, and seasonal services for pollen and humidity</li>
          </ul>
        </Section>
        <TipBox>Incorporate green cleaning products to enhance air quality and invest in smart cleaning technologies to save time and increase efficiency.</TipBox>
      </>
    ),
    "default": (
      <>
        <Section title={`Professional Cleaning Tips for ${city}`}>
          <p>Maintaining a clean home in the Atlanta metro area comes with unique challenges — from red clay stains to high pollen counts. Here are expert tips to keep your {city} home spotless year-round.</p>
        </Section>
        <Section title="Essential Cleaning Strategies">
          <ul className="list-disc pl-6 space-y-2">
            <li>Establish a daily cleaning routine for high-traffic areas</li>
            <li>Use microfiber cloths for dusting — they capture particles instead of spreading them</li>
            <li>Clean top-to-bottom, room by room for efficiency</li>
            <li>Keep windows closed during peak pollen season and clean HVAC filters monthly</li>
            <li>Address spills and stains immediately to prevent permanent damage</li>
          </ul>
        </Section>
        <Section title="When to Hire Professional Help">
          <p>While regular maintenance can be handled DIY, certain situations call for professional cleaning:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Post-renovation or construction cleanup</li>
            <li>Move-in or move-out cleaning for deposit recovery</li>
            <li>Deep cleaning before holiday gatherings or special events</li>
            <li>Managing allergens during Atlanta's intense pollen seasons</li>
          </ul>
        </Section>
        <TipBox>Santos Cleaning Solutions serves {city} and the entire Atlanta Metro area. Our eco-friendly products are safe for children and pets while delivering professional-grade results.</TipBox>
      </>
    ),
  };

  const key = slug.includes("deep-cleaning") || slug.includes("checklist")
    ? "deep-cleaning"
    : slug.includes("move-out")
      ? "move-out"
      : slug.includes("pet-friendly")
        ? "pet-friendly"
        : slug.includes("trends") || slug.includes("revolution") || slug.includes("innovative")
          ? "trends"
          : "default";

  const content = contentMap[key] || contentMap["default"];

  // Replace {city} placeholder
  return <div>{content}</div>;
}

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown to HTML renderer
  const html = content
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-display text-blue-300 mb-3 mt-8">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-display text-blue-400 mb-4 mt-10">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-display text-white mb-4 mt-10">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 list-decimal">$1. $2</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (match) => `<ul class="space-y-2 my-4">${match}</ul>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 underline hover:text-blue-300">$1</a>')
    .replace(/^(?!<[hulo])(.*\S.*)$/gm, '<p class="mb-4">$1</p>');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-display text-blue-400 mb-4">{title}</h2>
      <div className="text-white/70 leading-relaxed space-y-4">{children}</div>
    </div>
  );
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 my-8">
      <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
        <span className="text-lg">💡</span> Pro Tip
      </h4>
      <p className="text-white/70">{children}</p>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
