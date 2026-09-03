"use client";
import { useEffect, useRef } from "react";
import { Professional } from "@/types";
import { buildProfileUrl } from "@/lib/profileUrl";

interface MultiMapProps {
  professionals: Professional[];
  onSelectPro?: (id: string) => void;
  flyTo?: { lat: number; lng: number; zoom: number; v: number } | null;
}

const PLAN_COLORS: Record<string, string> = {
  gold:     "#D4860A",
  premium:  "#7C3AED",
  standard: "#2D5A3D",
};

export default function MultiMap({ professionals, onSelectPro, flyTo }: MultiMapProps) {
  const mapRef       = useRef<HTMLDivElement>(null);
  const instanceRef  = useRef<any>(null);
  const readyRef     = useRef(false);
  const pendingRef   = useRef<{ lat: number; lng: number; zoom: number } | null>(null);

  // Appliquer le zoom dès que flyTo change (version counter force le re-trigger)
  useEffect(() => {
    if (!flyTo) return;
    if (readyRef.current && instanceRef.current) {
      try {
        instanceRef.current.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom, {
          animate: true,
          duration: 1,
        });
      } catch {
        instanceRef.current.setView([flyTo.lat, flyTo.lng], flyTo.zoom);
      }
    } else {
      // Stocker pour exécution après init
      pendingRef.current = { lat: flyTo.lat, lng: flyTo.lng, zoom: flyTo.zoom };
    }
  }, [flyTo]);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    if (instanceRef.current) {
      instanceRef.current.remove();
      instanceRef.current = null;
    }
    if (mapRef.current) {
      (mapRef.current as any)._leaflet_id = undefined;
    }

    const valid = professionals.filter(p => p.lat && p.lng);
    const centerLat = valid.length
      ? valid.reduce((s, p) => s + p.lat!, 0) / valid.length
      : 44.0;
    const centerLng = valid.length
      ? valid.reduce((s, p) => s + p.lng!, 0) / valid.length
      : -0.9;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
      if ((mapRef.current as any)._leaflet_id !== undefined) {
        (mapRef.current as any)._leaflet_id = undefined;
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLng],
        zoom: valid.length === 1 ? 14 : 9,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      instanceRef.current = map;
      readyRef.current = true;

      // Exécuter une commande en attente si émise avant l'init
      if (pendingRef.current) {
        const { lat, lng, zoom } = pendingRef.current;
        pendingRef.current = null;
        try {
          map.flyTo([lat, lng], zoom, { animate: true, duration: 1 });
        } catch {
          map.setView([lat, lng], zoom);
        }
      }

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      import("@/lib/storage").then(({ getApprovedReviewsByPro }) => {

      // Pre-compute ratings for all pros
      const ratings: Record<string, { avg: number; count: number }> = {};
      valid.forEach(pro => {
        const reviews = getApprovedReviewsByPro(pro.id);
        if (reviews.length) {
          const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
          ratings[pro.id] = { avg: Math.round(avg * 10) / 10, count: reviews.length };
        }
      });

      valid.forEach(pro => {
        const color    = PLAN_COLORS[pro.plan] || PLAN_COLORS.standard;
        const initials = pro.companyName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

        // Contenu intérieur : logo si disponible, sinon initiales
        const innerContent = pro.logo
          ? `<img src="${pro.logo}" alt="${pro.companyName}" style="
              width:26px;height:26px;
              border-radius:50%;
              object-fit:cover;
              display:block;
            " />`
          : `<span style="
              color:white;font-size:10px;font-weight:bold;
              font-family:Inter,sans-serif;
              line-height:1;
            ">${initials}</span>`;

        const icon = L.divIcon({
          className: "",
          html: `<div style="position:relative;width:38px;height:38px;">
            <div style="
              width:38px;height:38px;
              background:${color};
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:2.5px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.25);
            "></div>
            <div style="
              position:absolute;top:6px;left:6px;
              width:26px;height:26px;
              display:flex;align-items:center;justify-content:center;
              overflow:hidden;
              border-radius:50%;
            ">${innerContent}</div>
          </div>`,
          iconSize:    [38, 38],
          iconAnchor:  [19, 38],
          popupAnchor: [0, -42],
        });

        const rating = ratings[pro.id];
        const starsHtml = rating
          ? `<div style="display:flex;align-items:center;gap:2px;margin:2px 0;">
              ${[1,2,3,4,5].map(s => `<svg width="11" height="11" viewBox="0 0 24 24" fill="${s <= Math.round(rating.avg) ? '#FBBF24' : '#E5E7EB'}" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`).join('')}
              <span style="font-size:10px;font-weight:700;color:#374151;margin-left:2px">${rating.avg.toFixed(1)}</span>
              <span style="font-size:10px;color:#9CA3AF">(${rating.count})</span>
            </div>`
          : '';

        const popup = L.popup({ maxWidth: 220, closeButton: false, autoPan: false })
          .setContent(`
            <div style="font-family:Inter,sans-serif;min-width:160px;display:flex;flex-direction:column;gap:4px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
                ${pro.logo
                  ? `<img src="${pro.logo}" alt="${pro.companyName}" style="width:32px;height:32px;border-radius:8px;object-fit:cover;border:1px solid #e5e7eb;flex-shrink:0;" />`
                  : `<div style="width:32px;height:32px;border-radius:8px;background:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:white;font-size:11px;font-weight:bold;">${initials}</div>`
                }
                <div>
                  <p style="font-weight:700;color:#1A3A2A;margin:0;font-size:13px;line-height:1.3">${pro.companyName}</p>
                  <p style="color:#4A7C5E;font-size:11px;margin:0">${pro.category}</p>
                  ${starsHtml}
                </div>
              </div>
              <p style="color:#555;font-size:11px;margin:0">📍 ${pro.city}</p>
              <a href="${buildProfileUrl(pro)}" style="
                display:inline-block;margin-top:4px;
                background:#2D5A3D;color:white;
                font-size:11px;font-weight:600;
                padding:4px 10px;border-radius:6px;
                text-decoration:none;
              ">Voir la fiche →</a>
            </div>
          `);

        const marker = L.marker([pro.lat!, pro.lng!], { icon })
          .addTo(map)
          .bindPopup(popup);

        // Ouvrir au survol
        marker.on("mouseover", () => marker.openPopup());
        // Fermer en quittant le marqueur (sauf si la souris passe sur la popup)
        marker.on("mouseout", (e: any) => {
          // Délai pour laisser le temps à la souris d'entrer dans la popup
          setTimeout(() => {
            const popupEl = marker.getPopup()?.getElement();
            if (!popupEl?.matches(":hover") && !marker.getElement()?.matches(":hover")) {
              marker.closePopup();
            }
          }, 200);
        });
        // Clic = naviguer vers la fiche
        marker.on("click", () => onSelectPro?.(pro.id));
      });

      if (valid.length > 1) {
        const bounds = L.latLngBounds(valid.map(p => [p.lat!, p.lng!] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
      }); // end import storage
    });

    return () => {
      cancelled = true;
      readyRef.current = false;
      pendingRef.current = null;
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
      if (mapRef.current) {
        (mapRef.current as any)._leaflet_id = undefined;
      }
    };
  }, [professionals, onSelectPro]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}
