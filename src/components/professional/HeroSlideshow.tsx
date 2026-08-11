"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, ArrowRight, Star } from "lucide-react";
import { getProfessionals } from "@/lib/storage";
import { Professional } from "@/types";

const GRADIENTS = [
  { from: "#1A3A2A", to: "#2D5A3D", accent: "#E8D5A3" },
  { from: "#1E5B8A", to: "#1A3A2A", accent: "#7BAE8A" },
  { from: "#2D5A3D", to: "#3A8FBF", accent: "#C9A96E" },
  { from: "#1A3A2A", to: "#4A7C5E", accent: "#E8D5A3" },
];

interface Slide {
  id: string;
  title: string;
  category: string;
  city: string;
  description: string;
  plan: string;
  proId: string;
  gradient: typeof GRADIENTS[0];
}

export default function HeroSlideshow() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const pros = getProfessionals()
      .filter(p => p.status === "active")
      .sort((a, b) => {
        const order = { gold: 0, premium: 1, standard: 2 };
        return order[a.plan] - order[b.plan];
      })
      .slice(0, 5);

    if (pros.length === 0) {
      // Fallback demo slides
      setSlides([
        {
          id: "demo1", title: "Boulangerie des Pins", category: "Alimentation",
          city: "Mont-de-Marsan", description: "Artisan boulanger depuis 1987 — pains au levain et viennoiseries maison.",
          plan: "gold", proId: "demo1", gradient: GRADIENTS[0],
        },
        {
          id: "demo2", title: "Surf School Biscarrosse", category: "Sport & Loisirs",
          city: "Biscarrosse", description: "Cours de surf pour tous niveaux sur la côte atlantique landaise.",
          plan: "premium", proId: "demo3", gradient: GRADIENTS[1],
        },
      ]);
    } else {
      setSlides(pros.map((p, i) => ({
        id: p.id,
        title: p.companyName,
        category: p.category,
        city: p.city,
        description: p.description,
        plan: p.plan,
        proId: p.id,
        gradient: GRADIENTS[i % GRADIENTS.length],
      })));
    }
  }, []);

  const goTo = useCallback((index: number) => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrent(index);
      setFadeIn(true);
    }, 150);
  }, []);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  // Auto-advance
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, next, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      style={{ minHeight: "320px" }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `linear-gradient(135deg, ${slide.gradient.from} 0%, ${slide.gradient.to} 100%)`,
        }}
      />

      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-2xl"
        style={{ background: slide.gradient.accent, transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 blur-2xl"
        style={{ background: slide.gradient.accent, transform: "translate(-30%, 30%)" }} />

      {/* Content */}
      <div
        className="relative z-10 p-6 flex flex-col h-full"
        style={{ transition: "opacity 0.15s", opacity: fadeIn ? 1 : 0 }}
      >
        {/* Top badge */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full border border-white/20"
            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
          >
            {slide.category}
          </span>
          {slide.plan === "gold" && (
            <span className="flex items-center gap-1 text-xs font-bold bg-yellow-400/90 text-yellow-900 px-2.5 py-1 rounded-full">
              <Star className="w-3 h-3 fill-yellow-900" /> Gold
            </span>
          )}
          {slide.plan === "premium" && (
            <span className="text-xs font-bold bg-purple-400/90 text-white px-2.5 py-1 rounded-full">
              Premium
            </span>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{slide.title}</h3>
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: slide.gradient.accent }} />
            <span className="text-sm font-medium" style={{ color: slide.gradient.accent }}>{slide.city}</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-3">{slide.description}</p>
        </div>

        {/* CTA */}
        <div className="mt-4">
          <Link
            href={`/annuaire/${slide.proId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:gap-3"
            style={{ background: slide.gradient.accent, color: slide.gradient.from }}
          >
            Voir la fiche <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {isPlaying && slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
          <div
            key={current}
            className="h-full bg-white/50 origin-left"
            style={{
              animation: "slideProgress 4.5s linear forwards",
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes slideProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
