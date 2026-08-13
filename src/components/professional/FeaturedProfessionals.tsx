"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Phone, ArrowRight } from "lucide-react";
import StarDisplay from "@/components/ui/StarDisplay";
import { getProfessionalsWithImages } from "@/lib/storage";
import { getBanner } from "@/lib/defaultBanners";
import type { Professional } from "@/types";
import { getProRating } from "@/lib/reviewUtils";

interface FeaturedPro {
  id: string;
  name: string;
  job: string;
  city: string;
  phone: string;
  desc: string;
  badge?: "gold" | "premium";
  from: string;
  to: string;
  emoji: string;
  initials: string;
  logo?: string;
  banner?: string;
}

interface FeaturedTab {
  label: string;
  icon: string;
  category: string;
  pros: FeaturedPro[];
}

const FEATURED_TABS: FeaturedTab[] = [
  {
    label: "Alimentation",
    icon: "🥖",
    category: "Alimentation & Épicerie",
    pros: [
      { id: "a1", name: "Boulangerie des Pins", job: "Boulanger-Pâtissier", city: "Mont-de-Marsan", phone: "05 58 11 22 33", desc: "Pain au levain, viennoiseries maison et pâtisseries artisanales cuites au four à bois depuis 1987.", badge: "gold", from: "#3D1F0A", to: "#7C3D1A", emoji: "🥖", initials: "BP", banner: "/banners/alimentation.jpg" },
      { id: "a2", name: "Fromagerie Landaise", job: "Fromager affineur", city: "Dax", phone: "05 58 22 33 44", desc: "Sélection de fromages fermiers et affinés. Cave à fromages avec 80 références dont les spécialités locales.", badge: "premium", from: "#4A3A0A", to: "#8A6A1A", emoji: "🧀", initials: "FL", banner: "/banners/alimentation.jpg" },
      { id: "a3", name: "Épicerie du Marché", job: "Épicier fine alimentaire", city: "Hossegor", phone: "05 58 33 44 55", desc: "Produits locaux et régionaux de qualité. Conserves artisanales, foie gras, confits et vins des Landes.", from: "#2A1A0A", to: "#5A3A1A", emoji: "🧺", initials: "EM", banner: "/banners/alimentation.jpg" },
      { id: "a4", name: "Charcuterie Dupont", job: "Charcutier-Traiteur", city: "Hagetmau", phone: "05 58 44 55 66", desc: "Charcuterie artisanale : jambon de Bayonne, saucissons, pâtés et rillettes. Traiteur pour événements.", badge: "gold", from: "#5A1A1A", to: "#8A2A2A", emoji: "🥩", initials: "CD", banner: "/banners/alimentation.jpg" },
      { id: "a5", name: "Marché Bio Landes", job: "Primeur & Épicerie bio", city: "Biscarrosse", phone: "05 58 55 66 77", desc: "Fruits et légumes biologiques locaux, produits en vrac et circuits courts. Panier bio hebdomadaire.", badge: "premium", from: "#1A3A0A", to: "#2A6A1A", emoji: "🥦", initials: "MB", banner: "/banners/alimentation.jpg" },
    ],
  },
  {
    label: "Artisanat",
    icon: "🎨",
    category: "Artisanat & Métiers d'art",
    pros: [
      { id: "b1", name: "Poterie Landaise", job: "Céramiste & Potier", city: "Dax", phone: "05 58 12 34 56", desc: "Création de pièces uniques en terre cuite landaise. Ateliers ouverts au public toute l'année.", badge: "gold", from: "#5C2D0A", to: "#A0522D", emoji: "🏺", initials: "PL", banner: "/banners/artisanat.jpg" },
      { id: "b2", name: "Forge des Pins", job: "Forgeron d'art", city: "Mont-de-Marsan", phone: "05 58 23 45 67", desc: "Ferronnerie d'art sur mesure, portails, mobilier et décoration intérieure en métal forgé.", badge: "premium", from: "#1A1A2E", to: "#16213E", emoji: "⚒️", initials: "FP", banner: "/banners/artisanat.jpg" },
      { id: "b3", name: "Maroquinerie Côte", job: "Maroquinier artisan", city: "Hossegor", phone: "05 58 34 56 78", desc: "Sacs, ceintures et accessoires en cuir tannés végétalement. Créations et réparations sur mesure.", from: "#4A1A00", to: "#8B4513", emoji: "👜", initials: "MC", banner: "/banners/artisanat.jpg" },
      { id: "b4", name: "Menuiserie Larroque", job: "Menuisier ébéniste", city: "Tartas", phone: "05 58 44 55 66", desc: "Fabrication de meubles sur mesure en bois massif. Restauration de pièces anciennes.", badge: "premium", from: "#1A2E1A", to: "#2D5A2D", emoji: "🪵", initials: "ML", banner: "/banners/artisanat.jpg" },
      { id: "b5", name: "Verrerie des Landes", job: "Souffleur de verre", city: "Mimizan", phone: "05 58 55 66 77", desc: "Art du verre soufflé à la bouche. Pièces décoratives et fonctionnelles en verre coloré.", from: "#0A2A3A", to: "#1A5A7A", emoji: "🫧", initials: "VL", banner: "/banners/artisanat.jpg" },
    ],
  },
  {
    label: "Bâtiment",
    icon: "🔨",
    category: "Bâtiment & Travaux",
    pros: [
      { id: "c1", name: "Charpente Landaise", job: "Charpentier-Couvreur", city: "Tartas", phone: "05 58 78 90 12", desc: "Charpente traditionnelle et ossature bois. Couverture tuile et ardoise. Devis gratuit sous 48h.", badge: "gold", from: "#1A2A0A", to: "#2D5A1F", emoji: "🏗️", initials: "CL", banner: "/banners/batiment.jpg" },
      { id: "c2", name: "Plâtrerie Soleil", job: "Plâtrier-Peintre", city: "Morcenx", phone: "05 58 89 01 23", desc: "Décoration intérieure, enduits décoratifs, peinture et pose de revêtements muraux et sols.", badge: "premium", from: "#2A2A1A", to: "#4A4A2A", emoji: "🖌️", initials: "PS", banner: "/banners/batiment.jpg" },
      { id: "c3", name: "Électricité Côte", job: "Électricien certifié", city: "Capbreton", phone: "05 58 90 12 34", desc: "Installation électrique neuf et rénovation, mise aux normes NF C 15-100, domotique et bornes EV.", from: "#0A1A3A", to: "#1A3A6A", emoji: "⚡", initials: "EC", banner: "/banners/batiment.jpg" },
      { id: "c4", name: "Maçonnerie Dupuy", job: "Maçon & Carreleur", city: "Aire-sur-l'Adour", phone: "05 58 01 12 23", desc: "Construction, rénovation et extension. Pose de carrelage, dallage et parquet. 20 ans d'expérience.", badge: "premium", from: "#3A2A1A", to: "#6A4A2A", emoji: "🧱", initials: "MD", banner: "/banners/batiment.jpg" },
      { id: "c5", name: "Plomberie Garros", job: "Plombier-Chauffagiste", city: "Hagetmau", phone: "05 58 12 23 34", desc: "Plomberie, chauffage et climatisation. Installation de pompes à chaleur et chauffe-eaux solaires.", from: "#1A2A4A", to: "#2A4A6A", emoji: "🔧", initials: "PG", banner: "/banners/batiment.jpg" },
    ],
  },
  {
    label: "Bien-être",
    icon: "💆",
    category: "Beauté & Bien-être",
    pros: [
      { id: "d1", name: "Spa des Thermes", job: "Institut de beauté & Spa", city: "Dax", phone: "05 58 01 23 45", desc: "Soins visage et corps, massages relaxants, balnéothérapie. Forfaits bien-être cadeau disponibles.", badge: "gold", from: "#3A1A3A", to: "#6A2A6A", emoji: "🧖", initials: "ST", banner: "/banners/beaute.jpg" },
      { id: "d2", name: "Yoga Océan", job: "Professeure de Yoga", city: "Hossegor", phone: "06 45 67 89 01", desc: "Cours de yoga tous niveaux, yoga nidra et méditation. Retraites bien-être en bord d'océan.", badge: "premium", from: "#1A2A3A", to: "#2A4A6A", emoji: "🧘", initials: "YO", banner: "/banners/beaute.jpg" },
      { id: "d3", name: "Coiffure Naturelle", job: "Coiffeur bio & éco-responsable", city: "Mont-de-Marsan", phone: "05 58 12 23 34", desc: "Coloration végétale, soins naturels, coupes femme-homme. Produits certifiés biologiques.", from: "#2A1A2A", to: "#4A2A4A", emoji: "✂️", initials: "CN", banner: "/banners/beaute.jpg" },
      { id: "d4", name: "Ostéopathie Côte", job: "Ostéopathe D.O.", city: "Soustons", phone: "05 58 34 45 56", desc: "Ostéopathie pour adultes, enfants et nourrissons. Consultations sur rendez-vous. Parking gratuit.", badge: "premium", from: "#0A2A2A", to: "#1A4A4A", emoji: "🩺", initials: "OC", banner: "/banners/beaute.jpg" },
      { id: "d5", name: "Institut Soleil", job: "Esthéticienne & Onglerie", city: "Biscarrosse", phone: "05 58 45 56 67", desc: "Soins du visage, épilations, poses d'ongles et semi-permanent. Ambiance cosy et personnalisée.", from: "#3A0A1A", to: "#6A1A3A", emoji: "💅", initials: "IS", banner: "/banners/beaute.jpg" },
    ],
  },
  {
    label: "Commerce",
    icon: "🛍️",
    category: "Commerce & Vente",
    pros: [
      { id: "e1", name: "Surf Shop Hossegor", job: "Surf & Sports de glisse", city: "Hossegor", phone: "05 58 11 22 33", desc: "Vente et location de planches de surf, combinaisons et accessoires. Réparation de boards.", badge: "gold", from: "#0A2A4A", to: "#1A4A7A", emoji: "🏄", initials: "SH", banner: "/banners/commerce.jpg" },
      { id: "e2", name: "Librairie des Pins", job: "Librairie indépendante", city: "Dax", phone: "05 58 22 33 44", desc: "Librairie généraliste avec rayon régionalisme landais. Commandes spéciales et dédicaces.", badge: "premium", from: "#2A1A0A", to: "#5A3A1A", emoji: "📚", initials: "LP", banner: "/banners/commerce.jpg" },
      { id: "e3", name: "Mode & Nature", job: "Boutique de mode éco", city: "Mont-de-Marsan", phone: "05 58 33 44 55", desc: "Vêtements et accessoires mode éco-responsables et fabriqués en France. Collections femme et homme.", from: "#1A2A1A", to: "#2A4A2A", emoji: "👗", initials: "MN", banner: "/banners/commerce.jpg" },
      { id: "e4", name: "Déco Landaise", job: "Décoration & Cadeaux", city: "Capbreton", phone: "05 58 44 55 66", desc: "Articles de décoration intérieure, cadeaux et souvenirs landais. Créations d'artisans locaux.", badge: "premium", from: "#3A2A0A", to: "#6A4A1A", emoji: "🏠", initials: "DL", banner: "/banners/commerce.jpg" },
      { id: "e5", name: "Sport & Outdoor", job: "Articles de sport & randonnée", city: "Biscarrosse", phone: "05 58 55 66 77", desc: "Équipements randonnée, vélo, camping et sports outdoor. Conseils personnalisés par des passionnés.", from: "#1A3A1A", to: "#2A5A2A", emoji: "🎒", initials: "SO", banner: "/banners/commerce.jpg" },
    ],
  },
  {
    label: "Culture",
    icon: "🎭",
    category: "Culture & Loisirs",
    pros: [
      { id: "f1", name: "Cinéma des Landes", job: "Cinéma art et essai", city: "Mont-de-Marsan", phone: "05 58 11 22 33", desc: "Cinéma indépendant proposant films art et essai, avant-premières et ciné-débats toute l'année.", badge: "gold", from: "#1A0A3A", to: "#3A1A6A", emoji: "🎬", initials: "CL", banner: "/banners/culture.jpg" },
      { id: "f2", name: "École de Musique", job: "Cours de musique tous niveaux", city: "Dax", phone: "05 58 22 33 44", desc: "Cours de guitare, piano, batterie, chant et éveil musical pour enfants et adultes. Stages vacances.", badge: "premium", from: "#3A1A0A", to: "#6A3A1A", emoji: "🎸", initials: "EM", banner: "/banners/culture.jpg" },
      { id: "f3", name: "Galerie Art Côte", job: "Galerie d'art contemporain", city: "Hossegor", phone: "05 58 33 44 55", desc: "Galerie d'art contemporain représentant des artistes landais et régionaux. Expositions temporaires.", from: "#0A1A3A", to: "#1A3A5A", emoji: "🖼️", initials: "GA", banner: "/banners/culture.jpg" },
      { id: "f4", name: "Escape Game Landes", job: "Escape game & Loisirs", city: "Biscarrosse", phone: "05 58 44 55 66", desc: "4 salles d'escape game pour groupes. Activités team building, anniversaires et soirées entre amis.", badge: "premium", from: "#2A0A2A", to: "#4A1A4A", emoji: "🔐", initials: "EG", banner: "/banners/culture.jpg" },
      { id: "f5", name: "Studio Danse Landes", job: "École de danse", city: "Tartas", phone: "05 58 55 66 77", desc: "Cours de danse classique, contemporaine, salsa et zumba. Spectacles de fin d'année.", from: "#3A0A1A", to: "#5A1A3A", emoji: "💃", initials: "SD", banner: "/banners/culture.jpg" },
    ],
  },
  {
    label: "Éducation",
    icon: "📚",
    category: "Éducation & Formation",
    pros: [
      { id: "g1", name: "Centre Cours Landes", job: "Soutien scolaire & Tutorat", city: "Mont-de-Marsan", phone: "05 58 11 22 33", desc: "Cours particuliers et soutien scolaire du primaire au lycée. Préparation aux examens et concours.", badge: "gold", from: "#0A1A3A", to: "#1A3A6A", emoji: "🎓", initials: "CC", banner: "/banners/education.jpg" },
      { id: "g2", name: "Langues Vivantes 40", job: "École de langues", city: "Dax", phone: "05 58 22 33 44", desc: "Cours d'anglais, espagnol, allemand et français langue étrangère. Préparation TOEFL et DELF.", badge: "premium", from: "#1A3A1A", to: "#2A5A2A", emoji: "🌍", initials: "LV", banner: "/banners/education.jpg" },
      { id: "g3", name: "Formation Pro Landes", job: "Centre de formation professionnelle", city: "Biscarrosse", phone: "05 58 33 44 55", desc: "Formations certifiantes en informatique, management et RH. Formations éligibles CPF.", from: "#2A1A0A", to: "#4A3A1A", emoji: "💼", initials: "FP", banner: "/banners/education.jpg" },
      { id: "g4", name: "Auto-École Atlantic", job: "Auto-école & Moto-école", city: "Hossegor", phone: "05 58 44 55 66", desc: "Permis B, A et AAC. Formation accélérée disponible. Moniteurs expérimentés et patients.", badge: "premium", from: "#1A2A3A", to: "#2A4A5A", emoji: "🚗", initials: "AA", banner: "/banners/education.jpg" },
      { id: "g5", name: "Crèche Les Poussins", job: "Micro-crèche & Garde enfants", city: "Tartas", phone: "05 58 55 66 77", desc: "Micro-crèche agrééeavec 10 places. Éveil bienveillant, activités Montessori et repas bio.", from: "#3A1A3A", to: "#5A2A5A", emoji: "🧸", initials: "CP", banner: "/banners/education.jpg" },
    ],
  },
  {
    label: "Tourisme",
    icon: "🏡",
    category: "Hébergement & Tourisme",
    pros: [
      { id: "h1", name: "Domaine des Pins", job: "Gîte & Chambres d'hôtes", city: "Sabres", phone: "06 12 34 56 78", desc: "5 chambres d'hôtes au cœur de la forêt landaise. Petit-déjeuner maison, piscine chauffée.", badge: "gold", from: "#1A2A1A", to: "#2D4A2D", emoji: "🌲", initials: "DP", banner: "/banners/hebergement.jpg" },
      { id: "h2", name: "Surf Camp Adrénaline", job: "École de surf & Hébergement", city: "Biscarrosse", phone: "06 23 45 67 89", desc: "Stage surf + hébergement tout compris. Cours débutants à confirmés. Ambiance conviviale garantie.", badge: "premium", from: "#0A2A4A", to: "#1A5A8A", emoji: "🏄", initials: "SC", banner: "/banners/hebergement.jpg" },
      { id: "h3", name: "Villa Océane", job: "Location saisonnière", city: "Mimizan", phone: "06 34 56 78 90", desc: "Villa 8 personnes à 200m de la plage. Jardin clos, garage, climatisation, WiFi fibre inclus.", from: "#1A3A4A", to: "#2A5A6A", emoji: "🏖️", initials: "VO", banner: "/banners/hebergement.jpg" },
      { id: "h4", name: "Camping Les Pins", job: "Camping 4 étoiles", city: "Parentis-en-Born", phone: "05 58 23 34 45", desc: "Camping en forêt avec accès au lac. Mobil-homes et emplacements premium. Animations été.", badge: "gold", from: "#1A3A1A", to: "#2A5A2A", emoji: "⛺", initials: "CP", banner: "/banners/hebergement.jpg" },
      { id: "h5", name: "Randos Landes", job: "Guide nature & Randonnées", city: "Labouheyre", phone: "06 45 56 67 78", desc: "Randonnées guidées en forêt landaise, à vélo ou à pied. Sorties nature et observation des oiseaux.", badge: "premium", from: "#1A2A0A", to: "#2A4A1A", emoji: "🧭", initials: "RL", banner: "/banners/hebergement.jpg" },
    ],
  },
  {
    label: "Restauration",
    icon: "🍽️",
    category: "Hôtellerie & Restauration",
    pros: [
      { id: "i1", name: "La Table des Landes", job: "Restaurant gastronomique", city: "Mont-de-Marsan", phone: "05 58 45 67 89", desc: "Cuisine landaise revisitée autour du foie gras, magret et produits du terroir. Terrasse ombragée.", badge: "gold", from: "#3D1A00", to: "#6B3A00", emoji: "🍴", initials: "TL", banner: "/banners/restauration.jpg" },
      { id: "i2", name: "Le Surf Bar", job: "Bar & Tapas", city: "Hossegor", phone: "05 58 56 78 90", desc: "Ambiance décontractée face à l'océan. Tapas maison, cocktails frais et planches apéritives.", badge: "premium", from: "#0A2A4A", to: "#1A5A8A", emoji: "🌊", initials: "SB", banner: "/banners/restauration.jpg" },
      { id: "i3", name: "Auberge du Pin", job: "Auberge traditionnelle", city: "Sabres", phone: "05 58 78 90 12", desc: "Cuisine du terroir landais dans un cadre authentique au cœur de la forêt. Menu du marché.", badge: "gold", from: "#1A3A1A", to: "#2D5A1F", emoji: "🏚️", initials: "AP", banner: "/banners/restauration.jpg" },
      { id: "i4", name: "Glacier Côte Basque", job: "Glacier artisanal", city: "Capbreton", phone: "05 58 89 01 23", desc: "Glaces et sorbets artisanaux aux fruits frais locaux. Plus de 40 parfums disponibles.", from: "#2A1A4A", to: "#4A2A8A", emoji: "🍦", initials: "GC", banner: "/banners/restauration.jpg" },
      { id: "i5", name: "Hôtel Les Dunes", job: "Hôtel & Restaurant", city: "Mimizan", phone: "05 58 90 12 34", desc: "Hôtel 3 étoiles avec restaurant panoramique vue mer. Séminaires et réceptions jusqu'à 150 personnes.", badge: "premium", from: "#1A2A3A", to: "#2A4A6A", emoji: "🏨", initials: "HD", banner: "/banners/restauration.jpg" },
    ],
  },
  {
    label: "Immobilier",
    icon: "🏠",
    category: "Immobilier",
    pros: [
      { id: "j1", name: "Landes Immobilier", job: "Agence immobilière", city: "Mont-de-Marsan", phone: "05 58 11 22 33", desc: "Vente et location de maisons, appartements et terrains dans tout le département des Landes.", badge: "gold", from: "#1A2A3A", to: "#2A4A6A", emoji: "🏡", initials: "LI", banner: "/banners/immobilier.jpg" },
      { id: "j2", name: "Côte Immo", job: "Immobilier balnéaire", city: "Hossegor", phone: "05 58 22 33 44", desc: "Spécialiste de l'immobilier sur la côte landaise. Villas, appartements et investissements locatifs.", badge: "premium", from: "#0A2A4A", to: "#1A4A7A", emoji: "🌊", initials: "CI", banner: "/banners/immobilier.jpg" },
      { id: "j3", name: "Gestion Landes", job: "Gestion locative", city: "Dax", phone: "05 58 33 44 55", desc: "Gestion locative complète : recherche de locataires, états des lieux, quittances et travaux.", from: "#2A2A1A", to: "#4A4A2A", emoji: "🔑", initials: "GL", banner: "/banners/immobilier.jpg" },
      { id: "j4", name: "Expertise Bâtiment", job: "Expert immobilier", city: "Biscarrosse", phone: "05 58 44 55 66", desc: "Expertise immobilière, diagnostics obligatoires (DPE, amiante, plomb) et bilans énergétiques.", badge: "premium", from: "#3A1A0A", to: "#5A3A1A", emoji: "📋", initials: "EB", banner: "/banners/immobilier.jpg" },
      { id: "j5", name: "Construction Landes", job: "Constructeur de maisons", city: "Tartas", phone: "05 58 55 66 77", desc: "Construction de maisons individuelles sur mesure. Du plan à la remise des clés. Garantie décennale.", from: "#1A3A1A", to: "#2A5A2A", emoji: "🏗️", initials: "CL", banner: "/banners/immobilier.jpg" },
    ],
  },
  {
    label: "Numérique",
    icon: "💻",
    category: "Informatique & Numérique",
    pros: [
      { id: "k1", name: "Web Landes", job: "Agence web & Digital", city: "Mont-de-Marsan", phone: "05 58 11 22 33", desc: "Création de sites web, applications mobiles et solutions e-commerce. Référencement SEO et Google Ads.", badge: "gold", from: "#0A1A3A", to: "#1A3A6A", emoji: "🌐", initials: "WL" },
      { id: "k2", name: "Répar'Info 40", job: "Réparation & Dépannage informatique", city: "Dax", phone: "05 58 22 33 44", desc: "Réparation PC, Mac et smartphones. Suppression virus, récupération de données et mises à niveau.", badge: "premium", from: "#1A2A1A", to: "#2A4A2A", emoji: "🔧", initials: "RI" },
      { id: "k3", name: "Studio Créa Digital", job: "Graphiste & Identité visuelle", city: "Hossegor", phone: "05 58 33 44 55", desc: "Création de logos, chartes graphiques, supports print et digitaux. Direction artistique de projets.", from: "#3A0A3A", to: "#6A1A6A", emoji: "🎨", initials: "SC" },
      { id: "k4", name: "Formation Numérique", job: "Formateur informatique", city: "Biscarrosse", phone: "05 58 44 55 66", desc: "Formations bureautique, réseaux sociaux et sécurité informatique pour particuliers et entreprises.", badge: "premium", from: "#0A2A2A", to: "#1A4A4A", emoji: "📱", initials: "FN" },
      { id: "k5", name: "Cloud Solutions 40", job: "Infogérance & Cloud", city: "Mont-de-Marsan", phone: "05 58 55 66 77", desc: "Solutions cloud, hébergement, sauvegarde et cybersécurité pour TPE et PME des Landes.", from: "#1A1A3A", to: "#2A2A5A", emoji: "☁️", initials: "CS" },
    ],
  },
  {
    label: "Médical",
    icon: "🏥",
    category: "Médical & Paramédical",
    pros: [
      { id: "l1", name: "Cabinet Kiné Landes", job: "Kinésithérapeute", city: "Dax", phone: "05 58 11 22 33", desc: "Kinésithérapie rééducative et sportive. Massages thérapeutiques, drainage lymphatique et balnéo.", badge: "gold", from: "#0A2A3A", to: "#1A4A5A", emoji: "🦴", initials: "CK" },
      { id: "l2", name: "Pharmacie des Pins", job: "Pharmacie & Parapharmacie", city: "Mont-de-Marsan", phone: "05 58 22 33 44", desc: "Pharmacie de proximité avec large gamme de parapharmacie, orthopédie et conseils personnalisés.", badge: "premium", from: "#0A3A1A", to: "#1A5A2A", emoji: "💊", initials: "PP" },
      { id: "l3", name: "Cabinet Infirmier", job: "Infirmières libérales", city: "Biscarrosse", phone: "05 58 33 44 55", desc: "Soins infirmiers à domicile, prises de sang, pansements et injections. Disponibles 7j/7.", from: "#1A2A3A", to: "#2A4A5A", emoji: "🩺", initials: "CI" },
      { id: "l4", name: "Dentiste Soustons", job: "Cabinet dentaire", city: "Soustons", phone: "05 58 44 55 66", desc: "Soins dentaires généraux, implants, prothèses et orthodontie. Urgences le matin sans rendez-vous.", badge: "premium", from: "#2A0A2A", to: "#4A1A4A", emoji: "🦷", initials: "DS" },
      { id: "l5", name: "Optique Côte", job: "Opticien lunetier", city: "Capbreton", phone: "05 58 55 66 77", desc: "Lunettes de vue et solaires, lentilles de contact. Bilan visuel gratuit. Tiers-payant toutes mutuelles.", from: "#1A2A4A", to: "#2A3A6A", emoji: "👓", initials: "OC" },
    ],
  },
  {
    label: "Agriculture",
    icon: "🌾",
    category: "Nature & Agriculture",
    pros: [
      { id: "m1", name: "Ferme des Landes", job: "Producteur canard & Foie gras", city: "Hagetmau", phone: "05 58 11 22 33", desc: "Élevage traditionnel de canards, production de foie gras, magrets et confits. Vente à la ferme.", badge: "gold", from: "#3A2A0A", to: "#6A4A1A", emoji: "🦆", initials: "FL" },
      { id: "m2", name: "Pépinière Landaise", job: "Pépiniériste & Paysagiste", city: "Sabres", phone: "05 58 22 33 44", desc: "Vente de plants, arbres et arbustes adaptés au climat landais. Création et entretien de jardins.", badge: "premium", from: "#1A3A0A", to: "#2A5A1A", emoji: "🌱", initials: "PL" },
      { id: "m3", name: "Apiculture Forêt", job: "Apiculteur & Miels artisanaux", city: "Labouheyre", phone: "05 58 33 44 55", desc: "Miels de forêt landaise, de fleurs et de bruyère. Propolis, cire et produits de la ruche.", from: "#4A3A0A", to: "#7A6A1A", emoji: "🍯", initials: "AF" },
      { id: "m4", name: "Maraîchage Bio", job: "Maraîcher biologique", city: "Aire-sur-l'Adour", phone: "05 58 44 55 66", desc: "Légumes de saison cultivés sans pesticides. AMAP et marchés locaux. Paniers hebdomadaires.", badge: "premium", from: "#0A3A1A", to: "#1A5A2A", emoji: "🥕", initials: "MB" },
      { id: "m5", name: "Sylviculture Landes", job: "Exploitant forestier", city: "Biscarrosse", phone: "05 58 55 66 77", desc: "Exploitation et entretien de forêts de pins maritimes. Élagage, abattage et valorisation du bois.", from: "#1A2A0A", to: "#2A4A1A", emoji: "🌲", initials: "SL" },
    ],
  },
  {
    label: "Services",
    icon: "🤝",
    category: "Services à la personne",
    pros: [
      { id: "n1", name: "Aide à Domicile Landes", job: "Aide aux personnes âgées", city: "Mont-de-Marsan", phone: "05 58 11 22 33", desc: "Aide à domicile pour personnes âgées et dépendantes. Ménage, repas, courses et accompagnements.", badge: "gold", from: "#1A2A3A", to: "#2A4A5A", emoji: "🏠", initials: "AD" },
      { id: "n2", name: "Baby-Sitting Pro", job: "Garde d'enfants à domicile", city: "Dax", phone: "05 58 22 33 44", desc: "Garde d'enfants à votre domicile, jeux éducatifs et aide aux devoirs. Disponible soirs et week-ends.", badge: "premium", from: "#3A1A2A", to: "#5A2A4A", emoji: "👶", initials: "BP" },
      { id: "n3", name: "Jardinage Landes", job: "Jardinier & Espaces verts", city: "Biscarrosse", phone: "05 58 33 44 55", desc: "Entretien de jardins, taille de haies, tonte et élagage. Création de massifs et potagers.", from: "#1A3A0A", to: "#2A5A1A", emoji: "🌿", initials: "JL" },
      { id: "n4", name: "Conciergerie Côte", job: "Services conciergerie", city: "Hossegor", phone: "05 58 44 55 66", desc: "Services de conciergerie pour résidences secondaires : ménage, accueil locataires, petits travaux.", badge: "premium", from: "#2A1A0A", to: "#4A3A1A", emoji: "🗝️", initials: "CC" },
      { id: "n5", name: "Pressing Rapide", job: "Pressing & Blanchisserie", city: "Capbreton", phone: "05 58 55 66 77", desc: "Nettoyage à sec, pressing express et blanchisserie. Service livraison à domicile disponible.", from: "#0A2A3A", to: "#1A3A5A", emoji: "👔", initials: "PR" },
    ],
  },
  {
    label: "Sport",
    icon: "🏄",
    category: "Sport & Fitness",
    pros: [
      { id: "o1", name: "Surf School Bisca", job: "École de surf", city: "Biscarrosse", phone: "05 58 11 22 33", desc: "Cours de surf collectifs et particuliers pour tous niveaux. Location de matériel. Stages vacances.", badge: "gold", from: "#0A2A4A", to: "#1A4A7A", emoji: "🏄", initials: "SS" },
      { id: "o2", name: "Salle de Sport Landes", job: "Coach sportif & Fitness", city: "Mont-de-Marsan", phone: "05 58 22 33 44", desc: "Coaching personnalisé, cours collectifs et salle de musculation. Programmes nutrition inclus.", badge: "premium", from: "#1A1A3A", to: "#2A2A5A", emoji: "💪", initials: "SL" },
      { id: "o3", name: "Vélo Évasion 40", job: "Vélo & Cycle touring", city: "Mimizan", phone: "05 58 33 44 55", desc: "Location de vélos électriques et VTT. Circuits guidés en forêt et sur les pistes cyclables landaises.", from: "#1A2A1A", to: "#2A4A2A", emoji: "🚵", initials: "VE" },
      { id: "o4", name: "Tennis Club Dax", job: "Tennis & Padel", city: "Dax", phone: "05 58 44 55 66", desc: "Club de tennis avec 8 courts dont 2 couverts et 4 terrains de padel. Cours enfants et adultes.", badge: "premium", from: "#2A3A0A", to: "#4A5A1A", emoji: "🎾", initials: "TC" },
      { id: "o5", name: "Équitation Landes", job: "Centre équestre", city: "Sabres", phone: "05 58 55 66 77", desc: "Centre équestre en forêt avec pension de chevaux. Cours d'équitation, balades et randonnées.", from: "#3A2A1A", to: "#5A4A2A", emoji: "🐴", initials: "EL" },
    ],
  },
  {
    label: "Transport",
    icon: "🚚",
    category: "Transport & Logistique",
    pros: [
      { id: "p1", name: "Taxi Landes Express", job: "Taxi & VTC", city: "Mont-de-Marsan", phone: "05 58 11 22 33", desc: "Taxi conventionné et VTC disponibles 24h/24. Transferts aéroports Bordeaux et Pau. Longues distances.", badge: "gold", from: "#1A1A3A", to: "#2A2A5A", emoji: "🚕", initials: "TL" },
      { id: "p2", name: "Déménagement 40", job: "Déménageur professionnel", city: "Dax", phone: "05 58 22 33 44", desc: "Déménagements locaux et nationaux. Emballage, montage et démontage de meubles. Garde-meuble.", badge: "premium", from: "#2A1A0A", to: "#4A3A1A", emoji: "📦", initials: "D4" },
      { id: "p3", name: "Ambulances Côte", job: "Transport sanitaire", city: "Capbreton", phone: "05 58 33 44 55", desc: "Transports sanitaires non urgents, VSL et ambulances. Conventionnés Sécurité Sociale.", from: "#0A2A2A", to: "#1A4A4A", emoji: "🚑", initials: "AC" },
      { id: "p4", name: "Livraison Express 40", job: "Coursier & Livraison", city: "Mont-de-Marsan", phone: "05 58 44 55 66", desc: "Livraison express et coursier dans tout le département. Colis, documents et marchandises fragiles.", badge: "premium", from: "#3A2A0A", to: "#5A4A1A", emoji: "📫", initials: "LE" },
      { id: "p5", name: "Auto-Partage Landes", job: "Location de véhicules", city: "Biscarrosse", phone: "05 58 55 66 77", desc: "Location de voitures, utilitaires et camping-cars. Tarifs à la journée ou à la semaine. Livraison possible.", from: "#1A2A3A", to: "#2A3A5A", emoji: "🚐", initials: "AL" },
    ],
  },
];

