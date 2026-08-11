"use client";
import Link from "next/link";
import {
  Search, MapPin, ArrowRight,
  Trees, Shield, TrendingUp,
} from "lucide-react";
import { PLANS, CATEGORIES } from "@/types";
import HeroImage from "@/components/ui/HeroImage";
import SearchBar from "@/components/professional/SearchBar";
import FeaturedProfessionals from "@/components/professional/FeaturedProfessionals";
import FullWidthMap from "@/components/map/FullWidthMap";

const STATS = [
  { value: "500+", label: "Professionnels référencés" },
  { value: "40+",  label: "Communes couvertes" },
  { value: "17",   label: "Catégories" },
  { value: "4.8/5",label: "Note moyenne" },
];

const CATEGORY_ICONS: Record<string, string> = {
  "Alimentation & Épicerie":    "🥖",
  "Artisanat & Métiers d'art":  "🎨",
  "Bâtiment & Travaux":         "🔨",
  "Beauté & Bien-être":         "💆",
  "Commerce & Vente":           "🛍️",
  "Culture & Loisirs":          "🎭",
  "Éducation & Formation":      "📚",
  "Hébergement & Tourisme":     "🏡",
  "Hôtellerie & Restauration":  "🍽️",
  "Immobilier":                 "🏠",
  "Informatique & Numérique":   "💻",
  "Médical & Paramédical":      "🏥",
  "Nature & Agriculture":       "🌾",
  "Services à la personne":     "🤝",
  "Sport & Fitness":            "🏄",
  "Transport & Logistique":     "🚚",
};

const CATEGORY_SLUGS: Record<string, string> = {
  "Alimentation & Épicerie":    "alimentation",
  "Artisanat & Métiers d'art":  "artisanat",
  "Bâtiment & Travaux":         "batiment",
  "Beauté & Bien-être":         "beaute",
  "Commerce & Vente":           "commerce",
  "Culture & Loisirs":          "culture",
  "Éducation & Formation":      "education",
  "Hébergement & Tourisme":     "hebergement",
  "Hôtellerie & Restauration":  "restauration",
  "Immobilier":                 "immobilier",
  "Informatique & Numérique":   "informatique",
  "Médical & Paramédical":      "medical",
  "Nature & Agriculture":       "agriculture",
  "Services à la personne":     "services",
  "Sport & Fitness":            "sport",
  "Transport & Logistique":     "transport",
};

const FEATURED_CATEGORIES = CATEGORIES.map(name => ({
  name,
  icon: CATEGORY_ICONS[name] || "📌",
  slug: CATEGORY_SLUGS[name],
}));

