"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Search, ChevronRight } from "lucide-react";

interface Entreprise {
  siret: string;
  denomination: string | null;
  enseigne: string | null;
  codeApe: string | null;
  libelleApe: string | null;
  commune: string | null;
  codePostal: string | null;
}

interface ApeCode {
  codeApe: string;
  libelle: string | null;
  count: number;
}

function slugify(text: string): string {
  return (text || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function EntreprisesSearchClient() {
  const [q, setQ] = useState("");
  const [codeApe, setCodeApe] = useState("");
  const [commune, setCommune] = useState("");
  const [apeCodes, setApeCodes] = useState<ApeCode[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/entreprises/ape-codes").then(r => r.json()).then(d => setApeCodes(d.codes || []));
  }, []);

  const runSearch = async (targetPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (codeApe) params.set("codeApe", codeApe);
      if (commune) params.set("commune", commune);
      params.set("page", String(targetPage));
      const res = await fetch(`/api/entreprises?${params.toString()}`);
      const data = await res.json();
      setEntreprises(data.entreprises || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runSearch(1); }, []);

  return (
    <div className="bg-landes-cream min-h-screen">
      <section className="bg-landes-hero text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2">
            <Building2 className="w-8 h-8 flex-shrink-0" /> Rechercher une entreprise dans les Landes
          </h1>
          <p className="text-white/80">
            Base issue du répertoire SIRENE (INSEE), synchronisée quotidiennement — {total > 0 ? `${total} établissements actifs référencés` : "recherchez par métier, code APE ou commune"}.
          </p>

          <div className="mt-6 bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Nom d'entreprise…" className="flex-1 px-4 py-2.5 text-gray-800 text-sm focus:outline-none rounded-xl" />
            <input value={commune} onChange={e => setCommune(e.target.value)} placeholder="Commune…" className="flex-1 px-4 py-2.5 text-gray-800 text-sm focus:outline-none rounded-xl" />
            <select value={codeApe} onChange={e => setCodeApe(e.target.value)} className="px-4 py-2.5 text-gray-800 text-sm focus:outline-none rounded-xl bg-white">
              <option value="">Tous les métiers</option>
              {apeCodes.map(c => (
                <option key={c.codeApe} value={c.codeApe}>{c.libelle || c.codeApe} ({c.count})</option>
              ))}
            </select>
            <button onClick={() => runSearch(1)} className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5 text-sm">
              <Search className="w-4 h-4" /> Rechercher
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <p className="text-center text-gray-400 py-12">Chargement…</p>
        ) : entreprises.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Aucune entreprise trouvée pour ces critères.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entreprises.map(e => (
                <Link
                  key={e.siret}
                  href={`/entreprises/${slugify(e.commune || "landes")}/${slugify(e.denomination || e.enseigne || "entreprise")}-${e.siret}`}
                  className="card p-5 hover:border-landes-sage transition-colors flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-landes-pine truncate">{e.denomination || e.enseigne}</p>
                    <p className="text-sm text-gray-500 truncate">{e.libelleApe}</p>
                    <p className="text-xs text-gray-400 mt-1">{e.commune} ({e.codePostal})</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8 text-sm">
                <button onClick={() => runSearch(page - 1)} disabled={page <= 1} className="text-landes-forest disabled:text-gray-300">← Précédent</button>
                <span className="text-gray-500">Page {page} / {totalPages}</span>
                <button onClick={() => runSearch(page + 1)} disabled={page >= totalPages} className="text-landes-forest disabled:text-gray-300">Suivant →</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
