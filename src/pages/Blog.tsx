import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { blogPosts, blogCategories, loadDynamicPosts, getAllPosts, getBlogCategories, type BlogPost } from "@/lib/blogPosts";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);
  const [categories, setCategories] = useState<string[]>(blogCategories);

  useEffect(() => {
    loadDynamicPosts().then((allPosts) => {
      setPosts(allPosts);
      setCategories(getBlogCategories());
    });
  }, []);

  const filtered =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-black w-full flex flex-col font-sans">
      <Helmet>
        <title>Cleaning Tips & Insights Blog | Santos Cleaning Solutions</title>
        <meta name="description" content="Expert cleaning tips, home maintenance guides, and local insights for Atlanta homeowners. Learn from Santos Cleaning Solutions' professional team." />
        <link rel="canonical" href="https://santoscsolutions.com/blog" />
      </Helmet>
      <SchemaMarkup type="blog" />
      <Navbar />

      {/* Hero Header */}
      <header className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-black to-black pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-medium text-white tracking-tight mb-4">
            Cleaning Tips & <span className="text-gradient-brand italic">Insights</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Expert cleaning tips, home maintenance guides, and local insights for Atlanta homeowners.
          </p>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-500/90 text-white text-xs font-medium">
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-4 text-xs text-white/40 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-white mb-3 leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-sm text-white/50 leading-relaxed mb-4 flex-1 line-clamp-3">
                      {post.description}
                    </p>

                    <span className="flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">No articles found in this category.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
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