export default function HomePage() {
  return (
    <div className="bg-landes-cream">

      {/* HERO */}
      <section className="relative bg-landes-hero overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-landes-sky blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-24">

          {/* Top row — text centré à gauche + slider à droite */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-12">

            {/* LEFT — texte centré */}
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2 rounded-full mb-6">
                <MapPin className="w-4 h-4 text-landes-sand" />
                <span>Annuaire local — Département des Landes (40)</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
                Trouvez les pros<br />
                <span className="text-landes-sand">près de chez vous</span><br />
                dans les Landes
              </h1>
              <p className="text-lg text-gray-300 max-w-md">
                L&apos;annuaire de référence des professionnels landais.
                Géolocalisez, filtrez et contactez en un clic.
              </p>
            </div>

            {/* RIGHT — photo hero */}
            <div className="hidden lg:block">
              <HeroImage />
            </div>
          </div>

          {/* Barre de recherche pleine largeur */}
          <SearchBar />

          {/* Bouton inscription pro */}
          <div className="mt-5 flex justify-center">
            <Link
              href="/inscription"
              className="btn-amber flex items-center gap-2 text-base py-3 px-8"
            >
              Référencer mon activité dans l&apos;annuaire <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 50 960 10 720 30C480 50 240 10 0 20L0 60Z" fill="#FAF7F0"/>
          </svg>
        </div>
      </section>

      {/* FEATURED PROFESSIONALS */}
      <FeaturedProfessionals />

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ display: "none" }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="card p-6 text-center">
              <div className="text-3xl font-bold text-landes-forest mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold text-landes-sage uppercase tracking-wider mb-1">Explorer</p>
          <h2 className="section-title">Toutes les catégories</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {FEATURED_CATEGORIES.map(cat => (
            <Link key={cat.name}
              href={`/categories/${cat.slug}`}
              className="card p-5 hover:shadow-md hover:border-landes-sage/30 border border-transparent transition-all duration-200 group">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <h3 className="font-semibold text-gray-800 text-sm group-hover:text-landes-forest transition-colors leading-tight">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO TEXT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-landes-pine/5 border border-landes-sage/20 rounded-2xl p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-landes-pine mb-6">
            Vous recherchez un professionnel Landais&nbsp;?
          </h2>
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-4">
            <p className="font-semibold text-landes-forest text-base">
              Trouvez les pros près de chez vous dans les Landes
            </p>
            <p>
              Vous recherchez un professionnel de confiance dans les Landes pour réaliser vos travaux, trouver un artisan qualifié ou bénéficier d&apos;un service de proximité&nbsp;? Notre plateforme vous permet de trouver les pros près de chez vous dans les Landes en quelques clics. Découvrez une sélection d&apos;entreprises locales, d&apos;artisans, de commerçants et de prestataires de services reconnus pour leur savoir-faire.
            </p>
            <p>
              Que vous soyez à <strong className="text-landes-pine">Mont-de-Marsan</strong>, <strong className="text-landes-pine">Dax</strong>, <strong className="text-landes-pine">Biscarrosse</strong>, <strong className="text-landes-pine">Capbreton</strong>, <strong className="text-landes-pine">Saint-Paul-lès-Dax</strong>, <strong className="text-landes-pine">Tarnos</strong> ou dans une autre commune des Landes, accédez rapidement aux coordonnées de professionnels proches de chez vous.
            </p>
            <p>
              Comparez les prestations, contactez directement les entreprises locales et choisissez le professionnel qui répond le mieux à votre projet. Grâce à notre annuaire local, il devient simple de trouver un expert fiable dans les Landes tout en favorisant les entreprises de proximité.
            </p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/annuaire" className="btn-primary flex items-center justify-center gap-2 py-3 px-6">
              <Search className="w-4 h-4" /> Rechercher un professionnel
            </Link>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-landes-sage uppercase tracking-wider mb-1">Pourquoi nous choisir</p>
            <h2 className="section-title">L&apos;annuaire fait pour les Landes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: MapPin,     title: "100% local",               desc: "Uniquement des professionnels établis dans les Landes (40). Fiches vérifiées par numéro SIREN." },
              { icon: Shield,     title: "Professionnels vérifiés",  desc: "Chaque inscription est validée par notre équipe. Seuls les vrais professionnels sont référencés." },
              { icon: TrendingUp, title: "Boostez votre visibilité", desc: "Soyez trouvé par des milliers de clients locaux qui cherchent vos services près de chez eux." },
            ].map(item => (
              <div key={item.title} className="text-center p-6">
                <div className="w-14 h-14 bg-landes-forest/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-landes-forest" />
                </div>
                <h3 className="font-bold text-landes-pine text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA PROFESSIONNELS — au-dessus des tarifs */}
      <section className="bg-landes-pine text-white py-16 mx-4 sm:mx-8 lg:mx-12 rounded-3xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Trees className="w-10 h-10 text-landes-sand flex-shrink-0" />
            <h2 className="text-2xl sm:text-3xl font-bold">Vous êtes professionnel dans les Landes ?</h2>
          </div>

          <div className="space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
            <p>
              Vous êtes artisan, commerçant, entrepreneur, profession libérale ou dirigeant d&apos;une entreprise dans les Landes ? Rejoignez notre annuaire local et donnez davantage de visibilité à votre activité. En vous inscrivant, vous améliorez votre présence sur Internet et augmentez vos chances d&apos;être trouvé par des particuliers et des professionnels qui recherchent un prestataire près de chez eux.
            </p>
            <p>
              Chaque jour, de nombreux internautes recherchent un artisan, une entreprise ou un professionnel de confiance dans les Landes pour réaliser un projet, demander un devis ou bénéficier d&apos;un service de proximité. Grâce à notre annuaire, votre entreprise apparaît auprès d&apos;une audience locale qualifiée, prête à entrer en contact avec un professionnel compétent.
            </p>
            <p>
              Notre plateforme référence des entreprises de tous les secteurs d&apos;activité : bâtiment, rénovation, immobilier, automobile, santé, beauté, restauration, commerce, services à la personne, informatique, communication, métiers du numérique, professions libérales et bien d&apos;autres encore. Que vous soyez installé à <strong className="text-landes-sand">Mont-de-Marsan</strong>, <strong className="text-landes-sand">Dax</strong>, <strong className="text-landes-sand">Biscarrosse</strong>, <strong className="text-landes-sand">Capbreton</strong>, <strong className="text-landes-sand">Hossegor</strong>, <strong className="text-landes-sand">Mimizan</strong>, <strong className="text-landes-sand">Saint-Paul-lès-Dax</strong>, <strong className="text-landes-sand">Tarnos</strong> ou dans toute autre commune des Landes, votre fiche professionnelle permet à vos futurs clients de vous découvrir rapidement.
            </p>
            <p>
              En créant votre profil, vous pouvez présenter votre entreprise, mettre en avant vos compétences, vos prestations, vos coordonnées et les informations essentielles qui faciliteront la prise de contact. Une fiche complète inspire davantage confiance et améliore vos opportunités de recevoir de nouvelles demandes.
            </p>
            <p>
              Être présent dans un annuaire spécialisé dédié aux professionnels landais constitue également un véritable atout pour votre visibilité locale. Votre entreprise bénéficie d&apos;une présence renforcée sur les recherches effectuées par les internautes souhaitant trouver un professionnel dans les Landes, ce qui contribue à développer votre notoriété et à générer davantage de contacts qualifiés.
            </p>
            <p className="font-medium text-white">
              N&apos;attendez plus pour faire connaître votre activité. Inscrivez-vous dans notre annuaire des professionnels des Landes, valorisez votre savoir-faire et soyez trouvé plus facilement par vos futurs clients. Rejoignez dès aujourd&apos;hui les entreprises qui font confiance à notre plateforme pour développer leur visibilité locale et attirer de nouvelles opportunités commerciales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/inscription"
              className="btn-amber flex items-center justify-center gap-2 text-base py-4 px-8">
              Inscrire mon entreprise <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="tarifs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-landes-sage uppercase tracking-wider mb-1">Tarifs transparents</p>
          <h2 className="section-title">Choisissez votre formule</h2>
          <p className="text-gray-500 mt-2">Sans engagement. Modifiable à tout moment.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div key={plan.id}
              className={`card p-8 border-2 relative flex flex-col ${plan.highlight ? "border-purple-300 shadow-lg" : "border-gray-100"}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Le plus populaire
                </div>
              )}
              <h3 className={`text-xl font-bold mb-1 ${plan.color}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                <span className="text-gray-400">/mois</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/inscription"
                className={`mt-auto block text-center py-3 rounded-lg font-semibold transition-all ${
                  plan.highlight
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "border-2 border-landes-forest text-landes-forest hover:bg-landes-forest hover:text-white"
                }`}>
                Choisir {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* MAP FULL WIDTH — avant le footer */}
      <FullWidthMap />

    </div>
  );
}
