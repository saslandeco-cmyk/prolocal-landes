"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    label: "Boulangerie artisanale",
    category: "Alimentation",
    emoji: "🥖",
    from: "#3D1F0A",
    to:   "#7C3D1A",
    accent: "#E8C88A",
    icon: (
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Oven */}
        <rect x="15" y="45" width="90" height="45" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <rect x="20" y="50" width="80" height="20" rx="2" fill="rgba(255,120,0,0.3)"/>
        <circle cx="30" cy="75" r="4" fill="rgba(255,255,255,0.2)"/>
        <circle cx="45" cy="75" r="4" fill="rgba(255,255,255,0.2)"/>
        {/* Bread loaves */}
        <ellipse cx="35" cy="38" rx="18" ry="10" fill="rgba(255,200,100,0.7)" stroke="rgba(255,160,50,0.8)" strokeWidth="1"/>
        <path d="M20 38 Q35 25 50 38" stroke="rgba(200,130,30,0.6)" strokeWidth="1.5" fill="none"/>
        <ellipse cx="65" cy="35" rx="22" ry="12" fill="rgba(210,140,60,0.7)" stroke="rgba(180,110,30,0.8)" strokeWidth="1"/>
        <path d="M46 35 Q65 20 84 35" stroke="rgba(160,90,20,0.6)" strokeWidth="1.5" fill="none"/>
        {/* Rolling pin */}
        <rect x="70" y="58" width="30" height="6" rx="3" fill="rgba(255,255,255,0.25)" transform="rotate(-20 70 58)"/>
        {/* Steam */}
        <path d="M40 20 Q43 14 40 8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M55 18 Q58 12 55 6" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Menuiserie & Bois",
    category: "Bâtiment & Travaux",
    emoji: "🪵",
    from: "#1A2E1A",
    to:   "#2D5A1F",
    accent: "#A8D5A2",
    icon: (
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Workbench */}
        <rect x="10" y="65" width="100" height="8" rx="2" fill="rgba(180,120,60,0.5)" stroke="rgba(220,160,80,0.4)" strokeWidth="1"/>
        <rect x="15" y="73" width="8" height="20" rx="2" fill="rgba(160,100,40,0.4)"/>
        <rect x="97" y="73" width="8" height="20" rx="2" fill="rgba(160,100,40,0.4)"/>
        {/* Wood plank */}
        <rect x="20" y="50" width="75" height="14" rx="3" fill="rgba(180,120,60,0.6)" stroke="rgba(220,160,80,0.5)" strokeWidth="1"/>
        <line x1="35" y1="50" x2="35" y2="64" stroke="rgba(220,160,80,0.3)" strokeWidth="1"/>
        <line x1="55" y1="50" x2="55" y2="64" stroke="rgba(220,160,80,0.3)" strokeWidth="1"/>
        <line x1="75" y1="50" x2="75" y2="64" stroke="rgba(220,160,80,0.3)" strokeWidth="1"/>
        {/* Hand plane */}
        <rect x="38" y="35" width="40" height="14" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        <rect x="42" y="38" width="32" height="8" rx="2" fill="rgba(255,255,255,0.1)"/>
        <path d="M72 42 L82 48" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/>
        {/* Wood shavings */}
        <path d="M25 45 Q30 38 35 45" stroke="rgba(255,200,100,0.5)" strokeWidth="1.5" fill="none"/>
        <path d="M30 43 Q35 36 40 43" stroke="rgba(255,200,100,0.4)" strokeWidth="1" fill="none"/>
        {/* Saw */}
        <path d="M15 30 L50 20" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M20 30 L20 26 M25 28 L25 24 M30 27 L30 23 M35 25 L35 21 M40 24 L40 20 M45 22 L45 18" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    label: "Surf & Sports côtiers",
    category: "Sport & Fitness",
    emoji: "🏄",
    from: "#0A2A4A",
    to:   "#1A6B9A",
    accent: "#7DD3F7",
    icon: (
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Ocean waves */}
        <path d="M0 70 Q15 60 30 70 Q45 80 60 70 Q75 60 90 70 Q105 80 120 70 L120 100 L0 100Z" fill="rgba(255,255,255,0.08)"/>
        <path d="M0 80 Q20 68 40 78 Q60 88 80 78 Q100 68 120 78 L120 100 L0 100Z" fill="rgba(255,255,255,0.05)"/>
        {/* Surfboard */}
        <ellipse cx="65" cy="52" rx="8" ry="28" fill="rgba(255,200,50,0.7)" stroke="rgba(255,220,100,0.8)" strokeWidth="1" transform="rotate(-30 65 52)"/>
        <ellipse cx="65" cy="52" rx="3" ry="20" fill="rgba(255,100,50,0.4)" transform="rotate(-30 65 52)"/>
        {/* Surfer silhouette */}
        <circle cx="55" cy="38" r="6" fill="rgba(255,255,255,0.3)"/>
        <path d="M55 44 L52 58 L48 70" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M55 48 L45 52 M55 48 L64 44" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"/>
        {/* Spray / foam */}
        <path d="M30 65 Q35 55 42 62" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <circle cx="28" cy="62" r="2" fill="rgba(255,255,255,0.3)"/>
        <circle cx="22" cy="58" r="1.5" fill="rgba(255,255,255,0.2)"/>
        <circle cx="38" cy="56" r="1.5" fill="rgba(255,255,255,0.25)"/>
        {/* Sun */}
        <circle cx="95" cy="20" r="10" fill="rgba(255,220,80,0.3)"/>
        <circle cx="95" cy="20" r="6" fill="rgba(255,220,80,0.5)"/>
      </svg>
    ),
  },
  {
    label: "Hôtellerie & Gastronomie",
    category: "Restauration",
    emoji: "🍽️",
    from: "#2A1A0A",
    to:   "#5A2D0A",
    accent: "#F5C842",
    icon: (
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Plate */}
        <circle cx="60" cy="60" r="30" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
        <circle cx="60" cy="60" r="22" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        {/* Food */}
        <ellipse cx="60" cy="58" rx="14" ry="10" fill="rgba(180,80,20,0.5)"/>
        <ellipse cx="55" cy="55" rx="8" ry="6" fill="rgba(220,160,60,0.6)"/>
        <circle cx="65" cy="60" r="5" fill="rgba(80,160,40,0.5)"/>
        {/* Cutlery */}
        <line x1="25" y1="35" x2="28" y2="85" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 35 Q22 45 28 48" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none"/>
        <path d="M28 35 Q28 45 28 48" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        <line x1="92" y1="35" x2="90" y2="85" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M87 35 L87 48 Q89 52 90 48 L90 35" fill="rgba(255,255,255,0.2)"/>
        {/* Chef hat */}
        <path d="M45 28 Q60 15 75 28 L75 38 L45 38Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        <rect x="45" y="36" width="30" height="6" rx="1" fill="rgba(255,255,255,0.15)"/>
        <circle cx="60" cy="23" r="8" fill="rgba(255,255,255,0.15)"/>
        {/* Steam */}
        <path d="M54 10 Q57 4 54 -2" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M64 8 Q67 2 64 -4" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Gîtes & Hébergement",
    category: "Tourisme",
    emoji: "🏡",
    from: "#1A2A1A",
    to:   "#2D4A3D",
    accent: "#C9A96E",
    icon: (
      <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Trees */}
        <polygon points="15,70 25,40 35,70" fill="rgba(60,140,60,0.4)"/>
        <polygon points="20,65 25,45 30,65" fill="rgba(80,160,80,0.3)"/>
        <rect x="23" y="70" width="4" height="12" fill="rgba(120,80,40,0.4)"/>
        <polygon points="85,70 98,38 111,70" fill="rgba(60,140,60,0.4)"/>
        <polygon points="90,65 98,44 106,65" fill="rgba(80,160,80,0.3)"/>
        <rect x="95" y="70" width="5" height="12" fill="rgba(120,80,40,0.4)"/>
        {/* House */}
        <polygon points="40,55 60,30 80,55" fill="rgba(180,120,60,0.6)" stroke="rgba(200,140,70,0.5)" strokeWidth="1"/>
        <rect x="40" y="55" width="40" height="30" fill="rgba(220,180,120,0.3)" stroke="rgba(200,140,70,0.4)" strokeWidth="1"/>
        {/* Door */}
        <rect x="54" y="68" width="12" height="17" rx="6" fill="rgba(120,70,30,0.5)" stroke="rgba(150,90,40,0.4)" strokeWidth="1"/>
        {/* Windows */}
        <rect x="42" y="60" width="10" height="9" rx="1" fill="rgba(255,220,100,0.3)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        <line x1="47" y1="60" x2="47" y2="69" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
        <rect x="68" y="60" width="10" height="9" rx="1" fill="rgba(255,220,100,0.3)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
        <line x1="73" y1="60" x2="73" y2="69" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
        {/* Chimney smoke */}
        <rect x="68" y="38" width="6" height="12" fill="rgba(180,120,60,0.4)"/>
        <path d="M71 35 Q74 28 71 21" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Stars */}
        <circle cx="25" cy="20" r="1.5" fill="rgba(255,255,255,0.5)"/>
        <circle cx="95" cy="15" r="1" fill="rgba(255,255,255,0.4)"/>
        <circle cx="50" cy="12" r="1" fill="rgba(255,255,255,0.3)"/>
        <circle cx="80" cy="25" r="1.5" fill="rgba(255,255,255,0.4)"/>
      </svg>
    ),
  },
];

