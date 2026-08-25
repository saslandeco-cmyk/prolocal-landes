"use client";
import { useEffect, useState } from "react";
import { TrendingUp, Eye, Calendar, Clock, Search, MapPin, Tag, ArrowRight } from "lucide-react";
import { getStatsByPro } from "@/lib/storage";

interface Props { proId: string }

type Stats = ReturnType<typeof getStatsByPro>;

const SOURCE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  direct:   { label: "Accès direct",       icon: <ArrowRight className="w-3.5 h-3.5" />, color: "bg-landes-forest" },
  search:   { label: "Depuis l'annuaire",  icon: <Search className="w-3.5 h-3.5" />,     color: "bg-blue-500" },
  category: { label: "Depuis une catégorie",icon: <Tag className="w-3.5 h-3.5" />,       color: "bg-purple-500" },
  map:      { label: "Depuis la carte",    icon: <MapPin className="w-3.5 h-3.5" />,     color: "bg-amber-500" },
};

function MiniBarChart({ data, maxVal, color = "bg-landes-forest" }: {
  data: number[]; maxVal: number; color?: string;
}) {
  return (
    <div className="flex items-end gap-0.5 h-20">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end">
          <div
            className={`w-full rounded-t transition-all ${color} opacity-80`}
            style={{ height: maxVal > 0 ? `${(v / maxVal) * 100}%` : "2px", minHeight: v > 0 ? 4 : 2 }}
          />
        </div>
      ))}
    </div>
  );
}

export default function StatsTab({ proId }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState<7 | 30>(30);

  useEffect(() => {
    setStats(getStatsByPro(proId, period));
  }, [proId, period]);

  if (!stats) return (
    <div className="card p-8 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-landes-forest/30 border-t-landes-forest rounded-full animate-spin" />
    </div>
  );

  const maxDay  = Math.max(...stats.byDay.map(d => d.visits), 1);
  const maxHour = Math.max(...stats.byHour, 1);
  const totalSources = Object.values(stats.bySource).reduce((s, v) => s + v, 0);

  // Format date label for 7 or 30 days
  const dayLabels = stats.byDay.map(d => {
    const dt = new Date(d.date);
    return period === 7
      ? dt.toLocaleDateString("fr-FR", { weekday: "short" })
      : dt.getDate() === 1 || dt.getDay() === 1
        ? dt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
        : "";
  });

  return (
    <div className="space-y-6">
      {/* Header + period selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-landes-pine bg-landes-forest/8 border-l-4 border-landes-forest px-4 py-3 rounded-r-lg">Statistiques de visites</h2>
          <p className="text-sm text-gray-500">Nombre de visites uniques sur votre fiche publique</p>
        </div>
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
          {([7, 30] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === p ? "bg-white shadow text-landes-forest" : "text-gray-500 hover:text-gray-700"
              }`}>
              {p === 7 ? "7 jours" : "30 jours"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Aujourd'hui",  value: stats.today,     icon: Eye,       color: "text-landes-forest", bg: "bg-landes-forest/10" },
          { label: "Cette semaine",value: stats.thisWeek,  icon: Calendar,  color: "text-blue-600",      bg: "bg-blue-50" },
          { label: "Ce mois",      value: stats.thisMonth, icon: TrendingUp, color: "text-purple-600",   bg: "bg-purple-50" },
          { label: "Total",        value: stats.total,     icon: Clock,     color: "text-amber-600",     bg: "bg-amber-50" },
        ].map(kpi => (
          <div key={kpi.label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.bg}`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-landes-pine">{kpi.value.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Visites par jour */}
      <div className="card p-6">
        <h3 className="font-semibold text-landes-pine mb-4">
          Visites par jour — {period === 7 ? "7 derniers jours" : "30 derniers jours"}
        </h3>
        {stats.byDay.every(d => d.visits === 0) ? (
          <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
            Aucune visite enregistrée sur cette période
          </div>
        ) : (
          <>
            <MiniBarChart data={stats.byDay.map(d => d.visits)} maxVal={maxDay} />
            {/* Labels */}
            <div className="flex items-start gap-0.5 mt-1">
              {dayLabels.map((l, i) => (
                <div key={i} className="flex-1 text-center">
                  {l && <span className="text-[9px] text-gray-400">{l}</span>}
                </div>
              ))}
            </div>
            {/* Hover detail table for 7 days */}
            {period === 7 && (
              <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-7 gap-2">
                {stats.byDay.map(d => (
                  <div key={d.date} className="text-center">
                    <p className="text-xs font-bold text-landes-pine">{d.visits}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visites par heure */}
        <div className="card p-6">
          <h3 className="font-semibold text-landes-pine mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-landes-sage" /> Répartition horaire
          </h3>
          <MiniBarChart data={stats.byHour} maxVal={maxHour} color="bg-landes-sage" />
          <div className="flex justify-between mt-1 text-[9px] text-gray-400">
            <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
          </div>
          {/* Peak hour */}
          {stats.total > 0 && (() => {
            const peak = stats.byHour.indexOf(Math.max(...stats.byHour));
            return (
              <p className="text-xs text-gray-500 mt-3 bg-gray-50 rounded-lg px-3 py-2">
                ⏰ Pic de trafic : <strong className="text-landes-pine">{peak}h–{peak + 1}h</strong>
                {" "}avec <strong>{Math.max(...stats.byHour)}</strong> visite{Math.max(...stats.byHour) > 1 ? "s" : ""}
              </p>
            );
          })()}
        </div>

        {/* Provenance */}
        <div className="card p-6">
          <h3 className="font-semibold text-landes-pine mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-landes-sage" /> Source des visites
          </h3>
          {totalSources === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-3">
              {(Object.entries(stats.bySource) as [string, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([source, count]) => {
                  const info  = SOURCE_LABELS[source];
                  const pct   = totalSources > 0 ? Math.round((count / totalSources) * 100) : 0;
                  return (
                    <div key={source}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0 ${info.color}`}>
                            {info.icon}
                          </div>
                          {info.label}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-landes-pine">{count}</span>
                          <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${info.color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Info légale */}
      <p className="text-xs text-gray-400 text-center">
        Les statistiques sont calculées depuis votre espace client et stockées localement. Une visite est comptabilisée une seule fois par heure et par visiteur.
      </p>
    </div>
  );
}
