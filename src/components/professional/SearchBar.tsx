"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, X, TrendingUp } from "lucide-react";
import { getProfessionals } from "@/lib/storage";

const POPULAR = [
  "Plombier", "Électricien", "Maçon", "Surf", "Restaurant",
  "Coiffeur", "Médecin", "Déménagement", "Informatique", "Yoga",
];

const LANDES_CITIES = [
  "Mont-de-Marsan", "Dax", "Biscarrosse", "Capbreton", "Hossegor",
  "Mimizan", "Parentis-en-Born", "Hagetmau", "Tarnos", "Soustons",
  "Morcenx", "Aire-sur-l'Adour", "Tartas", "Labouheyre", "Sabres",
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

interface SearchBarProps {
  initialQuery?: string;
  initialLocation?: string;
  compact?: boolean;
}

export default function SearchBar({
  initialQuery = "",
  initialLocation = "",
  compact = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query,    setQuery]    = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSug,  setShowSug]  = useState(false);
  const [showCity, setShowCity] = useState(false);
  const [focused,  setFocused]  = useState<"query" | "city" | null>(null);
  const queryRef   = useRef<HTMLDivElement>(null);
  const cityRef    = useRef<HTMLDivElement>(null);

  // Build keyword suggestions from pros
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    const q = query.toLowerCase();
    const pros = getProfessionals().filter(p => p.status === "active");
    const hits = new Set<string>();

    pros.forEach(p => {
      // Company name
      if (p.companyName.toLowerCase().includes(q)) hits.add(p.companyName);
      // Category
      if (p.category.toLowerCase().includes(q)) hits.add(p.category);
      // Services
      (p.services || []).forEach(s => { if (s.toLowerCase().includes(q)) hits.add(s); });
      // Description words
      const words = stripHtml(p.description).split(/\s+/);
      words.forEach(w => {
        if (w.length > 3 && w.toLowerCase().includes(q)) hits.add(w);
      });
    });

    // Also include popular keywords matching query
    POPULAR.forEach(k => { if (k.toLowerCase().includes(q)) hits.add(k); });

    setSuggestions(Array.from(hits).slice(0, 7));
  }, [query]);

  // City suggestions
  useEffect(() => {
    if (!location.trim()) { setCitySuggestions([]); return; }
    const q = location.toLowerCase();
    setCitySuggestions(
      LANDES_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 5)
    );
  }, [location]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!queryRef.current?.contains(e.target as Node))  setShowSug(false);
      if (!cityRef.current?.contains(e.target as Node))   setShowCity(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = useCallback((q = query, loc = location) => {
    setShowSug(false);
    setShowCity(false);
    const params = new URLSearchParams();
    if (q.trim())   params.set("q",    q.trim());
    if (loc.trim()) params.set("city", loc.trim());
    router.push(`/annuaire?${params.toString()}`);
  }, [query, location, router]);

  const pickSuggestion = (s: string) => {
    setQuery(s);
    setShowSug(false);
    handleSearch(s, location);
  };

  const pickCity = (c: string) => {
    setLocation(c);
    setShowCity(false);
    handleSearch(query, c);
  };

  const fieldPad = compact ? "px-4 py-3" : "px-5 py-4";
  const btnPad   = compact ? "px-6 py-3" : "px-8 py-4";

  return (
    <form
      onSubmit={e => { e.preventDefault(); handleSearch(); }}
      className="w-full bg-white rounded-2xl shadow-2xl overflow-visible"
    >
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

        {/* ── Keyword field ── */}
        <div className="flex-1 relative" ref={queryRef}>
          <div className={`flex items-center gap-3 ${fieldPad}`}>
            <Search className="w-5 h-5 text-landes-sage flex-shrink-0" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setShowSug(true); }}
              onFocus={() => { setFocused("query"); setShowSug(true); }}
              onBlur={() => setFocused(null)}
              placeholder="Métier, entreprise, service, mots-clés…"
              className="w-full text-gray-800 placeholder-gray-400 text-base focus:outline-none bg-transparent"
              autoComplete="off"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(""); setSuggestions([]); }}
                className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown suggestions */}
          {showSug && (suggestions.length > 0 || (!query && POPULAR.length > 0)) && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-b-xl shadow-lg z-50 overflow-hidden">
              {!query && (
                <div className="px-4 pt-3 pb-1 flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" /> Recherches populaires
                </div>
              )}
              {(query ? suggestions : POPULAR).map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => pickSuggestion(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-landes-forest/5 text-left transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-landes-sage flex-shrink-0" />
                  <span className="text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: query
                        ? s.replace(new RegExp(`(${query})`, "gi"), "<strong>$1</strong>")
                        : s
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-gray-100 self-stretch" />

        {/* ── Location field ── */}
        <div className="flex-1 relative" ref={cityRef}>
          <div className={`flex items-center gap-3 ${fieldPad}`}>
            <MapPin className="w-5 h-5 text-landes-sage flex-shrink-0" />
            <input
              value={location}
              onChange={e => { setLocation(e.target.value); setShowCity(true); }}
              onFocus={() => { setFocused("city"); setShowCity(true); }}
              onBlur={() => setFocused(null)}
              placeholder="Ville ou code postal…"
              className="w-full text-gray-800 placeholder-gray-400 text-base focus:outline-none bg-transparent"
              autoComplete="off"
            />
            {location && (
              <button type="button" onClick={() => { setLocation(""); setCitySuggestions([]); }}
                className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* City dropdown */}
          {showCity && citySuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-b-xl shadow-lg z-50 overflow-hidden">
              {citySuggestions.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => pickCity(c)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-landes-forest/5 text-left transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-landes-sage flex-shrink-0" />
                  <span className="text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: c.replace(new RegExp(`(${location})`, "gi"), "<strong>$1</strong>")
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`flex items-center justify-center gap-2 bg-landes-forest hover:bg-landes-pine text-white font-semibold text-base ${btnPad} transition-colors whitespace-nowrap rounded-b-2xl sm:rounded-b-none sm:rounded-r-2xl`}
        >
          <Search className="w-5 h-5" />
          <span>Rechercher</span>
        </button>
      </div>
    </form>
  );
}
