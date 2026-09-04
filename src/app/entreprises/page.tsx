import type { Metadata } from "next";
import EntreprisesSearchClient from "@/components/entreprises/EntreprisesSearchClient";

// Non indexable — voir la note dans src/app/entreprises/[...slug]/page.tsx
export const metadata: Metadata = {
  title: "Rechercher une entreprise dans les Landes | Prolocal-Landes",
  description: "Base exhaustive des entreprises actives des Landes (40), issue du répertoire SIRENE. Recherchez par métier, code APE ou commune.",
  robots: { index: false, follow: true },
};

export default function EntreprisesIndexPage() {
  return <EntreprisesSearchClient />;
}
