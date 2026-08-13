"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Search, MapPin, ArrowRight, ChevronRight, X, TrendingUp,
} from "lucide-react";
import { getProfessionalsWithImages } from "@/lib/storage";
import { DEFAULT_BANNERS } from "@/lib/defaultBanners";
import { Professional } from "@/types";
import ProfessionalCard from "@/components/professional/ProfessionalCard";

const MultiMap = dynamic(() => import("@/components/map/MultiMap"), { ssr: false });

const CATEGORY = "Sport & Fitness";

// Pros de démo sport avec coordonnées GPS dans les Landes
const DEMO_SPORT_PROS: Professional[] = [
  {
    id: "s1", companyName: "Surf School Biscarrosse", category: CATEGORY,
    city: "Biscarrosse", postalCode: "40600", address: "1 Avenue de la Plage",
    lat: 44.3970, lng: -1.1650, plan: "gold", status: "active",
    siren: "111222333", legalForm: "SARL",
    description: "<p>École de surf reconnue sur la côte landaise. Cours collectifs et particuliers pour tous niveaux, du débutant au confirmé. Location de matériel (planches, combinaisons). Stages vacances enfants et adultes. Nos moniteurs diplômés d'État vous accompagnent en toute sécurité sur les meilleures vagues des Landes.</p>",
    firstName: "Julien", lastName: "Waves", email: "surf@bisca.fr", phone: "05 58 11 22 33",
    logo: "", photos: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "s2", companyName: "Salle de Sport Atlantic Gym", category: CATEGORY,
    city: "Mont-de-Marsan", postalCode: "40000", address: "15 Rue du Stade",
    lat: 43.8960, lng: -0.5040, plan: "premium", status: "active",
    siren: "222333444", legalForm: "SAS",
    description: "<p>Salle de sport et fitness au cœur de Mont-de-Marsan. Musculation, cardio, cours collectifs (yoga, pilates, zumba, bodypump). Coaching personnalisé avec nos coachs certifiés. Programmes nutrition et suivi personnalisé. Accès 7j/7 avec badge. Essai gratuit sur rendez-vous.</p>",
    firstName: "Laura", lastName: "Fit", email: "gym@atlantic.fr", phone: "05 58 22 33 44",
    logo: "", photos: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "s3", companyName: "Vélo Évasion Landes", category: CATEGORY,
    city: "Mimizan", postalCode: "40200", address: "5 Route des Pistes",
    lat: 44.2050, lng: -1.2310, plan: "premium", status: "active",
    siren: "333444555", legalForm: "EURL",
    description: "<p>Location de vélos électriques, VTT et vélos de route. Circuits guidés en forêt landaise et sur les 200 km de pistes cyclables. Balades en famille, sorties sportives et séjours vélo tout compris. Livraison possible sur votre lieu de vacances. Le meilleur moyen de découvrir les Landes autrement.</p>",
    firstName: "Pierre", lastName: "Vélo", email: "velo@mimizan.fr", phone: "05 58 33 44 55",
    logo: "", photos: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "s4", companyName: "Tennis Club Dacquois", category: CATEGORY,
    city: "Dax", postalCode: "40100", address: "8 Allée du Tennis",
    lat: 43.7080, lng: -1.0510, plan: "standard", status: "active",
    siren: "444555666", legalForm: "Association",
    description: "<p>Club de tennis avec 8 courts extérieurs et 3 couverts. Cours enfants et adultes tous niveaux. Stages intensifs pendant les vacances. 4 terrains de padel récemment construits. Compétitions homologuées FFT. Location de courts à l'heure. Boutique et matériel de tennis sur place.</p>",
    firstName: "Marc", lastName: "Tennis", email: "tennis@dax.fr", phone: "05 58 44 55 66",
    logo: "", photos: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "s5", companyName: "Centre Équestre des Pins", category: CATEGORY,
    city: "Sabres", postalCode: "40630", address: "Chemin des Cavaliers",
    lat: 44.1520, lng: -0.7310, plan: "gold", status: "active",
    siren: "555666777", legalForm: "SARL",
    description: "<p>Centre équestre au cœur de la forêt landaise. Cours d'équitation pour enfants et adultes, toutes disciplines (CSO, dressage, équitation de loisir). Pension complète et demi-pension pour chevaux. Randonnées équestres en forêt de 2h à plusieurs jours. Stages vacances. Poney-club pour les enfants.</p>",
    firstName: "Sophie", lastName: "Equestre", email: "equestre@sabres.fr", phone: "05 58 55 66 77",
    logo: "", photos: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "s6", companyName: "Yoga & Bien-être Hossegor", category: CATEGORY,
    city: "Hossegor", postalCode: "40150", address: "12 Avenue des Cèdres",
    lat: 43.6640, lng: -1.4030, plan: "premium", status: "active",
    siren: "666777888", legalForm: "EI",
    description: "<p>Studio de yoga, méditation et bien-être face à l'océan. Cours de yoga tous styles (vinyasa, yin, ashtanga, prénatal). Séances de méditation guidée et yoga nidra. Retraites bien-être le week-end. Cours particuliers et cours en entreprise. Certifiée RYT-500 Yoga Alliance. En ligne ou en présentiel.</p>",
    firstName: "Marie", lastName: "Zen", email: "yoga@hossegor.fr", phone: "06 45 67 89 01",
    logo: "", photos: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "s7", companyName: "Parc Accrobranche Forêt 40", category: CATEGORY,
    city: "Parentis-en-Born", postalCode: "40160", address: "Route Forestière du Lac",
    lat: 44.3500, lng: -1.0660, plan: "standard", status: "active",
    siren: "777888999", legalForm: "SAS",
    description: "<p>Parc d'accrobranche et d'aventure en forêt de pins. 12 parcours de difficulté croissante, du niveau enfant (3 ans) au niveau expert. Tyroliennes géantes, ponts de singe, sauts dans le vide. Ouvert toute l'année (week-ends et vacances). Groupes et team building bienvenus. Équipement fourni sur place.</p>",
    firstName: "Thomas", lastName: "Aventure", email: "accro@parentis.fr", phone: "05 58 66 77 88",
    logo: "", photos: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "s8", companyName: "Kitesurf Academy Capbreton", category: CATEGORY,
    city: "Capbreton", postalCode: "40130", address: "3 Passage du Port",
    lat: 43.6430, lng: -1.4290, plan: "gold", status: "active",
    siren: "888999000", legalForm: "SARL",
    description: "<p>École de kitesurf sur la côte landaise. Cours initiations, perfectionnement et autonomie. Moniteurs diplômés d'État BPJEPS Kite. Location de matériel pour pratiquants autonomes. Stage immersif sur 5 jours. La côte landaise offre des conditions de vent idéales de mars à novembre. Hébergement partenaire disponible.</p>",
    firstName: "Alexis", lastName: "Kite", email: "kite@capbreton.fr", phone: "05 58 77 88 99",
    logo: "", photos: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

export default function SportPage() {
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

  const POPULAR_CAT = ["Surf", "Yoga", "Fitness", "Natation", "Tennis", "Coach"];
  const LANDES_CITIES = [
    "Mont-de-Marsan","Dax","Biscarrosse","Capbreton","Hossegor",
    "Mimizan","Parentis-en-Born","Hagetmau","Tarnos","Soustons",
    "Morcenx","Aire-sur-l'Adour","Tartas","Labouheyre","Sabres",
    "Saint-Paul-lès-Dax","Tyrosse","Ondres","Soorts-Hossegor","Vieux-Boucau-les-Bains",
  ];

  useEffect(() => {
    (async () => {
      const real = (await getProfessionalsWithImages()).filter(p => p.status === "active" && p.category === CATEGORY);
      const merged = [...real];
      DEMO_SPORT_PROS.forEach(d => { if (!merged.find(p => p.id === d.id)) merged.push(d); });
      const order: Record<string, number> = { gold: 0, premium: 1, standard: 2 };
      merged.sort((a, b) => order[a.plan] - order[b.plan]);
      setPros(merged); setFiltered(merged); setMapLoaded(true);
    })();
  }, []);

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
    const qLow = q.trim().toLowerCase();
    const locLow = loc.trim().toLowerCase();
    setFiltered(pros.filter(p => {
      const desc = p.description.replace(/<[^>]*>/g, " ").toLowerCase();
      const svcs = (p.services || []).join(" ").toLowerCase();
      const matchQ = !qLow || (
        p.companyName.toLowerCase().includes(qLow) || desc.includes(qLow) ||
        p.city.toLowerCase().includes(qLow) || svcs.includes(qLow)
      );
      const matchLoc = !locLow || p.city.toLowerCase().includes(locLow) || p.postalCode.includes(locLow);
      return matchQ && matchLoc;
    }));
  }, [pros]);

  const handleSearch = useCallback((q: string) => { setQuery(q); applyFilter(q, location); }, [applyFilter, location]);
  const handleLocation = useCallback((loc: string) => { setLocation(loc); applyFilter(query, loc); }, [applyFilter, query]);

  const mapPros = pros.filter(p => p.lat && p.lng);

  return (
    <div className="bg-landes-cream min-h-screen">

      {/* ── HERO CATÉGORIE ── */}
      <section className="relative bg-landes-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-landes-sky blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-24">

          {/* Grille 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-10">

            {/* LEFT */}
            <div className="flex flex-col items-start">
              <nav className="flex items-center gap-2 text-sm text-gray-300 mb-5">
                <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link href="/categories" className="hover:text-white transition-colors">Catégories</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-landes-sand font-medium">Sport & Fitness</span>
              </nav>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-6">
                <MapPin className="w-4 h-4 text-landes-sand" />
                <span>Annuaire local — Département des Landes (40)</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
                Sport &amp; Fitness<br />
                <span className="text-landes-sand">dans les Landes</span>
              </h1>
              <p className="text-gray-300 text-lg mb-6">
                Trouvez les meilleurs clubs, écoles de sport et coachs sportifs du département des Landes (40).
              </p>

              {/* Bouton Référencer */}
              <Link href="/inscription" className="btn-amber inline-flex items-center gap-2 text-base py-3 px-7">
                Référencer mon activité <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* RIGHT */}
            <div className="flex-shrink-0 hidden lg:block">
              {(DEFAULT_BANNERS as Record<string, string>)["Sport & Fitness"] ? (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img src={(DEFAULT_BANNERS as Record<string,string>)["Sport & Fitness"]} alt="Sport & Fitness" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2.5 text-white text-center">
                    <p className="text-2xl font-bold">{pros.length}</p>
                    <p className="text-xs text-white/70">professionnel{pros.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-3xl px-14 py-10 border border-white/20 flex flex-col items-center gap-4">
                    <div className="text-8xl select-none">🏄</div>
                    <div className="text-center border-t border-white/20 pt-5 w-full">
                      <p className="text-5xl font-bold text-white">{pros.length}</p>
                      <p className="text-gray-300 text-sm mt-1">professionnels</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulaire pleine largeur */}
          <form onSubmit={e => e.preventDefault()} className="w-full bg-white rounded-2xl shadow-2xl overflow-visible mb-5">
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              <div className="flex-1 relative" ref={queryRef}>
                <div className="flex items-center gap-3 px-5 py-4">
                  <Search className="w-5 h-5 text-landes-sage flex-shrink-0" />
                  <input type="text" value={query}
                    onChange={e => { handleSearch(e.target.value); setShowSug(true); }}
                    onFocus={() => setShowSug(true)}
                    placeholder="Métier, entreprise, discipline…"
                    className="w-full text-gray-800 placeholder-gray-400 text-base focus:outline-none bg-transparent" autoComplete="off" />
                  {query && <button type="button" onClick={() => { handleSearch(""); setSuggestions([]); }} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>}
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
              <div className="flex-1 relative" ref={cityRef}>
                <div className="flex items-center gap-3 px-5 py-4">
                  <MapPin className="w-5 h-5 text-landes-sage flex-shrink-0" />
                  <input type="text" value={location}
                    onChange={e => { handleLocation(e.target.value); setShowCity(true); }}
                    onFocus={() => setShowCity(true)}
                    placeholder="Ville ou code postal…"
                    className="w-full text-gray-800 placeholder-gray-400 text-base focus:outline-none bg-transparent" autoComplete="off" />
                  {location && <button type="button" onClick={() => { handleLocation(""); setShowCity(false); }} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"><X className="w-4 h-4" /></button>}
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

      {/* ── CARTE ── */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-landes-sage uppercase tracking-wider mb-1">Carte interactive</p>
            <h2 className="text-2xl font-bold text-landes-pine">
              Professionnels sport près de chez vous
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Cliquez sur un marqueur pour voir la fiche du professionnel
            </p>
          </div>

          <div className="card-map" style={{ height: 460 }}>
            {mapLoaded && mapPros.length > 0 ? (
              <MultiMap
                professionals={mapPros}
                onSelectPro={(id) => {
                  document.getElementById(`pro-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
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

      {/* ── RECHERCHE + LISTE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Bandeau résultats */}
        <div className="mb-8">
          <div className="flex items-end justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-semibold text-landes-sage uppercase tracking-wider mb-1">Résultats</p>
              <h2 className="text-2xl font-bold text-landes-pine">
                Professionnels Sport & Fitness dans les Landes
              </h2>
            </div>
            <Link href="/categories"
              className="flex-shrink-0 flex items-center gap-2 text-sm font-medium text-landes-forest border border-landes-sage/40 bg-white hover:bg-landes-forest hover:text-white hover:border-landes-forest px-4 py-2.5 rounded-xl transition-all">
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

        {/* Grille de cards */}
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
              Aucun professionnel ne correspond à votre recherche « {query} » dans les Landes.
            </p>
            <button
              onClick={() => handleSearch("")}
              className="btn-secondary py-2.5 px-6 text-sm"
            >
              Voir tous les professionnels sport
            </button>
          </div>
        )}

        {/* ── TEXTE SEO ── */}
        <div className="mt-14 space-y-5">
          <div>
            <p className="text-sm font-semibold text-landes-sage uppercase tracking-wider mb-1">À propos</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-landes-pine">
              Sport &amp; activités sportives dans les Landes
            </h2>
          </div>
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-4">
            <p>
              Le département des Landes est une destination de choix pour les amateurs de sport et de plein air. Grâce à ses <strong className="text-landes-pine">200 kilomètres de côte Atlantique</strong>, ses forêts de pins maritimes et ses nombreux lacs, les Landes offrent un terrain de jeu exceptionnel pour la pratique sportive tout au long de l&apos;année.
            </p>
            <p>
              Notre annuaire recense les meilleurs <strong className="text-landes-pine">professionnels du sport dans les Landes</strong> : écoles de surf, salles de sport, clubs de tennis, centres équestres, studios de yoga, loueurs de vélos et bien d&apos;autres encore. Que vous soyez résident ou vacancier, trouvez facilement le club ou le coach sportif adapté à votre niveau et à vos envies.
            </p>
            <p>
              Les Landes sont mondialement connues pour leurs vagues, attirant chaque année des milliers de surfeurs sur les plages de <strong className="text-landes-pine">Hossegor</strong>, <strong className="text-landes-pine">Biscarrosse</strong>, <strong className="text-landes-pine">Capbreton</strong> et <strong className="text-landes-pine">Mimizan</strong>. Les écoles de surf landaises proposent des cours adaptés à tous les âges et tous les niveaux, encadrés par des moniteurs diplômés d&apos;État.
            </p>
            <p>
              Au-delà du surf, la forêt landaise se prête parfaitement à la randonnée à pied, au cyclisme et au VTT, grâce à ses nombreuses pistes balisées. Les amateurs de sports de raquette trouveront également des clubs de tennis et de padel répartis dans toutes les communes du département.
            </p>
            <p>
              Que vous recherchiez une salle de fitness, un coach personnel, un professeur de yoga, un club équestre ou une école de kitesurf, notre annuaire vous permet de <strong className="text-landes-pine">trouver le bon professionnel du sport dans les Landes</strong> en quelques clics, directement géolocalisé près de chez vous.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/inscription" className="btn-primary inline-flex items-center gap-2 py-3 px-6">
              Référencer mon activité <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CTA bas de page */}
        <div className="mt-14 bg-landes-pine rounded-3xl p-8 sm:p-12 text-center text-white">
          <div className="text-4xl mb-4">🏄</div>
          <h2 className="text-2xl font-bold mb-3">Vous proposez une activité sportive dans les Landes ?</h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
            Club, école de sport, coach, salle de fitness ou prestataire sportif — référencez votre activité et soyez trouvé par des milliers de sportifs landais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscription" className="btn-amber flex items-center justify-center gap-2 py-3 px-8">
              Inscrire mon activité <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
