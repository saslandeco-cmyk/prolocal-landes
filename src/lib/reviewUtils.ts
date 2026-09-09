import { getApprovedReviewsByPro } from "@/lib/storage";

export function getProRating(proId: string): { avg: number; count: number } {
  if (typeof window === "undefined") return { avg: 0, count: 0 };
  const reviews = getApprovedReviewsByPro(proId);
  if (!reviews.length) return { avg: 0, count: 0 };
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return { avg: Math.round(avg * 10) / 10, count: reviews.length };
}