// ── Card individuelle — même apparence que ProfessionalCard ──────
function ProCard({ pro }: { pro: FeaturedPro }) {
  const [rating, setRating] = useState<{ avg: number; count: number } | null>(null);
  useEffect(() => {
    const r = getProRating(pro.id);
    if (r.count > 0) setRating(r);
  }, [pro.id]);

  const bannerSrc = pro.banner || null;

  return (
    <Link href={`/annuaire/${pro.id}`} className="block h-full group">
      <div className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-full flex flex-col">

        {/* Bannière + logo à cheval */}
        <div className="w-full h-32 relative flex-shrink-0">
          {bannerSrc
            ? <img src={bannerSrc} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${pro.from} 0%, ${pro.to} 100%)` }} />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Logo à cheval */}
          <div className="absolute -bottom-7 left-5">
            {pro.logo
              ? <img src={pro.logo} alt={pro.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
              : <div className="w-14 h-14 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: `linear-gradient(135deg, ${pro.from} 0%, ${pro.to} 100%)` }}>
                  {pro.initials}
                </div>
            }
          </div>
        </div>

        {/* Contenu */}
        <div className="px-5 pt-10 pb-5 flex flex-col flex-1">
          <h3 className="font-bold text-landes-pine text-base truncate group-hover:text-landes-forest transition-colors">
            {pro.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <p className="text-sm text-landes-sage font-medium">{pro.job}</p>
            {rating && rating.avg > 0 && <StarDisplay rating={rating.avg} count={rating.count} size="xs" />}
          </div>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{pro.desc}</p>

          <div className="mt-3 pt-3 border-t border-gray-100 mt-auto">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 bg-landes-forest/10 rounded flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3 h-3 text-landes-forest" />
                </div>
                <span className="text-xs font-semibold text-landes-pine truncate">{pro.city}</span>
              </div>
              {pro.phone
                ? <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 bg-landes-sage/10 rounded flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3 h-3 text-landes-sage" />
                    </div>
                    <span className="text-xs font-semibold text-landes-pine truncate">{pro.phone}</span>
                  </div>
                : <div />
              }
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end">
            <span className="text-xs text-landes-forest font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Voir la fiche <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Carrousel 3 cards visibles, défilement continu ────────────
function ProCarousel({ pros, tabKey }: { pros: FeaturedPro[]; tabKey: number }) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);          // card width in px
  const [pos, setPos]   = useState(0);      // current index (real)
  const [tx, setTx]     = useState(0);      // translateX in px
  const [moving, setMoving] = useState(false);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const GAP     = 20;
  const VISIBLE = 3;
  const N       = pros.length;
  // Clone: [last3 | pros | first3] for infinite loop
  const clones  = [...pros.slice(-VISIBLE), ...pros, ...pros.slice(0, VISIBLE)];
  const START   = VISIBLE; // real items begin here

  // Measure container → derive card width
  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setCw((w - GAP * (VISIBLE - 1)) / VISIBLE);
    });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // Jump to initial position when cw is known or tab changes
  useEffect(() => {
    if (cw === 0) return;
    setPos(0);
    setTx((START) * (cw + GAP));
    setMoving(false);
  }, [tabKey, cw, START]);

  const step = useCallback((dir: 1 | -1) => {
    if (moving || cw === 0) return;
    const next = pos + dir;
    const nextTx = (START + next) * (cw + GAP);
    setMoving(true);
    setTx(nextTx);
    setTimeout(() => {
      // Wrap silently
      const wrapped = ((next % N) + N) % N;
      setPos(wrapped);
      setTx((START + wrapped) * (cw + GAP));
      setMoving(false);
    }, 400);
  }, [moving, cw, pos, START, N]);

  const next = useCallback(() => step(1),  [step]);
  const prev = useCallback(() => step(-1), [step]);

  useEffect(() => {
    if (paused || cw === 0) return;
    timer.current = setInterval(next, 3500);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paused, next, cw]);

  const unit = cw + GAP;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Viewport */}
      <div ref={wrapRef} className="overflow-hidden" style={{ minHeight: 380 }}>
        {/* Track */}
        <div
          className="flex"
          style={{
            gap: GAP,
            transform: cw > 0 ? `translateX(-${tx}px)` : "none",
            transition: moving ? "transform 0.4s cubic-bezier(0.4,0,0.2,1)" : "none",
            willChange: "transform",
          }}
        >
          {cw > 0 && clones.map((pro, i) => (
            <div key={`${tabKey}-${i}`} style={{ width: cw, flexShrink: 0 }}>
              <ProCard pro={pro} />
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button onClick={prev}
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 hover:bg-landes-forest hover:text-white hover:border-landes-forest text-gray-600 rounded-full flex items-center justify-center shadow-md transition-all">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next}
        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 hover:bg-landes-forest hover:text-white hover:border-landes-forest text-gray-600 rounded-full flex items-center justify-center shadow-md transition-all">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {pros.map((_, i) => (
          <button key={i}
            onClick={() => { if (!moving && i !== pos) step(i > pos ? 1 : -1); }}
            className={`h-2 rounded-full transition-all duration-300 ${i === pos ? "w-8 bg-landes-forest" : "w-2 bg-gray-300 hover:bg-landes-sage"}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="h-1 bg-gray-100 rounded-full mt-3 overflow-hidden">
          <div key={`${tabKey}-${pos}`} className="h-full bg-landes-forest origin-left rounded-full"
            style={{ animation: "featProg 3.5s linear forwards" }} />
        </div>
      )}
      <style jsx>{`@keyframes featProg{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </div>
  );
}

// Convertit un pro réel en FeaturedPro
function proToFeatured(p: Professional): FeaturedPro {
  const initials = p.companyName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return {
    id:      p.id,
    name:    p.companyName,
    job:     p.activityTitle || p.category,
    city:    p.city,
    phone:   p.phone,
    desc:    p.description.replace(/<[^>]*>/g, " ").trim().slice(0, 160),
    badge:   "gold",
    from:    "#1a3a2a",
    to:      "#2d5a3d",
    emoji:   "⭐",
    initials,
    logo:    p.logo || undefined,
    banner:  getBanner(p.banner, p.category) || undefined,
  };
}

// ── Section principale ─────────────────────────────────────────
export default function FeaturedProfessionals() {
  const [activeTab, setActiveTab] = useState(0);
  const [mergedTabs, setMergedTabs] = useState<FeaturedTab[]>(FEATURED_TABS);

  // Charge les pros Gold réels et les préfixe aux démos
  useEffect(() => {
    (async () => {
      const realPros = (await getProfessionalsWithImages()).filter(p => p.status === "active" && p.plan === "gold");

    const updated = FEATURED_TABS.map(tab => {
      const realForTab = realPros
        .filter(p => p.category === tab.category)
        .map(proToFeatured);

      // Déduplique : retire les démos qui auraient le même id qu'un vrai pro
      const demoIds = new Set(realForTab.map(r => r.id));
      const filteredDemo = tab.pros.filter(d => !demoIds.has(d.id));

      return {
        ...tab,
        pros: [...realForTab, ...filteredDemo],
      };
    });

      setMergedTabs(updated);
    })();
  }, [activeTab]); // recharge à chaque changement d'onglet

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-landes-sage uppercase tracking-wider mb-1">Sélection</p>
            <h2 className="text-3xl font-bold text-landes-pine">Professionnels à la une</h2>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 flex-wrap mb-10">
          {mergedTabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                activeTab === i
                  ? "bg-landes-forest text-white border-landes-forest shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-landes-sage hover:text-landes-forest"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Carrousel */}
        <div className="px-6">
          <ProCarousel key={activeTab} pros={mergedTabs[activeTab].pros} tabKey={activeTab} />
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href={`/annuaire?category=${encodeURIComponent(mergedTabs[activeTab].category)}`}
            className="inline-flex items-center gap-2 btn-secondary py-3 px-8"
          >
            Voir tous en {mergedTabs[activeTab].label} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
