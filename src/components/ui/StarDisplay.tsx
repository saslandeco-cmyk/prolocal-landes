"use client";
import { Star } from "lucide-react";

interface StarDisplayProps {
  rating: number;   // 0–5
  count?: number;
  size?: "xs" | "sm" | "md";
  showCount?: boolean;
}

export default function StarDisplay({ rating, count, size = "sm", showCount = true }: StarDisplayProps) {
  if (!rating) return null;
  const cls = { xs: "w-3 h-3", sm: "w-3.5 h-3.5", md: "w-4 h-4" }[size];
  const txt = { xs: "text-[10px]", sm: "text-xs", md: "text-sm" }[size];

  return (
    <span className={`inline-flex items-center gap-0.5 ${txt}`}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`${cls} flex-shrink-0 ${
          s <= Math.round(rating)
            ? "fill-amber-400 text-amber-400"
            : s - 0.5 <= rating
            ? "fill-amber-200 text-amber-200"
            : "fill-gray-200 text-gray-200"
        }`} />
      ))}
      <span className="ml-1 font-semibold text-gray-700">{rating.toFixed(1)}</span>
      {showCount && count !== undefined && count > 0 && (
        <span className="text-gray-400 ml-0.5">({count})</span>
      )}
    </span>
  );
}
