"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Search, MapPin, ArrowRight, ChevronRight, X, TrendingUp } from "lucide-react";
import { DEFAULT_BANNERS } from "@/lib/defaultBanners";
import { getProfessionals } from "@/lib/storage";
import { Professional } from "@/types";
import ProfessionalCard from "@/components/professional/ProfessionalCard";

const MultiMap = dynamic(() => import("@/components/map/MultiMap"), { ssr: false });

export interface CategoryMeta {
  slug: string;
  category: string;          // exact match with CATEGORIES
  emoji: string;
  title: string;             // H1
  subtitle: string;          // hero subtitle
  seoTitle: string;          // H2 SEO section
  seoText: string[];         // paragraphs (HTML string)
  ctaText: string;           // bottom CTA description
  demoPros: Omit<Professional, "createdAt" | "updatedAt">[];
}

interface Props {
  meta: CategoryMeta;
}

export default function CategoryPage({ meta }: Props) {
  const [pros, setPros]           = useState<Professional[]>([]);
  const [filtered, setFiltered]   = useState<Professional[]>([]);
  const [query, setQuery]         = useState("");
  const [location, setLocation]   = useState("");
  const [suggestions, setSuggestions]         = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSug,  setShowSug]    = useState(false);
  const [showCity, setShowCity]   = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const queryRef = useRef<HTMLDivElement>(null);
  const cityRef  = useRef<HTMLDivElement>(null);
  const now = useRef(new Date().toISOString()).current;

  const POPULAR_CAT = ["Artisan", "Boutique", "Devis gratuit", "Sur-mesure", "Livraison", "Local"];
  const LANDES_CITIES = [
    "Mont-de-Marsan","Dax","Biscarrosse","Capbreton","Hossegor",
    "Mimizan","Parentis-en-Born","Hagetmau","Tarnos","Soustons",
    "Morcenx","Aire-sur-l'Adour","Tartas","Labouheyre","Sabres",
    "Saint-Paul-lès-Dax","Tyrosse","Ondres","Soorts-Hossegor","Vieux-Boucau-les-Bains",
  ];

  useEffect(() => {
    const real = getProfessionals().filter(
      p => p.status === "active" && p.category === meta.category
    );
    const merged = [...real];
    meta.demoPros.forEach(d => {
      if (!merged.find(p => p.id === d.id))
        merged.push({ ...d, createdAt: now, updatedAt: now });
    });
    const order: Record<string, number> = { gold: 0, premium: 1, standard: 2 };
    merged.sort((a, b) => order[a.plan] - order[b.plan]);
    setPros(merged);
    setFiltered(merged);
    setMapLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.category]);

  // Suggestions mots-clés
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    const q = query.toLowerCase();
    const hits = new Set<string>();
    pros.forEach(p => {
      if (p.companyName.toLowerCase().includes(q)) hits.add(p.companyName);
      (p.services || []).forEach(s => { if (s.toLowerCase().includes(q)) hits.add(s); });
    });
    POPULAR_CAT.forEach(k => { if (k.toLowerCase().includes(q)) hits.add(k); });
    setSuggestions(Array.from(hits).slice(0, 6));
  }, [query, pros]);

  // Suggestions villes
  useEffect(() => {
    if (!location.trim()) { setCitySuggestions([]); return; }
    const q = location.toLowerCase();
    setCitySuggestions(LANDES_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 5));
  }, [location]);

  // Ferme dropdowns au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!queryRef.current?.contains(e.target as Node)) setShowSug(false);
      if (!cityRef.current?.contains(e.target as Node))  setShowCity(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applyFilter = useCallback((q: string, loc: string) => {
    const qLow   = q.trim().toLowerCase();
    const locLow = loc.trim().toLowerCase();
    setFiltered(pros.filter(p => {
      const desc = p.description.replace(/<[^>]*>/g, " ").toLowerCase();
      const svcs = (p.services || []).join(" ").toLowerCase();
      const matchQ = !qLow || (
        p.companyName.toLowerCase().includes(qLow) ||
        p.category.toLowerCase().includes(qLow) ||
        desc.includes(qLow) ||
        p.city.toLowerCase().includes(qLow) ||
        svcs.includes(qLow)
      );
      const matchLoc = !locLow || (
        p.city.toLowerCase().includes(locLow) ||
        p.postalCode.includes(locLow)
      );
      return matchQ && matchLoc;
    }));
  }, [pros]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q); applyFilter(q, location);
  }, [applyFilter, location]);

  const handleLocation = useCallback((loc: string) => {
    setLocation(loc); applyFilter(query, loc);
  }, [applyFilter, query]);

  const mapPros = pros.filter(p => p.lat && p.lng);

  return (
    <div className="bg-landes-cream min-h-screen">

      {/* ── HERO ── */}
      <section className="relative bg-landes-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-landes-sky blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-24">

          {/* Grille 2 colonnes : texte gauche / image droite */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-10">

            {/* LEFT — breadcrumb + badge + titre + sous-titre */}
            <div className="flex flex-col items-start">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-300 mb-5">
                <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link href="/categories" className="hover:text-white transition-colors">Catégories</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-landes-sand font-medium">{meta.category}</span>
              </nav>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-6">
                <MapPin className="w-4 h-4 text-landes-sand" />
                <span>Annuaire local — Département des Landes (40)</span>
              </div>

              {/* Titre */}
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4"
                dangerouslySetInnerHTML={{ __html: meta.title }} />
              <p className="text-gray-300 text-lg mb-6">{meta.subtitle}</p>

              {/* Bouton Référencer */}
              <Link href="/inscription" className="btn-amber inline-flex items-center gap-2 text-base py-3 px-7">
                Référencer mon activité <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* RIGHT — image bannière ou emoji + compteur */}
            <div className="hidden lg:block">
              {DEFAULT_BANNERS[meta.category] ? (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img src={DEFAULT_BANNERS[meta.category]} alt={meta.category} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2.5 text-white text-center">
                    <p className="text-2xl font-bold">{pros.length}</p>
                    <p className="text-xs text-white/70">professionnel{pros.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-3xl px-14 py-10 border border-white/20 flex flex-col items-center gap-4">
                    <div className="text-8xl select-none">{meta.emoji}</div>
                    <div className="text-center border-t border-white/20 pt-5 w-full">
                      <p className="text-5xl font-bold text-white">{pros.length}</p>
                      <p className="text-gray-300 text-sm mt-1">professionnel{pros.length > 1 ? "s" : ""} référencé{pros.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs text-center max-w-xs">Mise à jour en temps réel · Landes (40)</p>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire pleine largeur sous la grille */}
          <form onSubmit={e => e.preventDefault()} className="w-full bg-white rounded-2xl shadow-2xl overflow-visible mb-5">
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

              {/* Champ mot-clé */}
              <div className="flex-1 relative" ref={queryRef}>
                <div className="flex items-center gap-3 px-5 py-4">
                  <Search className="w-5 h-5 text-landes-sage flex-shrink-0" />
                  <input type="text" value={query}
                    onChange={e => { handleSearch(e.target.value); setShowSug(true); }}
                    onFocus={() => setShowSug(true)}
                    placeholder="Métier, entreprise, service…"
                    className="w-full text-gray-800 placeholder-gray-400 text-base focus:outline-none bg-transparent"
                    autoComplete="off" />
                  {query && (
                    <button type="button" onClick={() => { handleSearch(""); setSuggestions([]); }}
                      className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {showSug && (suggestions.length > 0 || !query) && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-b-xl shadow-lg z-50 overflow-hidden">
                    {!query && <div className="px-4 pt-3 pb-1 flex items-center gap-1.5 text-xs text-gray-400 font-medium"><TrendingUp className="w-3.5 h-3.5" /> Recherches populaires</div>}
                    {(query ? suggestions : POPULAR_CAT).map((s, i) => (
                      <button key={i} type="button" onMouseDown={() => { handleSearch(s); setShowSug(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-landes-forest/5 text-left transition-colors">
                        <Search className="w-3.5 h-3.5 text-landes-sage flex-shrink-0" />
                        <span className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: query ? s.replace(new RegExp(`(${query})`, "gi"), "<strong>$1</strong>") : s }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Champ ville */}
              <div className="flex-1 relative" ref={cityRef}>
                <div className="flex items-center gap-3 px-5 py-4">
                  <MapPin className="w-5 h-5 text-landes-sage flex-shrink-0" />
                  <input type="text" value={location}
                    onChange={e => { handleLocation(e.target.value); setShowCity(true); }}
                    onFocus={() => setShowCity(true)}
                    placeholder="Ville ou code postal…"
                    className="w-full text-gray-800 placeholder-gray-400 text-base focus:outline-none bg-transparent"
                    autoComplete="off" />
                  {location && (
                    <button type="button" onClick={() => { handleLocation(""); setShowCity(false); }}
                      className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {showCity && citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-b-xl shadow-lg z-50 overflow-hidden">
                    {citySuggestions.map((c, i) => (
                      <button key={i} type="button" onMouseDown={() => { handleLocation(c); setShowCity(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-landes-forest/5 text-left transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-landes-sage flex-shrink-0" />
                        <span className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: c.replace(new RegExp(`(${location})`, "gi"), "<strong>$1</strong>") }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouton rechercher */}
              <button type="submit"
                className="flex items-center justify-center gap-2 bg-landes-forest hover:bg-landes-pine text-white font-semibold text-base px-8 py-4 transition-colors whitespace-nowrap rounded-b-2xl sm:rounded-b-none sm:rounded-r-2xl">
                <Search className="w-5 h-5" /><span>Rechercher</span>
              </button>
            </div>
          </form>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50L1440 50L1440 15C1200 40 960 5 720 25C480 45 240 5 0 15L0 50Z" fill="#FAF7F0"/>
          </svg>
        </div>
      </section>

      {/* ── MAP ── */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-landes-sage uppercase tracking-wider mb-1">Carte interactive</p>
            <h2 className="text-2xl font-bold text-landes-pine">
              Professionnels {meta.category} près de chez vous
            </h2>
            <p className="text-gray-500 text-sm mt-1">Cliquez sur un marqueur pour voir la fiche du professionnel</p>
          </div>
          <div className="card-map" style={{ height: 460 }}>
            {mapLoaded && mapPros.length > 0 ? (
              <MultiMap
                professionals={mapPros}
                onSelectPro={id =>
                  document.getElementById(`pro-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-2">
                  <MapPin className="w-8 h-8 text-gray-300 mx-auto animate-pulse" />
                  <p className="text-sm text-gray-400">Chargement de la carte…</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SEARCH + LIST ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-sm font-semibold text-landes-sage uppercase tracking-wider mb-1">Résultats</p>
              <h2 className="text-2xl font-bold text-landes-pine">
                Professionnels {meta.category} dans les Landes
              </h2>
            </div>
            <Link
              href="/categories"
              className="flex-shrink-0 flex items-center gap-2 text-sm font-medium text-landes-forest border border-landes-sage/40 bg-white hover:bg-landes-forest hover:text-white hover:border-landes-forest px-4 py-2.5 rounded-xl transition-all"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Retour aux catégories
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            {filtered.length} professionnel{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
            {query && <span> pour « <strong className="text-landes-pine">{query}</strong> »</span>}
            {location && <span> à <strong className="text-landes-pine">{location}</strong></span>}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(pro => (
              <div key={pro.id} id={`pro-${pro.id}`}>
                <ProfessionalCard pro={pro} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-bold text-landes-pine text-lg mb-2">Aucun résultat</h3>
            <p className="text-gray-500 text-sm mb-6">
              Aucun professionnel ne correspond à « {query} » dans les Landes.
            </p>
            <button onClick={() => handleSearch("")} className="btn-secondary py-2.5 px-6 text-sm">
              Voir tous les professionnels
            </button>
          </div>
        )}

        {/* ── SEO TEXT ── */}
        <div className="mt-14 space-y-5">
          <div>
            <p className="text-sm font-semibold text-landes-sage uppercase tracking-wider mb-1">À propos</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-landes-pine">{meta.seoTitle}</h2>
          </div>
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-4">
            {meta.seoText.map((para, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </div>
          <div className="pt-2">
            <Link href="/inscription" className="btn-primary inline-flex items-center gap-2 py-3 px-6">
              Référencer mon activité <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 bg-landes-pine rounded-3xl p-8 sm:p-12 text-center text-white">
          <div className="text-4xl mb-4">{meta.emoji}</div>
          <h2 className="text-2xl font-bold mb-3">
            Vous exercez dans ce secteur dans les Landes&nbsp;?
          </h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
            {meta.ctaText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscription"
              className="btn-amber flex items-center justify-center gap-2 py-3 px-8">
              Inscrire mon entreprise <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
