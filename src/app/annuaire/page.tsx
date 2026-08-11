"use client";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, List, Map as MapIcon } from "lucide-react";
import { getProfessionals } from "@/lib/storage";
import { Professional } from "@/types";
import ProfessionalCard from "@/components/professional/ProfessionalCard";
import SearchBar from "@/components/professional/SearchBar";
import dynamic from "next/dynamic";

const MultiMap = dynamic(() => import("@/components/map/MultiMap"), { ssr: false });

function AnnuaireContent() {
  const searchParams = useSearchParams();
  const [pros, setPros] = useState<Professional[]>([]);
  const [filtered, setFiltered] = useState<Professional[]>([]);
  const [search]  = useState(searchParams.get("q") || "");
  const [category] = useState(searchParams.get("category") || "");
  const [city]    = useState(searchParams.get("city") || "");
  const [view, setView] = useState<"list" | "map">("list");
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const data = getProfessionals().filter(p => p.status === "active");
    setPros(data);
    setFiltered(data);
  }, []);

  useEffect(() => {
    let results = pros;
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p => {
        const desc = p.description.replace(/<[^>]*>/g, " ").toLowerCase();
        const svcs = (p.services || []).join(" ").toLowerCase();
        return (
          p.companyName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          desc.includes(q) ||
          p.city.toLowerCase().includes(q) ||
          svcs.includes(q) ||
          (p.job || "").toLowerCase().includes(q)
        );
      });
    }
    if (category) results = results.filter(p => p.category === category);
    if (city) {
      const c = city.toLowerCase();
      results = results.filter(p =>
        p.city.toLowerCase().includes(c) || p.postalCode.includes(c)
      );
    }
    const order: Record<string, number> = { gold: 0, premium: 1, standard: 2 };
    results.sort((a, b) => order[a.plan] - order[b.plan]);
    setFiltered(results);
  }, [search, category, city, pros]);

  const handleSelectPro = useCallback((id: string) => {
    setHighlightId(id);
    if (view === "map") {
      setView("list");
      setTimeout(() => {
        document.getElementById(`pro-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } else {
      document.getElementById(`pro-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [view]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-landes-pine px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-white">Annuaire des professionnels</h1>
              <p className="text-sm text-gray-300">Landes (40) — <span className="font-medium text-landes-sand">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span></p>
            </div>
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "list" ? "bg-white text-landes-forest shadow-sm" : "text-white/70 hover:text-white"}`}
              >
                <List className="w-4 h-4" /> Liste
              </button>
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === "map" ? "bg-white text-landes-forest shadow-sm" : "text-white/70 hover:text-white"}`}
              >
                <MapIcon className="w-4 h-4" /> Carte
              </button>
            </div>
          </div>

          {/* Same search form as hero */}
          <SearchBar initialQuery={search} initialLocation={city} compact />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">Aucun résultat</h3>
            <p className="text-gray-400">Essayez de modifier vos critères.</p>
          </div>
        ) : view === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(pro => (
              <div
                key={pro.id}
                id={`pro-${pro.id}`}
                className={`transition-all duration-300 ${highlightId === pro.id ? "ring-2 ring-landes-forest ring-offset-2 rounded-2xl" : ""}`}
              >
                <ProfessionalCard pro={pro} />
              </div>
            ))}
          </div>
        ) : (
          /* MAP VIEW — split: list left, map right */
          <div className="flex flex-col lg:flex-row gap-4" style={{ height: "calc(100vh - 260px)", minHeight: 500 }}>
            {/* List panel */}
            <div className="lg:w-80 xl:w-96 flex-shrink-0 overflow-y-auto space-y-3 pr-1">
              {filtered.map(pro => (
                <div
                  key={pro.id}
                  id={`pro-${pro.id}`}
                  onClick={() => setHighlightId(pro.id)}
                  className={`transition-all duration-200 cursor-pointer ${highlightId === pro.id ? "ring-2 ring-landes-forest ring-offset-1 rounded-2xl" : ""}`}
                >
                  <ProfessionalCard pro={pro} />
                </div>
              ))}
            </div>

            {/* Map panel */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ minHeight: 400 }}>
              <MultiMap professionals={filtered} onSelectPro={handleSelectPro} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnnuairePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <AnnuaireContent />
    </Suspense>
  );
}
