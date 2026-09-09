"use client";
import { useMemo, useState } from "react";
import { TrendingUp, Calendar } from "lucide-react";
import { getDocumentsByPro } from "@/lib/storage";
import type { BillingDocument, DocumentLine } from "@/types";

function fmtEuro(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function calcTotalHT(lines: DocumentLine[], discountPct = 0) {
  const totalHT = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  return totalHT * (1 - (discountPct || 0) / 100);
}

type PeriodPreset = "12mois" | "annee" | "annee-1" | "tout" | "custom";

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export default function RevenueTab({ proId }: { proId: string }) {
  const [preset, setPreset] = useState<PeriodPreset>("12mois");
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 11); d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().slice(0, 10));

  const docs = useMemo(() => getDocumentsByPro(proId), [proId]);

  // Chiffre d'affaires réalisé (HT) : factures payées, moins les avoirs payés (remboursements)
  const revenueDocs = useMemo(() =>
    docs.filter(d => d.status === "payé" && (d.type === "facture" || d.type === "avoir")),
    [docs]
  );

  // Bornes de la période sélectionnée
  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    if (preset === "custom") {
      return { rangeStart: new Date(customStart), rangeEnd: new Date(customEnd) };
    }
    if (preset === "annee") {
      return { rangeStart: new Date(now.getFullYear(), 0, 1), rangeEnd: new Date(now.getFullYear(), 11, 31) };
    }
    if (preset === "annee-1") {
      return { rangeStart: new Date(now.getFullYear() - 1, 0, 1), rangeEnd: new Date(now.getFullYear() - 1, 11, 31) };
    }
    if (preset === "tout") {
      const dates = revenueDocs.map(d => new Date(d.issueDate).getTime());
      const min = dates.length ? new Date(Math.min(...dates)) : new Date(now.getFullYear(), 0, 1);
      return { rangeStart: min, rangeEnd: now };
    }
    // 12 derniers mois (par défaut)
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    return { rangeStart: start, rangeEnd: now };
  }, [preset, customStart, customEnd, revenueDocs]);

  // Construit la liste des mois entre rangeStart et rangeEnd, et agrège le CA (HT) de chacun
  const monthlyData = useMemo(() => {
    const months: { key: string; label: string; value: number }[] = [];
    const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);

    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      months.push({ key, label: `${MONTH_LABELS[cursor.getMonth()]} ${String(cursor.getFullYear()).slice(2)}`, value: 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const byKey = new Map(months.map(m => [m.key, m]));
    for (const d of revenueDocs) {
      const dt = new Date(d.issueDate);
      if (dt < rangeStart || dt > rangeEnd) continue;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const bucket = byKey.get(key);
      if (!bucket) continue;
      const ht = calcTotalHT(d.lines, d.discountPct);
      bucket.value += d.type === "avoir" ? -ht : ht;
    }
    return months;
  }, [revenueDocs, rangeStart, rangeEnd]);

  const cumulativeData = useMemo(() => {
    let running = 0;
    return monthlyData.map(m => { running += m.value; return { ...m, cumulative: running }; });
  }, [monthlyData]);

  const totalPeriod = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1].cumulative : 0;
  const avgPerMonth = monthlyData.length > 0 ? totalPeriod / monthlyData.length : 0;
  const nbFacturesPayees = revenueDocs.filter(d =>
    d.type === "facture" && new Date(d.issueDate) >= rangeStart && new Date(d.issueDate) <= rangeEnd
  ).length;

  // ── Rendu du graphique en SVG (barres mensuelles + courbe cumulée) ──
  const maxMonthly = Math.max(1, ...monthlyData.map(m => Math.abs(m.value)));
  const maxCumulative = Math.max(1, ...cumulativeData.map(m => Math.abs(m.cumulative)));
  const chartH = 260;
  const chartTopPad = 20;
  const barAreaH = chartH - chartTopPad - 30;
  const n = monthlyData.length;
  const chartW = Math.max(560, n * 56);
  const barW = Math.min(28, (chartW / n) * 0.5);

  const xFor = (i: number) => (i + 0.5) * (chartW / n);
  const yForCumulative = (v: number) => chartTopPad + barAreaH - (v / maxCumulative) * barAreaH;

  const linePoints = cumulativeData.map((m, i) => `${xFor(i)},${yForCumulative(m.cumulative)}`).join(" ");

  return (
    <div className="card p-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h2 className="text-xl font-bold text-landes-pine bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Chiffre d&apos;affaires
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Chiffre d&apos;affaires HT réalisé (factures payées, avoirs déduits), mois par mois et cumulé.
      </p>

      {/* Sélecteur de période */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {([
          { id: "12mois", label: "12 derniers mois" },
          { id: "annee", label: "Année en cours" },
          { id: "annee-1", label: "Année précédente" },
          { id: "tout", label: "Depuis le début" },
          { id: "custom", label: "Période personnalisée" },
        ] as { id: PeriodPreset; label: string }[]).map(p => (
          <button
            key={p.id}
            onClick={() => setPreset(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              preset === p.id
                ? "bg-landes-forest text-white border-landes-forest"
                : "bg-white text-gray-600 border-gray-200 hover:border-landes-sage"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-gray-50 rounded-xl p-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Du</label>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="input-field text-sm py-1.5" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Au</label>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="input-field text-sm py-1.5" />
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-landes-forest/5 border border-landes-forest/10 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">CA total sur la période</p>
          <p className="text-2xl font-bold text-landes-pine">{fmtEuro(totalPeriod)} €</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">CA moyen mensuel</p>
          <p className="text-2xl font-bold text-gray-800">{fmtEuro(avgPerMonth)} €</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Factures payées</p>
          <p className="text-2xl font-bold text-gray-800">{nbFacturesPayees}</p>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-5 mb-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-landes-forest inline-block" /> CA mensuel</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-amber-500 inline-block" /> CA cumulé</span>
      </div>

      {/* Graphique */}
      {monthlyData.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">Aucune donnée pour cette période.</p>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          <svg width={chartW} height={chartH} className="min-w-full">
            {/* Lignes de repère horizontales */}
            {[0, 0.25, 0.5, 0.75, 1].map(f => (
              <line key={f}
                x1={0} x2={chartW}
                y1={chartTopPad + barAreaH * (1 - f)} y2={chartTopPad + barAreaH * (1 - f)}
                stroke="#f0f0f0" strokeWidth={1}
              />
            ))}

            {/* Barres mensuelles */}
            {monthlyData.map((m, i) => {
              const h = (Math.abs(m.value) / maxMonthly) * barAreaH;
              const x = xFor(i) - barW / 2;
              const y = chartTopPad + barAreaH - h;
              return (
                <g key={m.key}>
                  <rect x={x} y={y} width={barW} height={Math.max(h, 1)} rx={3} fill={m.value < 0 ? "#f59e0b" : "#2D5A3D"} opacity={0.85} />
                  <title>{m.label} : {fmtEuro(m.value)} €</title>
                </g>
              );
            })}

            {/* Courbe cumulée */}
            <polyline points={linePoints} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
            {cumulativeData.map((m, i) => (
              <circle key={m.key} cx={xFor(i)} cy={yForCumulative(m.cumulative)} r={3} fill="#f59e0b">
                <title>{m.label} — Cumulé : {fmtEuro(m.cumulative)} €</title>
              </circle>
            ))}

            {/* Étiquettes des mois */}
            {monthlyData.map((m, i) => (
              <text key={m.key} x={xFor(i)} y={chartH - 8} textAnchor="middle" fontSize={10} fill="#9ca3af">
                {m.label}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}
