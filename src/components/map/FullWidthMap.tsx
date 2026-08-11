"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import { getProfessionals } from "@/lib/storage";
import { Professional } from "@/types";

const MultiMap = dynamic(() => import("@/components/map/MultiMap"), { ssr: false });

// Pros de démo géolocalisés pour peupler la carte
const DEMO_PROS: Professional[] = [
  { id: "d1",  companyName: "Boulangerie des Pins",    category: "Alimentation & Épicerie",      city: "Mont-de-Marsan", postalCode: "40000", address: "12 rue de la Paix",           lat: 43.8940, lng: -0.5020, plan: "gold",     status: "active", siren: "000000001", legalForm: "SARL",   description: "", firstName: "Jean",     lastName: "Martin",   email: "d1@demo.fr", phone: "05 58 11 22 33", createdAt: "", updatedAt: "" },
  { id: "d2",  companyName: "Charpente Landaise",      category: "Bâtiment & Travaux",            city: "Dax",            postalCode: "40100", address: "5 avenue du Bois",            lat: 43.7080, lng: -1.0550, plan: "premium",  status: "active", siren: "000000002", legalForm: "SAS",    description: "", firstName: "Paul",     lastName: "Dupont",   email: "d2@demo.fr", phone: "05 58 22 33 44", createdAt: "", updatedAt: "" },
  { id: "d3",  companyName: "Surf School Biscarrosse", category: "Sport & Fitness",               city: "Biscarrosse",    postalCode: "40600", address: "1 front de mer",              lat: 44.3970, lng: -1.1650, plan: "gold",     status: "active", siren: "000000003", legalForm: "EURL",   description: "", firstName: "Marc",     lastName: "Surfer",   email: "d3@demo.fr", phone: "05 58 33 44 55", createdAt: "", updatedAt: "" },
  { id: "d4",  companyName: "La Table des Landes",     category: "Hôtellerie & Restauration",     city: "Mont-de-Marsan", postalCode: "40000", address: "8 place des Arts",            lat: 43.8880, lng: -0.4990, plan: "premium",  status: "active", siren: "000000004", legalForm: "SARL",   description: "", firstName: "Sophie",   lastName: "Chef",     email: "d4@demo.fr", phone: "05 58 44 55 66", createdAt: "", updatedAt: "" },
  { id: "d5",  companyName: "Spa des Thermes",         category: "Beauté & Bien-être",            city: "Dax",            postalCode: "40100", address: "3 rue des Thermes",           lat: 43.7120, lng: -1.0500, plan: "gold",     status: "active", siren: "000000005", legalForm: "SAS",    description: "", firstName: "Claire",   lastName: "Zen",      email: "d5@demo.fr", phone: "05 58 55 66 77", createdAt: "", updatedAt: "" },
  { id: "d6",  companyName: "Domaine des Pins",        category: "Hébergement & Tourisme",        city: "Sabres",         postalCode: "40630", address: "Route des Pins",              lat: 44.1520, lng: -0.7310, plan: "premium",  status: "active", siren: "000000006", legalForm: "SAS",    description: "", firstName: "Pierre",   lastName: "Forêt",    email: "d6@demo.fr", phone: "06 12 34 56 78", createdAt: "", updatedAt: "" },
  { id: "d7",  companyName: "Web Landes",              category: "Informatique & Numérique",      city: "Mont-de-Marsan", postalCode: "40000", address: "15 rue du Numérique",         lat: 43.8960, lng: -0.5040, plan: "standard", status: "active", siren: "000000007", legalForm: "SASU",   description: "", firstName: "Alex",     lastName: "Dev",      email: "d7@demo.fr", phone: "05 58 66 77 88", createdAt: "", updatedAt: "" },
  { id: "d8",  companyName: "Poterie Landaise",        category: "Artisanat & Métiers d'art",     city: "Dax",            postalCode: "40100", address: "2 impasse des Arts",          lat: 43.7060, lng: -1.0580, plan: "premium",  status: "active", siren: "000000008", legalForm: "EI",     description: "", firstName: "Anne",     lastName: "Potter",   email: "d8@demo.fr", phone: "05 58 77 88 99", createdAt: "", updatedAt: "" },
  { id: "d9",  companyName: "Ferme des Landes",        category: "Nature & Agriculture",          city: "Hagetmau",       postalCode: "40700", address: "Chemin de la Ferme",          lat: 43.6429, lng: -0.5910, plan: "standard", status: "active", siren: "000000009", legalForm: "EI",     description: "", firstName: "Louis",    lastName: "Farmer",   email: "d9@demo.fr", phone: "05 58 88 99 00", createdAt: "", updatedAt: "" },
  { id: "d10", companyName: "Taxi Landes Express",     category: "Transport & Logistique",        city: "Capbreton",      postalCode: "40130", address: "Place de la Gare",            lat: 43.6640, lng: -1.4450, plan: "premium",  status: "active", siren: "000000010", legalForm: "EI",     description: "", firstName: "René",     lastName: "Taxi",     email: "d10@demo.fr", phone: "05 58 99 00 11", createdAt: "", updatedAt: "" },
  { id: "d11", companyName: "Cabinet Kiné Landes",     category: "Médical & Paramédical",        city: "Soustons",       postalCode: "40140", address: "10 avenue de la Santé",       lat: 43.7550, lng: -1.2760, plan: "gold",     status: "active", siren: "000000011", legalForm: "SELARL", description: "", firstName: "Nathalie", lastName: "Kiné",     email: "d11@demo.fr", phone: "05 58 00 11 22", createdAt: "", updatedAt: "" },
  { id: "d12", companyName: "Villa Océane",            category: "Hébergement & Tourisme",        city: "Mimizan",        postalCode: "40200", address: "3 avenue de l'Océan",         lat: 44.2050, lng: -1.2310, plan: "premium",  status: "active", siren: "000000012", legalForm: "SCI",    description: "", firstName: "Éric",     lastName: "Plage",    email: "d12@demo.fr", phone: "06 34 56 78 90", createdAt: "", updatedAt: "" },
  { id: "d13", companyName: "École de Musique Dax",    category: "Culture & Loisirs",             city: "Dax",            postalCode: "40100", address: "8 rue des Arts",              lat: 43.7101, lng: -1.0527, plan: "premium",  status: "active", siren: "000000013", legalForm: "Association", description: "", firstName: "Sylvie",   lastName: "Musique",  email: "d13@demo.fr", phone: "05 58 22 33 44", createdAt: "", updatedAt: "" },
  { id: "d14", companyName: "Landes Immobilier",       category: "Immobilier",                   city: "Mont-de-Marsan", postalCode: "40000", address: "15 rue Saint-Pierre",         lat: 43.8914, lng: -0.5006, plan: "gold",     status: "active", siren: "000000014", legalForm: "SARL",   description: "", firstName: "Frédéric", lastName: "Immo",     email: "d14@demo.fr", phone: "05 58 11 22 33", createdAt: "", updatedAt: "" },
  { id: "d15", companyName: "Vélo Évasion Landes",     category: "Sport & Fitness",               city: "Mimizan",        postalCode: "40200", address: "5 Route des Pistes",          lat: 44.2050, lng: -1.2350, plan: "premium",  status: "active", siren: "000000015", legalForm: "EURL",   description: "", firstName: "Pierre",   lastName: "Vélo",     email: "d15@demo.fr", phone: "05 58 33 44 55", createdAt: "", updatedAt: "" },
];