export default function CraftSlider() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade]       = useState(true);
  const [paused, setPaused]   = useState(false);

  const goTo = useCallback((idx: number) => {
    setFade(false);
    setTimeout(() => { setCurrent(idx); setFade(true); }, 200);
  }, []);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
      style={{ minHeight: 300 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{ background: `linear-gradient(135deg, ${slide.from} 0%, ${slide.to} 100%)` }}
      />

      {/* Glow */}
      <div
        className="absolute inset-0 opacity-20 blur-3xl transition-all duration-700"
        style={{ background: slide.accent, borderRadius: "50%", transform: "scale(0.8)" }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col h-full p-6"
        style={{ opacity: fade ? 1 : 0, transition: "opacity 0.2s ease" }}
      >
        {/* Category pill */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full border border-white/20"
            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)" }}
          >
            {slide.category}
          </span>
          <span className="text-2xl">{slide.emoji}</span>
        </div>

        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center py-4" style={{ minHeight: 160 }}>
          <div className="w-full max-w-[180px] h-[140px]">{slide.icon}</div>
        </div>

        {/* Label */}
        <div className="mt-2">
          <p className="text-lg font-bold text-white leading-tight">{slide.label}</p>
          <p className="text-xs mt-1" style={{ color: slide.accent }}>
            Artisans &amp; professionnels des Landes
          </p>
        </div>
      </div>

      {/* Arrows */}
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

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
          <div
            key={current}
            className="h-full bg-white/50 origin-left"
            style={{ animation: "craftProgress 4s linear forwards" }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes craftProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
