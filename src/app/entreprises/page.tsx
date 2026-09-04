import type { Metadata } from "next";
import EntreprisesSearchClient from "@/components/entreprises/EntreprisesSearchClient";

export const metadata: Metadata = {
  title: "Rechercher une entreprise dans les Landes | Prolocal-Landes",
  description: "Base exhaustive des entreprises actives des Landes (40), issue du répertoire SIRENE. Recherchez par métier, code APE ou commune.",
};

export default function EntreprisesIndexPage() {
  return <EntreprisesSearchClient />;
}