export default function FullWidthMap() {
  const router = useRouter();
  const [pros, setPros]   = useState<Professional[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const real = getProfessionals().filter(p => p.status === "active" && p.lat && p.lng);
    const merged = [...real];
    DEMO_PROS.forEach(d => { if (!merged.find(p => p.id === d.id)) merged.push(d); });
    setPros(merged);
    setLoaded(true);
  }, []);

  return (
    <section className="w-full bg-landes-hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch min-h-[480px]">

          {/* ── Colonne gauche — contenu éditorial ── */}
          <div className="flex flex-col justify-center py-14 pr-0 lg:pr-12">

            {/* Phrase d'accroche */}
            <p className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-10">
              Le lien entre les{" "}
              <span className="text-landes-sand">professionnels landais</span>{" "}
              et ceux qui les cherchent, au bon endroit et au bon moment.
            </p>

            {/* Deux colonnes de mots-clés */}
            <div className="grid grid-cols-2 gap-8">

              {/* Professionnels */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-landes-sand mb-3">
                  Professionnels
                </p>
                <div className="flex flex-col gap-2">
                  {["Visibilité", "Prospection", "Référencement", "Notoriété", "Clients", "Croissance"].map(w => (
                    <span key={w} className="flex items-center gap-2 text-white/90 text-sm font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-landes-sand flex-shrink-0" />
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              {/* Consommateurs */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-landes-sand mb-3">
                  Consommateurs
                </p>
                <div className="flex flex-col gap-2">
                  {["Proximité", "Confiance", "Rapidité", "Choix", "Recommandations", "Local"].map(w => (
                    <span key={w} className="flex items-center gap-2 text-white/90 text-sm font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-landes-sage flex-shrink-0" />
                      {w}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── Colonne droite — carte ── */}
          <div className="relative min-h-[360px] lg:min-h-[480px]">
            {loaded ? (
              <MultiMap
                professionals={pros}
                onSelectPro={id => router.push(`/annuaire/${id}`)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center space-y-2">
                  <MapPin className="w-8 h-8 text-gray-300 mx-auto animate-pulse" />
                  <p className="text-sm text-gray-400">Chargement de la carte…</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
