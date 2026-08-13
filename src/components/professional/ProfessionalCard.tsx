"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Professional } from "@/types";
import { MapPin, Phone, Globe, ArrowRight } from "lucide-react";
import StarDisplay from "@/components/ui/StarDisplay";
import { getProRating } from "@/lib/reviewUtils";
import { getBanner } from "@/lib/defaultBanners";
import { rehydrateAsync } from "@/lib/storage";

interface ProfessionalCardProps {
  pro: Professional;
}

export default function ProfessionalCard({ pro: propPro }: ProfessionalCardProps) {
  const [pro, setPro] = useState<Professional>(propPro);
  const initials = pro.companyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const [rating, setRating] = useState<{ avg: number; count: number } | null>(null);
  const bannerSrc = getBanner(pro.banner, pro.category);

  useEffect(() => {
    setRating(getProRating(pro.id));
  }, [pro.id]);

  // Charge le logo et la bannière depuis IndexedDB si absents
  useEffect(() => {
    if (!propPro.logo && !propPro.banner && !propPro.photos?.length) {
      rehydrateAsync(propPro).then(full => {
        if (full.logo || full.banner || full.photos?.length) setPro(full);
      });
    }
  }, [propPro.id]);

  return (
    <Link
      href={`/annuaire/${pro.id}`}
      className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 block group overflow-hidden"
    >
      {/* Bannière + logo à cheval */}
      <div className="w-full h-32 relative">
        {bannerSrc
          ? <img src={bannerSrc} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-landes-pine via-landes-forest to-landes-ocean" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Logo positionné à cheval sur la bannière et le contenu */}
        <div className="absolute -bottom-7 left-5">
          {pro.logo ? (
            <img
              src={pro.logo}
              alt={`Logo ${pro.companyName}`}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-landes-forest to-landes-sage rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-md">
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Contenu — pt-10 pour laisser la place au logo + espace */}
      <div className="px-5 pt-10 pb-5">
        <div className="flex items-start gap-4">

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-landes-pine text-base truncate group-hover:text-landes-forest transition-colors">
            {pro.companyName}
          </h3>

          {/* Catégorie + étoiles sur la même ligne */}
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <p className="text-sm text-landes-sage font-medium">{pro.category}</p>
            {rating && rating.avg > 0 && (
              <StarDisplay rating={rating.avg} count={rating.count} size="xs" />
            )}
          </div>

          <p className="mt-2 text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: pro.description.replace(/<[^>]*>/g, " ").trim() }} />

          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 bg-landes-forest/10 rounded flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3 h-3 text-landes-forest" />
                </div>
                <span className="text-xs font-semibold text-landes-pine truncate">{pro.city}</span>
              </div>
              {pro.phone ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5 h-5 bg-landes-sage/10 rounded flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3 h-3 text-landes-sage" />
                  </div>
                  <span className="text-xs font-semibold text-landes-pine truncate">{pro.phone}</span>
                </div>
              ) : <div />}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end">
        <span className="text-xs text-landes-forest font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Voir la fiche <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
      </div>
    </Link>
  );
}
