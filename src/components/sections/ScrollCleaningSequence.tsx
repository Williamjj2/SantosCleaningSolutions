import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 96;
const basePath = import.meta.env.BASE_URL;

function padNumber(n: number): string {
  return String(n).padStart(3, "0");
}

function getFrameSrc(index: number): string {
  const clamped = Math.max(1, Math.min(index, TOTAL_FRAMES));
  return `${basePath}images/scroll-frames/frame-${padNumber(clamped)}.jpg`;
}

// Lerp for buttery smooth interpolation
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface FeatureCard {
  title: string;
  subtitle: string;
  description: string;
  range: [number, number];
  align: "left" | "right";
}

const features: FeatureCard[] = [
  {
    title: "Deep Clean",
    subtitle: "EVERY SURFACE",
    description:
      "Our team meticulously cleans every countertop, appliance, and surface — leaving your kitchen spotless and sanitized.",
    range: [0.08, 0.3],
    align: "left",
  },
  {
    title: "Eco-Friendly",
    subtitle: "PREMIUM PRODUCTS",
    description:
      "We use only non-toxic, eco-friendly cleaning products that are safe for your family, pets, and the environment.",
    range: [0.35, 0.57],
    align: "right",
  },
  {
    title: "Attention to Detail",
    subtitle: "NOTHING OVERLOOKED",
    description:
      "From inside cabinets to behind appliances — we clean the spaces others miss. That's the Santos difference.",
    range: [0.62, 0.82],
    align: "left",
  },
];

function getCardOpacity(progress: number, range: [number, number]) {
  const [start, end] = range;
  const fadeIn = 0.06;
  const fadeOut = 0.06;
  if (progress < start || progress > end) return 0;
  if (progress < start + fadeIn) return (progress - start) / fadeIn;
  if (progress > end - fadeOut) return (end - progress) / fadeOut;
  return 1;
}

function getCardY(progress: number, range: [number, number]) {
  const [start, end] = range;
  const mid = (start + end) / 2;
  if (progress < start) return 50;
  if (progress > end) return -50;
  if (progress < mid) return 50 * (1 - (progress - start) / (mid - start));
  return -50 * ((progress - mid) / (end - mid));
}

export function ScrollCleaningSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // These refs drive the animation loop WITHOUT re-renders
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const lastDrawnFrame = useRef(-1);
  const rafId = useRef(0);

  // This state is only updated at ~15fps for the text overlays
  const [displayProgress, setDisplayProgress] = useState(0);
  const displayThrottle = useRef(0);

  const frameIndices = useMemo(
    () => Array.from({ length: TOTAL_FRAMES }, (_, i) => i + 1),
    [],
  );

  // Preload frames
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = [];

    frameIndices.forEach((idx) => {
      const img = new Image();
      img.src = getFrameSrc(idx);
      img.onload = () => {
        loaded++;
        if (loaded === TOTAL_FRAMES) {
          imagesRef.current = images;
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded === TOTAL_FRAMES) {
          imagesRef.current = images;
          setImagesLoaded(true);
        }
      };
      images[idx - 1] = img;
    });
  }, [frameIndices]);

  // Draw frame - called from rAF, no React involvement
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Only resize canvas if dimensions changed
    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }

    ctx.drawImage(img, 0, 0);
  }, []);

  // Animation loop - runs at 60fps, lerps smoothly between frames
  useEffect(() => {
    if (!imagesLoaded) return;

    const tick = () => {
      // Smooth interpolation toward target (0.025 = cinematic, TAG Heuer-level smoothness)
      currentProgress.current = lerp(
        currentProgress.current,
        targetProgress.current,
        0.025,
      );

      const frameIndex = Math.round(
        currentProgress.current * (TOTAL_FRAMES - 1),
      );

      // Only draw if frame actually changed
      if (frameIndex !== lastDrawnFrame.current) {
        drawFrame(frameIndex);
        lastDrawnFrame.current = frameIndex;
      }

      // Throttle React state updates for text (~15fps)
      const now = performance.now();
      if (now - displayThrottle.current > 66) {
        displayThrottle.current = now;
        setDisplayProgress(currentProgress.current);
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [imagesLoaded, drawFrame]);

  // ScrollTrigger - only updates the ref, no state
  useEffect(() => {
    if (!containerRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        targetProgress.current = self.progress;
      },
    });

    return () => trigger.kill();
  }, []);

  // Derived values for UI
  const p = displayProgress;
  const ctaOpacity = p > 0.87 ? Math.min((p - 0.87) / 0.1, 1) : 0;
  const ctaY = p > 0.87 ? (1 - (p - 0.87) / 0.13) * 40 : 40;
  const scale = 1 + p * 0.08;

  return (
    <section ref={containerRef} className="h-[400vh] relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Video frames canvas - with subtle zoom */}
        <div
          className="absolute inset-0 z-0 will-change-transform"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ objectFit: "cover", display: "block" }}
          />
        </div>

        {/* Loading */}
        {!imagesLoaded && (
          <div className="absolute inset-0 z-[1] flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/40 text-sm tracking-widest uppercase">
                Loading experience
              </p>
            </div>
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-[2] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-[2] pointer-events-none" />

        {/* Feature cards with smooth transitions */}
        <div className="absolute inset-0 z-10">
          <div className="h-full max-w-7xl mx-auto px-6 lg:px-12 flex items-center">
            {features.map((feature, i) => {
              const opacity = getCardOpacity(p, feature.range);
              const y = getCardY(p, feature.range);

              return (
                <div
                  key={i}
                  className={`absolute max-w-md will-change-transform ${
                    feature.align === "left"
                      ? "left-6 lg:left-12"
                      : "right-6 lg:right-12"
                  }`}
                  style={{
                    opacity,
                    transform: `translate3d(0, ${y}px, 0)`,
                    pointerEvents: opacity > 0.5 ? "auto" : "none",
                  }}
                >
                  <p className="text-blue-400 text-xs font-semibold tracking-[0.3em] uppercase mb-3">
                    {feature.subtitle}
                  </p>
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                    {feature.title}
                  </h3>
                  <div className="mt-4 w-12 h-[2px] bg-blue-500" />
                  <p className="mt-5 text-base md:text-lg text-white/60 leading-relaxed max-w-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final CTA */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center will-change-transform"
          style={{
            opacity: ctaOpacity,
            transform: `translate3d(0, ${ctaY}px, 0)`,
            pointerEvents: ctaOpacity > 0.5 ? "auto" : "none",
          }}
        >
          <div className="text-center">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent drop-shadow-2xl">
              The Santos
              <br />
              Promise.
            </h2>
            <div className="mt-6 w-16 h-1 bg-blue-500 rounded-full mx-auto" />
            <p className="mt-6 text-white/50 text-lg tracking-wide">
              100% Satisfaction Guaranteed
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div className="h-[2px] bg-white/10">
            <div
              className="h-full bg-blue-500 will-change-transform"
              style={{
                width: `${p * 100}%`,
                transition: "none",
              }}
            />
          </div>
          <div className="flex justify-between px-6 lg:px-12 py-3">
            <span
              className={`text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 ${
                p < 0.35 ? "text-blue-400" : "text-white/20"
              }`}
            >
              Before
            </span>
            <span
              className={`text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 ${
                p >= 0.35 && p < 0.7 ? "text-blue-400" : "text-white/20"
              }`}
            >
              Cleaning
            </span>
            <span
              className={`text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 ${
                p >= 0.7 ? "text-blue-400" : "text-white/20"
              }`}
            >
              After
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
