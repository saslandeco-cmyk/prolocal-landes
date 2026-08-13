import { CategoryMeta } from "@/components/category/CategoryPage";

const d = (id: string, name: string, cat: string, city: string, pc: string, addr: string, lat: number, lng: number, plan: "gold"|"premium"|"standard", form: string, desc: string, fn: string, ln: string, phone: string, banner = "") => ({
  id, companyName: name, category: cat, city, postalCode: pc, address: addr, lat, lng,
  plan, status: "active" as const, siren: id.padStart(9,"1"), legalForm: form,
  description: `<p>${desc}</p>`, firstName: fn, lastName: ln,
  email: `${id}@demo.fr`, phone, logo: "", banner, photos: [],
});

export const CATEGORY_META: Record<string, CategoryMeta> = {

  // ── Alimentation ─────────────────────────────────────────────
  alimentation: {
    slug: "alimentation",
    category: "Alimentation & Épicerie",
    emoji: "🥖",
    title: "Alimentation &amp; Épicerie<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Boulangers, fromagers, épiciers et artisans de bouche du département des Landes (40).",
    seoTitle: "Artisans de bouche et épiceries dans les Landes",
    seoText: [
      "Les Landes sont une terre de gastronomie et de terroir. Qu'il s'agisse de boulangeries artisanales, de fromageries affinées ou d'épiceries fines, le département offre une richesse exceptionnelle en matière d'alimentation de qualité.",
      "Notre annuaire recense les meilleurs <strong class=\"text-landes-pine\">artisans de bouche et commerces alimentaires des Landes</strong> : boulangers-pâtissiers, charcutiers-traiteurs, fromagers, épiciers bio et producteurs locaux qui valorisent les produits du terroir landais.",
      "Le foie gras des Landes, la charcuterie de canard, les vins de Tursan et les produits maraîchers cultivés sous le soleil gascon figurent parmi les spécialités que vous pourrez découvrir auprès de ces professionnels engagés dans une démarche de qualité et de proximité.",
      "Que vous soyez à <strong class=\"text-landes-pine\">Mont-de-Marsan</strong>, <strong class=\"text-landes-pine\">Dax</strong>, <strong class=\"text-landes-pine\">Hagetmau</strong> ou dans toute autre commune des Landes, retrouvez facilement les commerces alimentaires artisanaux qui font la richesse gustative du département.",
      "Favoriser les commerces locaux, c'est soutenir l'économie de proximité, réduire l'empreinte carbone de son alimentation et savourer des produits frais préparés avec soin. Trouvez votre artisan de bouche de confiance dans les Landes grâce à notre annuaire.",
    ],
    ctaText: "Boulanger, charcutier, fromager, épicier ou producteur local — référencez votre commerce et soyez trouvé par des milliers de clients landais.",
    demoPros: [
      d("al1","Boulangerie des Pins","Alimentation & Épicerie","Mont-de-Marsan","40000","12 rue de la Paix",43.8940,-0.5020,"gold","SARL","Pain au levain naturel, viennoiseries maison et pâtisseries artisanales cuites au four à bois depuis 1987. Ouvert du mardi au dimanche matin.","Jean","Martin","05 58 11 22 33","/banners/alimentation.jpg"),
      d("al2","Fromagerie Landaise","Alimentation & Épicerie","Dax","40100","5 Marché Couvert",43.7101,-1.0527,"premium","EI","Sélection de fromages fermiers et affinés. Cave à fromages avec plus de 80 références dont les spécialités régionales du Sud-Ouest. Dégustation sur place.","Claire","Fromage","05 58 22 33 44","/banners/alimentation.jpg"),
      d("al3","Charcuterie Dupont","Alimentation & Épicerie","Hagetmau","40700","8 Place du Marché",43.6429,-0.5910,"gold","SARL","Charcuterie artisanale : jambon de Bayonne, saucissons, pâtés et rillettes. Traiteur pour mariages, anniversaires et événements d'entreprise jusqu'à 300 personnes.","Louis","Dupont","05 58 33 44 55","/banners/alimentation.jpg"),
      d("al4","Épicerie Bio des Landes","Alimentation & Épicerie","Biscarrosse","40600","3 Avenue de la Forêt",44.3952,-1.1637,"premium","SARL","Épicerie bio avec produits locaux en circuits courts. Fruits et légumes de saison, vrac, conserves artisanales et vins nature des Landes. Panier bio hebdomadaire.","Sophie","Bio","05 58 44 55 66","/banners/alimentation.jpg"),
      d("al5","Cave à Vins Landaise","Alimentation & Épicerie","Capbreton","40130","15 Rue du Port",43.6630,-1.4431,"standard","EI","Sélection de vins du Sud-Ouest, vins nature et spiritueux artisanaux. Conseils personnalisés, coffrets cadeaux et organisation de dégustations privées ou professionnelles.","Marc","Vins","05 58 55 66 77","/banners/alimentation.jpg"),
    ],
  },

  // ── Artisanat ────────────────────────────────────────────────
  artisanat: {
    slug: "artisanat",
    category: "Artisanat & Métiers d'art",
    emoji: "🎨",
    title: "Artisanat &amp; Métiers d&apos;art<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Céramistes, forgerons, ébénistes et créateurs des Landes (40).",
    seoTitle: "Artisans d'art et métiers traditionnels dans les Landes",
    seoText: [
      "Les Landes abritent une communauté d'artisans d'art passionnés qui perpétuent les savoir-faire traditionnels tout en les renouvelant avec créativité. Potiers, forgerons, menuisiers, souffleurs de verre et maroquiniers contribuent à la richesse culturelle et économique du territoire.",
      "Notre annuaire recense les meilleurs <strong class=\"text-landes-pine\">artisans d'art dans les Landes</strong> : céramistes, ébénistes, ferronniers, tisserands et créateurs de bijoux qui travaillent la matière avec passion et savoir-faire.",
      "Le bois de pin des Landes, l'argile locale et les matières naturelles du territoire inspirent des créations uniques que vous trouverez dans les ateliers ouverts au public ou lors des marchés artisanaux qui animent les communes du département tout au long de l'année.",
      "Que vous recherchiez une pièce unique pour votre intérieur, un cadeau original ou une création sur mesure, les <strong class=\"text-landes-pine\">artisans des Landes</strong> vous accueillent dans leurs ateliers à <strong class=\"text-landes-pine\">Dax</strong>, <strong class=\"text-landes-pine\">Mont-de-Marsan</strong>, <strong class=\"text-landes-pine\">Hossegor</strong> et dans tout le département.",
      "Soutenir l'artisanat local, c'est encourager une économie créative, durable et ancrée dans les traditions landaises. Découvrez ces talents cachés dans notre annuaire et trouvez l'artisan qui donnera vie à vos projets.",
    ],
    ctaText: "Potier, ébéniste, forgeron, maroquinier ou créateur d'art — référencez votre atelier et soyez découvert par une clientèle locale et touristique.",
    demoPros: [
      d("ar1","Poterie Landaise","Artisanat & Métiers d'art","Dax","40100","2 Impasse des Arts",43.7101,-1.0527,"gold","EI","Création de pièces uniques en terre cuite landaise. Ateliers ouverts au public toute l'année sur rendez-vous. Stage poterie pour adultes et enfants. Pièces décoratives et fonctionnelles.","Anne","Potter","05 58 11 22 33","/banners/artisanat.jpg"),
      d("ar2","Forge des Pins","Artisanat & Métiers d'art","Mont-de-Marsan","40000","5 Zone Artisanale",43.8914,-0.5006,"premium","EI","Ferronnerie d'art sur mesure : portails, rampes, mobilier de jardin et décoration intérieure. Restauration de pièces anciennes. Visite de la forge possible sur demande.","Pierre","Forgeron","05 58 22 33 44","/banners/artisanat.jpg"),
      d("ar3","Menuiserie Larroque","Artisanat & Métiers d'art","Tartas","40400","Route des Artisans",43.8335,-0.7502,"gold","SARL","Fabrication de meubles sur mesure en bois massif de pin et chêne. Restauration de pièces anciennes. Cuisine, bibliothèque, dressing. Devis gratuit à domicile.","Paul","Bois","05 58 33 44 55","/banners/artisanat.jpg"),
      d("ar4","Maroquinerie Côte","Artisanat & Métiers d'art","Hossegor","40150","10 Rue du Bourg",43.6640,-1.4292,"premium","EI","Création de sacs, ceintures et accessoires en cuir tannés végétalement. Réparations et personnalisations. Atelier visible depuis la boutique. Expédition possible.","Marie","Cuir","05 58 44 55 66","/banners/artisanat.jpg"),
      d("ar5","Verrerie des Landes","Artisanat & Métiers d'art","Mimizan","40200","6 Chemin du Lac",44.2033,-1.2297,"standard","EI","Art du verre soufflé à la bouche. Pièces décoratives et fonctionnelles en verre coloré. Démonstrations publiques le week-end. Vente directe à l'atelier.","Éric","Verre","05 58 55 66 77","/banners/artisanat.jpg"),
    ],
  },

  // ── Bâtiment ─────────────────────────────────────────────────
  batiment: {
    slug: "batiment",
    category: "Bâtiment & Travaux",
    emoji: "🔨",
    title: "Bâtiment &amp; Travaux<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Maçons, charpentiers, plombiers, électriciens et artisans du BTP dans les Landes (40).",
    seoTitle: "Artisans du bâtiment et entreprises de travaux dans les Landes",
    seoText: [
      "Vous avez un projet de construction, de rénovation ou d'extension dans les Landes ? Notre annuaire vous met en relation avec les meilleurs artisans du bâtiment du département : maçons, charpentiers, couvreurs, plombiers, électriciens, peintres et carreleurs.",
      "Trouver un artisan qualifié et de confiance dans les Landes peut s'avérer difficile. Notre plateforme référence des <strong class=\"text-landes-pine\">professionnels du BTP certifiés</strong>, assurant des garanties décennales et RGE (Reconnu Garant de l'Environnement) pour les travaux d'isolation et d'énergie renouvelable.",
      "Le département des Landes est en pleine expansion immobilière, notamment sur la côte Atlantique et autour de <strong class=\"text-landes-pine\">Mont-de-Marsan</strong> et <strong class=\"text-landes-pine\">Dax</strong>. Les artisans landais interviennent sur tous types de chantiers : maisons individuelles, résidences secondaires, rénovations de fermes et de bâtisses anciennes.",
      "Que vous cherchiez un plombier chauffagiste pour installer une pompe à chaleur, un électricien pour mettre votre installation aux normes, ou un charpentier pour construire votre terrasse, trouvez le bon professionnel du bâtiment dans les Landes grâce à notre annuaire.",
      "Demandez plusieurs devis et comparez les offres. Les artisans référencés sur notre plateforme sont des professionnels sérieux, réactifs et habitués aux spécificités techniques des constructions landaises.",
    ],
    ctaText: "Maçon, couvreur, plombier, électricien ou peintre — référencez votre entreprise et recevez des demandes de devis de particuliers et professionnels des Landes.",
    demoPros: [
      d("bt1","Charpente Landaise","Bâtiment & Travaux","Tartas","40400","Zone Artisanale",43.8335,-0.7502,"gold","SARL","Charpente traditionnelle, ossature bois et couverture. Tuile, ardoise et bac acier. Garantie décennale. Devis gratuit sous 48h. Intervention sur tout le département 40.","Jacques","Bois","05 58 11 22 33","/banners/batiment.jpg"),
      d("bt2","Électricité Côte","Bâtiment & Travaux","Capbreton","40130","8 Rue de l'Artisan",43.6630,-1.4431,"premium","SAS","Installation électrique neuf et rénovation. Mise aux normes NF C 15-100. Domotique, alarme et bornes de recharge EV. Certifié QUALIFELEC. Urgences 7j/7.","René","Élec","05 58 22 33 44","/banners/batiment.jpg"),
      d("bt3","Maçonnerie Dupuy","Bâtiment & Travaux","Aire-sur-l'Adour","40800","Route de Pau",43.9265,-0.3303,"gold","SARL","Construction, rénovation et extension. Maçonnerie traditionnelle et béton banché. Pose de carrelage, dallage et parquet. 20 ans d'expérience dans les Landes.","Bernard","Mur","05 58 33 44 55","/banners/batiment.jpg"),
      d("bt4","Plomberie Garros","Bâtiment & Travaux","Hagetmau","40700","Chemin des Artisans",43.6429,-0.5910,"premium","EI","Plomberie, chauffage et climatisation. Installation de pompes à chaleur air/eau, chauffe-eaux solaires et climatiseurs. Certifié RGE QualiPAC. Dépannage express.","Henri","Plomb","05 58 44 55 66","/banners/batiment.jpg"),
      d("bt5","Plâtrerie Soleil","Bâtiment & Travaux","Morcenx","40110","Allée des Metiers",44.0906,-0.6003,"standard","EI","Plâtrerie, isolation intérieure et peinture. Enduits décoratifs, ravalement de façade et isolation par l'extérieur. ITE éligible MaPrimeRénov. Devis gratuit.","Alain","Mur","05 58 55 66 77","/banners/batiment.jpg"),
    ],
  },

  // ── Beauté ───────────────────────────────────────────────────
  beaute: {
    slug: "beaute",
    category: "Beauté & Bien-être",
    emoji: "💆",
    title: "Beauté &amp; Bien-être<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Instituts de beauté, spas, coiffeurs, ostéopathes et thérapeutes des Landes (40).",
    seoTitle: "Professionnels du bien-être et de la beauté dans les Landes",
    seoText: [
      "Les Landes, terre de thermalisme et de ressourcement, accueillent de nombreux professionnels du bien-être et de la beauté. De la célèbre station thermale de Dax aux instituts de beauté côtiers en passant par les studios de yoga, le département offre une palette complète de soins et de traitements.",
      "Notre annuaire répertorie les meilleurs <strong class=\"text-landes-pine\">professionnels de la beauté et du bien-être dans les Landes</strong> : instituts d'esthétique, spas, coiffeurs, ostéopathes, kinésithérapeutes, naturopathes, praticiens en massage et coachs bien-être.",
      "La ville de <strong class=\"text-landes-pine\">Dax</strong>, première station thermale de France, est réputée dans toute l'Europe pour ses soins à base de péloïde (boue thermale). De nombreux spas et instituts y proposent des soins inspirés de cette tradition balnéothérapique unique.",
      "Que vous cherchiez un coiffeur pour une coupe tendance à <strong class=\"text-landes-pine\">Hossegor</strong>, un massage relaxant à <strong class=\"text-landes-pine\">Capbreton</strong> ou un soin visage dans un institut premium de <strong class=\"text-landes-pine\">Mont-de-Marsan</strong>, notre annuaire vous permet de trouver le prestataire adapté à vos besoins et à votre budget.",
      "Prenez soin de vous en choisissant des professionnels de proximité, formés et expérimentés, qui vous accompagnent dans votre démarche de bien-être au quotidien.",
    ],
    ctaText: "Esthéticienne, coiffeur, spa, masseur ou thérapeute — référencez votre activité et rejoignez les professionnels du bien-être les plus trouvés dans les Landes.",
    demoPros: [
      d("be1","Spa des Thermes","Beauté & Bien-être","Dax","40100","3 Rue des Thermes",43.7101,-1.0527,"gold","SARL","Institut de beauté et spa inspiré de la tradition thermale dacquoise. Soins visage et corps, massages, balnéothérapie et enveloppements péloïde. Forfaits cadeau disponibles.","Nathalie","Spa","05 58 11 22 33","/banners/beaute.jpg"),
      d("be2","Coiffure Naturelle","Beauté & Bien-être","Mont-de-Marsan","40000","15 Rue de la République",43.8914,-0.5006,"premium","EI","Salon de coiffure bio et éco-responsable. Colorations végétales, coupes femme-homme-enfant, soins naturels. Produits certifiés biologiques. Ambiance zen et accueil personnalisé.","Carole","Coiff","05 58 22 33 44","/banners/beaute.jpg"),
      d("be3","Institut Soleil","Beauté & Bien-être","Biscarrosse","40600","8 Avenue de la Plage",44.3952,-1.1637,"gold","EI","Institut d'esthétique complet : soins du visage, épilations, poses d'ongles semi-permanent et gel, maquillage et microblading. Ambiance chaleureuse, résultats impeccables.","Julie","Beauté","05 58 33 44 55","/banners/beaute.jpg"),
      d("be4","Yoga Océan Hossegor","Beauté & Bien-être","Hossegor","40150","2 Chemin de la Forêt",43.6640,-1.4292,"premium","EI","Studio de yoga tous styles (vinyasa, yin, kundalini). Retraites bien-être le week-end en bord de forêt. Méditation guidée, yoga nidra. Cours en ligne disponibles. Certifiée RYT-500.","Isabelle","Yoga","05 58 44 55 66","/banners/beaute.jpg"),
      d("be5","Ostéopathie Soustons","Beauté & Bien-être","Soustons","40140","10 Allée de la Santé",43.7540,-1.2749,"standard","EI","Ostéopathe D.O. agréé pour adultes, enfants et nourrissons. Prise en charge des douleurs chroniques, post-accidentelles et sportives. Sur rendez-vous uniquement. Parking gratuit.","David","Ostéo","05 58 55 66 77","/banners/beaute.jpg"),
    ],
  },

  // ── Commerce ─────────────────────────────────────────────────
  commerce: {
    slug: "commerce",
    category: "Commerce & Vente",
    emoji: "🛍️",
    title: "Commerce &amp; Vente<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Boutiques, commerces de proximité et spécialistes de la vente dans les Landes (40).",
    seoTitle: "Commerces locaux et boutiques de proximité dans les Landes",
    seoText: [
      "Le commerce de proximité est le cœur battant des villes et villages des Landes. Boutiques de mode, librairies, magasins de sport, épiceries fines, fleuristes et galeries — ces commerces contribuent à la vie locale et à l'attractivité touristique du département.",
      "Notre annuaire référence les <strong class=\"text-landes-pine\">meilleurs commerces des Landes</strong> : boutiques de mode, surf shops, caves à vins, décorations intérieures, librairies indépendantes et commerces spécialisés qui animent les centres-villes et les stations balnéaires.",
      "La côte landaise est particulièrement réputée pour ses commerces spécialisés dans les sports de glisse à <strong class=\"text-landes-pine\">Hossegor</strong> et <strong class=\"text-landes-pine\">Capbreton</strong>, tandis que <strong class=\"text-landes-pine\">Mont-de-Marsan</strong> et <strong class=\"text-landes-pine\">Dax</strong> offrent un centre commercial dynamique avec de nombreuses enseignes locales.",
      "Acheter local, c'est soutenir l'économie landaise, favoriser les circuits courts et bénéficier de conseils personnalisés de la part de commerçants passionnés et experts dans leur domaine. Chaque achat dans un commerce local contribue à maintenir la vitalité des territoires.",
      "Découvrez les commerces incontournables des Landes grâce à notre annuaire et privilégiez les enseignes locales pour tous vos achats quotidiens et vos cadeaux.",
    ],
    ctaText: "Boutique, surf shop, librairie ou commerce spécialisé — référencez votre enseigne et attirez de nouveaux clients locaux et touristiques.",
    demoPros: [
      d("co1","Surf Shop Hossegor","Commerce & Vente","Hossegor","40150","1 Avenue du Surf",43.6640,-1.4292,"gold","SARL","Vente et location de planches de surf, bodyboards, combinaisons et accessoires. Réparation de boards. Conseils d'experts pour choisir le matériel adapté à votre niveau.","Tom","Surf","05 58 11 22 33","/banners/commerce.jpg"),
      d("co2","Librairie des Pins","Commerce & Vente","Dax","40100","5 Rue Gambetta",43.7101,-1.0527,"premium","EI","Librairie indépendante généraliste avec rayon régionalisme landais et gascon. Commandes spéciales, dédicaces d'auteurs, ateliers lecture pour enfants et clubs de lecture adultes.","Patricia","Livres","05 58 22 33 44","/banners/commerce.jpg"),
      d("co3","Mode & Nature","Commerce & Vente","Mont-de-Marsan","40000","12 Rue Lacataye",43.8914,-0.5006,"gold","SAS","Boutique de mode éco-responsable et made in France. Collections femme, homme et enfant. Marques engagées, matières naturelles et durables. Programme de reprise et seconde vie.","Audrey","Mode","05 58 33 44 55","/banners/commerce.jpg"),
      d("co4","Déco Landaise","Commerce & Vente","Capbreton","40130","7 Rue de la Mer",43.6630,-1.4431,"premium","EI","Articles de décoration intérieure, mobilier design et cadeaux originaux. Créations d'artisans locaux et produits du terroir sélectionnés. Idées cadeaux toute l'année.","Valérie","Déco","05 58 44 55 66","/banners/commerce.jpg"),
      d("co5","Sport & Outdoor Landes","Commerce & Vente","Biscarrosse","40600","3 Avenue des Sports",44.3952,-1.1637,"standard","SARL","Articles de sport, randonnée, camping et sports outdoor. Raquettes, vélos, kayaks et matériel de camping. Conseils personnalisés par des passionnés de nature et d'aventure.","Benoît","Sport","05 58 55 66 77","/banners/commerce.jpg"),
    ],
  },

  // ── Culture ──────────────────────────────────────────────────
  culture: {
    slug: "culture",
    category: "Culture & Loisirs",
    emoji: "🎭",
    title: "Culture &amp; Loisirs<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Cinémas, galeries, écoles de musique, escape games et activités culturelles dans les Landes (40).",
    seoTitle: "Activités culturelles et de loisirs dans les Landes",
    seoText: [
      "Les Landes proposent une vie culturelle et de loisirs riche et variée, tout au long de l'année. Cinémas art et essai, galeries d'art contemporain, écoles de musique, salles de spectacle, escape games et ateliers créatifs animent les villes et villages du département.",
      "Notre annuaire répertorie les <strong class=\"text-landes-pine\">meilleures activités culturelles et de loisirs dans les Landes</strong> : institutions culturelles, associations sportives, prestataires de loisirs, structures d'éveil artistique et organisateurs d'événements.",
      "<strong class=\"text-landes-pine\">Mont-de-Marsan</strong> accueille notamment des festivals de renommée nationale comme les Fêtes de la Madeleine et le festival de flamenco. <strong class=\"text-landes-pine\">Dax</strong> est connue pour ses corridas et ses festivités taurines. <strong class=\"text-landes-pine\">Hossegor</strong> attire les amateurs de surf avec les compétitions mondiales de la WSL.",
      "Que vous cherchiez un cours de théâtre pour vos enfants, une sortie originale en famille, une soirée escape game entre amis ou un atelier peinture pour vous initier à la création artistique, notre annuaire vous guide vers les meilleures offres culturelles des Landes.",
      "Les Landes sont également une terre de festival et de tradition. Découvrez les associations et structures culturelles qui font vivre la culture landaise au quotidien et contribuent à l'identité unique de ce territoire gascon.",
    ],
    ctaText: "Cinéma, galerie, école de musique, escape game ou organisateur d'événements — référencez votre structure et touchez un public plus large dans les Landes.",
    demoPros: [
      d("cu1","Cinéma des Landes","Culture & Loisirs","Mont-de-Marsan","40000","3 Place du Théâtre",43.8914,-0.5006,"gold","Association","Cinéma art et essai avec 3 salles. Programmation diversifiée, avant-premières et ciné-débats. Tarifs réduits pour les moins de 26 ans, scolaires et familles. Adhésion annuelle avantageuse.","François","Ciné","05 58 11 22 33","/banners/culture.jpg"),
      d("cu2","École de Musique Dax","Culture & Loisirs","Dax","40100","8 Rue des Arts",43.7101,-1.0527,"premium","Association","Cours de guitare, piano, batterie, saxophone et chant pour enfants et adultes. Éveil musical dès 3 ans. Stages intensifs pendant les vacances. Groupes de scène et concerts de fin d'année.","Sylvie","Musique","05 58 22 33 44","/banners/culture.jpg"),
      d("cu3","Galerie Art Côte","Culture & Loisirs","Hossegor","40150","5 Rue des Artistes",43.6640,-1.4292,"gold","SAS","Galerie d'art contemporain représentant des artistes landais et régionaux. Expositions temporaires, ventes aux enchères saisonnières et commandes d'œuvres sur mesure. Vernissages mensuels.","Hélène","Art","05 58 33 44 55","/banners/culture.jpg"),
      d("cu4","Escape Game Landes","Culture & Loisirs","Biscarrosse","40600","10 Rue du Jeu",44.3952,-1.1637,"premium","SAS","4 salles d'escape game thématiques pour groupes de 2 à 8 personnes. Formules team building, anniversaires et séminaires. Réservation en ligne. Durée 60 minutes. Conseillé dès 12 ans.","Nicolas","Jeux","05 58 44 55 66","/banners/culture.jpg"),
      d("cu5","Studio Danse Capbreton","Culture & Loisirs","Capbreton","40130","2 Avenue de la Gare",43.6630,-1.4431,"standard","Association","Cours de danse classique, contemporaine, hip-hop et salsa pour tous niveaux. Stages vacances. Spectacles de fin d'année. Cours adultes le soir. Essai gratuit le premier cours.","Laura","Danse","05 58 55 66 77","/banners/culture.jpg"),
    ],
  },

  // ── Éducation ────────────────────────────────────────────────
  education: {
    slug: "education",
    category: "Éducation & Formation",
    emoji: "📚",
    title: "Éducation &amp; Formation<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Cours particuliers, auto-écoles, centres de formation et crèches dans les Landes (40).",
    seoTitle: "Formations et services éducatifs dans les Landes",
    seoText: [
      "Le secteur de l'éducation et de la formation dans les Landes est riche et diversifié. Des cours particuliers aux formations professionnelles certifiantes, en passant par les auto-écoles et les établissements de garde d'enfants, de nombreux professionnels accompagnent élèves, étudiants et adultes en reconversion.",
      "Notre annuaire référence les <strong class=\"text-landes-pine\">meilleurs établissements éducatifs et centres de formation des Landes</strong> : professeurs particuliers, auto-écoles, centres de langues, organismes de formation professionnelle, crèches et structures d'accueil petite enfance.",
      "Le soutien scolaire est une priorité pour de nombreuses familles landaises. Des professeurs qualifiés interviennent à domicile ou en centre pour accompagner les élèves du primaire au lycée, préparer les examens (brevet, baccalauréat, BTS) et les concours des grandes écoles.",
      "Les formations professionnelles éligibles au CPF (Compte Personnel de Formation) permettent aux adultes en activité ou en reconversion de développer de nouvelles compétences dans des secteurs porteurs. De nombreux organismes agréés opèrent depuis <strong class=\"text-landes-pine\">Mont-de-Marsan</strong> et <strong class=\"text-landes-pine\">Dax</strong>.",
      "Que vous recherchiez un cours d'anglais pour votre enfant, une formation en informatique pour évoluer dans votre carrière, ou une auto-école réputée pour passer votre permis, notre annuaire vous guide vers les professionnels de l'éducation et de la formation dans les Landes.",
    ],
    ctaText: "Enseignant, formateur, auto-école ou crèche — référencez votre établissement et développez votre visibilité auprès des familles et professionnels des Landes.",
    demoPros: [
      d("ed1","Cours Particuliers Landes","Éducation & Formation","Mont-de-Marsan","40000","20 Rue du Savoir",43.8914,-0.5006,"gold","SAS","Centre de soutien scolaire du CP à la terminale. Cours en groupe et individuels. Préparation brevet et bac. Méthodologie et confiance en soi. Résultats garantis ou remboursés.","Catherine","Cours","05 58 11 22 33","/banners/education.jpg"),
      d("ed2","Langues Vivantes 40","Éducation & Formation","Dax","40100","6 Rue du Lycée",43.7101,-1.0527,"premium","SARL","École de langues : anglais, espagnol, allemand, italien et FLE. Cours adultes et enfants. Préparation TOEFL, DELF, DALF. Cours intensifs pendant les vacances. Certifiée QUALIOPI.","Martine","Langues","05 58 22 33 44","/banners/education.jpg"),
      d("ed3","Auto-École Atlantic","Éducation & Formation","Hossegor","40150","3 Rue de la Plage",43.6640,-1.4292,"gold","SARL","Permis B, A, AAC et formation continue. Moniteurs brevetés et bienveillants. Simulateur de conduite. Passage en ligne. Financement possible via CPF. Taux de réussite > 85%.","Stéphane","Conduite","05 58 33 44 55","/banners/education.jpg"),
      d("ed4","Formation Pro Biscarrosse","Éducation & Formation","Biscarrosse","40600","8 Allée des Pins",44.3952,-1.1637,"premium","SAS","Centre de formation professionnelle certifié QUALIOPI. Formations bureautique, management, RH et comptabilité. Financement CPF, OPCO et Pôle Emploi. Présentiel et distanciel.","Olivier","Formation","05 58 44 55 66","/banners/education.jpg"),
      d("ed5","Crèche Les Poussins","Éducation & Formation","Tartas","40400","2 Avenue de l'École",43.8335,-0.7502,"standard","Association","Micro-crèche agréée avec 10 places pour enfants de 0 à 3 ans. Éveil bienveillant, activités Montessori et repas bio cuisinés sur place. Horaires élargis 7h-19h.","Amélie","Crèche","05 58 55 66 77","/banners/education.jpg"),
    ],
  },

  // ── Hébergement ──────────────────────────────────────────────
  hebergement: {
    slug: "hebergement",
    category: "Hébergement & Tourisme",
    emoji: "🏡",
    title: "Hébergement &amp; Tourisme<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Gîtes, chambres d'hôtes, campings, locations et activités touristiques dans les Landes (40).",
    seoTitle: "Hébergements et activités touristiques dans les Landes",
    seoText: [
      "Les Landes constituent l'une des destinations touristiques les plus prisées de France. Avec ses plages de sable fin, sa forêt de pins, ses lacs et son art de vivre gascon, le département accueille chaque année des millions de visiteurs en quête de nature, de détente et de découverte.",
      "Notre annuaire référence les meilleurs <strong class=\"text-landes-pine\">hébergements et prestataires touristiques des Landes</strong> : gîtes ruraux, chambres d'hôtes, campings, locations saisonnières, hôtels, activités de plein air et guides touristiques qui font vivre une expérience authentique du territoire.",
      "La côte Atlantique landaise, avec ses spots de surf légendaires à <strong class=\"text-landes-pine\">Hossegor</strong> et <strong class=\"text-landes-pine\">Biscarrosse</strong>, ses forêts de pins à <strong class=\"text-landes-pine\">Parentis-en-Born</strong> et ses stations balnéaires à <strong class=\"text-landes-pine\">Mimizan</strong> et <strong class=\"text-landes-pine\">Capbreton</strong>, propose une multitude d'hébergements pour tous les budgets.",
      "L'intérieur des terres landaises ne manque pas de charme non plus. Les fermes-auberges, gîtes équestres et chambres d'hôtes nichées en forêt permettent de déconnecter totalement et de renouer avec la nature dans un cadre préservé.",
      "Que vous planifiiez un week-end romantique, des vacances en famille ou un séjour sportif, notre annuaire vous aide à trouver l'hébergement idéal dans les Landes et les activités touristiques qui rendront votre séjour inoubliable.",
    ],
    ctaText: "Gîte, chambre d'hôtes, camping ou activité touristique — référencez votre offre et soyez visible auprès des millions de touristes qui visitent les Landes chaque année.",
    demoPros: [
      d("he1","Domaine des Pins","Hébergement & Tourisme","Sabres","40630","Route de la Forêt",44.1500,-0.7333,"gold","SAS","5 chambres d'hôtes en forêt landaise. Petit-déjeuner maison avec produits locaux. Piscine chauffée, terrain pétanque et vélos à disposition. Table d'hôtes sur réservation.","Monique","Gîte","05 58 11 22 33","/banners/hebergement.jpg"),
      d("he2","Surf Camp Biscarrosse","Hébergement & Tourisme","Biscarrosse","40600","5 Chemin du Surf",44.3952,-1.1637,"premium","SARL","Stage surf + hébergement tout compris. Cours 3h/jour avec moniteurs diplômés. Dortoirs et chambres privées. Ambiance internationale et conviviale. Forfaits 3, 5 et 7 nuits.","Julien","Camp","05 58 22 33 44","/banners/hebergement.jpg"),
      d("he3","Camping Les Pins","Hébergement & Tourisme","Parentis-en-Born","40160","Allée du Lac",44.3500,-1.0660,"gold","SAS","Camping 4 étoiles au bord du lac de Parentis. Mobil-homes premium et emplacements. Piscine, toboggan, bar et restaurant. Animations enfants en juillet-août. Ouvert d'avril à octobre.","Vincent","Camp","05 58 33 44 55","/banners/hebergement.jpg"),
      d("he4","Villa Océane Mimizan","Hébergement & Tourisme","Mimizan","40200","3 Avenue de la Côte",44.2033,-1.2297,"premium","SCI","Villa de vacances 8 personnes à 200m de la plage. Jardin clos avec piscine, garage 2 voitures, climatisation, WiFi fibre. Disponible à la semaine de mai à septembre.","Éric","Villa","05 58 44 55 66","/banners/hebergement.jpg"),
      d("he5","Randos Landes Nature","Hébergement & Tourisme","Labouheyre","40210","Route de la Forêt",44.1500,-0.9333,"standard","EI","Guide nature agréé. Randonnées pédestres et à vélo en forêt landaise. Sorties ornithologiques, découverte des écosystèmes et bivouac encadré. Groupes de 2 à 15 personnes.","Guillaume","Guide","05 58 55 66 77","/banners/hebergement.jpg"),
    ],
  },

  // ── Restauration ─────────────────────────────────────────────
  restauration: {
    slug: "restauration",
    category: "Hôtellerie & Restauration",
    emoji: "🍽️",
    title: "Restauration &amp; Hôtellerie<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Restaurants, brasseries, hôtels et auberges du département des Landes (40).",
    seoTitle: "Restaurants et hôtels dans les Landes",
    seoText: [
      "Les Landes sont une destination gastronomique de premier plan. Foie gras, magret de canard, palombe, asperges et vins de Tursan : la table landaise célèbre le terroir du Sud-Ouest avec générosité et authenticité. Les restaurants du département rivalisent de talent pour mettre en valeur ces produits d'exception.",
      "Notre annuaire référence les meilleurs <strong class=\"text-landes-pine\">restaurants, brasseries, auberges et hôtels des Landes</strong> : de la gastronomie étoilée aux bistrots de village en passant par les bars à tapas côtiers et les pizzerias familiales, chaque commune propose une offre de restauration de qualité.",
      "La côte landaise propose une restauration résolument tournée vers la mer et le surf à <strong class=\"text-landes-pine\">Hossegor</strong> et <strong class=\"text-landes-pine\">Capbreton</strong>, avec des bars branchés, des restaurants de plage et des snacks ambulants. L'intérieur des terres mise davantage sur la tradition culinaire gasonne et les saveurs du terroir.",
      "<strong class=\"text-landes-pine\">Mont-de-Marsan</strong>, préfecture des Landes, offre une scène gastronomique diversifiée avec des restaurants étoilés, des brasseries contemporaines et des marchés gourmands où les producteurs locaux présentent leurs meilleurs produits.",
      "Que vous organisiez un dîner romantique, un déjeuner d'affaires, un repas de famille ou une simple pause gourmande lors de vos vacances, notre annuaire vous guide vers les meilleures tables des Landes.",
    ],
    ctaText: "Restaurant, brasserie, hôtel ou traiteur — référencez votre établissement et développez votre clientèle locale et touristique dans les Landes.",
    demoPros: [
      d("re1","La Table des Landes","Hôtellerie & Restauration","Mont-de-Marsan","40000","8 Place des Arts",43.8914,-0.5006,"gold","SARL","Restaurant gastronomique autour du terroir landais. Foie gras, magret, palombe et truffes. Carte des vins régionaux. Menu dégustation sur réservation. Fermeture lundi et mardi.","Christophe","Chef","05 58 11 22 33","/banners/restauration.jpg"),
      d("re2","Le Surf Bar","Hôtellerie & Restauration","Hossegor","40150","1 Front de Mer",43.6640,-1.4292,"premium","SAS","Bar et restaurant à tapas face à l'océan. Planches apéritives, cocktails maison et vins nature. Terrasse chauffée, musique live le week-end. Ouvert 7j/7 d'avril à octobre.","Diego","Bar","05 58 22 33 44","/banners/restauration.jpg"),
      d("re3","Auberge du Pin","Hôtellerie & Restauration","Sabres","40630","Route Forestière",44.1500,-0.7333,"gold","SARL","Auberge traditionnelle en forêt landaise. Cuisine du terroir, garbure, canard confit et grillades au feu de bois. Menus du marché. Chambres disponibles. Table d'hôtes le soir.","Gérard","Auberge","05 58 33 44 55","/banners/restauration.jpg"),
      d("re4","Hôtel Les Dunes","Hôtellerie & Restauration","Mimizan","40200","5 Promenade de la Mer",44.2033,-1.2297,"premium","SAS","Hôtel 3 étoiles avec restaurant panoramique vue sur l'océan. 45 chambres climatisées. Piscine, spa et salle de fitness. Séminaires jusqu'à 100 personnes. Petit-déjeuner buffet inclus.","Sandra","Hôtel","05 58 44 55 66","/banners/restauration.jpg"),
      d("re5","Glacier Artisanal","Hôtellerie & Restauration","Capbreton","40130","2 Rue du Marché",43.6630,-1.4431,"standard","EI","Glacier artisanal aux fruits frais locaux. Plus de 40 parfums dont des spécialités landaises (armagnac-pruneaux, pin maritime). Glaces vegan et sans gluten disponibles.","Laure","Glacier","05 58 55 66 77","/banners/restauration.jpg"),
    ],
  },

  // ── Immobilier ───────────────────────────────────────────────
  immobilier: {
    slug: "immobilier",
    category: "Immobilier",
    emoji: "🏠",
    title: "Immobilier<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Agences immobilières, constructeurs, gestionnaires et experts fonciers des Landes (40).",
    seoTitle: "Professionnels de l'immobilier dans les Landes",
    seoText: [
      "Le marché immobilier landais est en pleine effervescence. Porté par l'attrait de la côte Atlantique, la qualité de vie exceptionnelle et l'essor du télétravail, le département des Landes attire chaque année de nouveaux acheteurs et investisseurs en quête d'un cadre de vie privilégié.",
      "Notre annuaire référence les meilleurs <strong class=\"text-landes-pine\">professionnels de l'immobilier dans les Landes</strong> : agences immobilières, constructeurs de maisons individuelles, gestionnaires locatifs, diagnostiqueurs et experts fonciers qui accompagnent vos projets de A à Z.",
      "La côte landaise, avec ses villas de standing à <strong class=\"text-landes-pine\">Hossegor</strong> et <strong class=\"text-landes-pine\">Capbreton</strong>, ses résidences balnéaires à <strong class=\"text-landes-pine\">Mimizan</strong> et <strong class=\"text-landes-pine\">Biscarrosse</strong>, et ses terrains à bâtir dans l'arrière-pays, propose une variété de biens adaptés à tous les budgets et tous les projets.",
      "La construction de maisons individuelles est également très dynamique dans les Landes, avec de nombreux constructeurs locaux proposant des projets clés en main, respectueux des normes thermiques RE2020 et valorisant les matériaux locaux comme le bois de pin.",
      "Que vous souhaitiez acheter, vendre, louer ou investir dans l'immobilier landais, notre annuaire vous met en relation avec les professionnels les plus compétents et les mieux implantés dans le département des Landes.",
    ],
    ctaText: "Agence immobilière, constructeur, diagnostiqueur ou gestionnaire locatif — référencez votre activité et captez des mandats et clients dans les Landes.",
    demoPros: [
      d("im1","Landes Immobilier","Immobilier","Mont-de-Marsan","40000","15 Rue Saint-Pierre",43.8914,-0.5006,"gold","SARL","Agence immobilière indépendante. Vente et location résidentielle et commerciale dans tout le département 40. Estimation gratuite, photos professionnelles et visite virtuelle incluses.","Frédéric","Immo","05 58 11 22 33","/banners/immobilier.jpg"),
      d("im2","Côte Immo","Immobilier","Hossegor","40150","8 Avenue des Pins",43.6640,-1.4292,"gold","SAS","Spécialiste de l'immobilier balnéaire. Villas, appartements et terrains sur la côte landaise. Investissement locatif saisonnier et gestion complète. Réseau d'acquéreurs national et international.","Pascal","Côte","05 58 22 33 44","/banners/immobilier.jpg"),
      d("im3","Construction Landes","Immobilier","Tartas","40400","Zone Commerciale",43.8335,-0.7502,"premium","SARL","Constructeur de maisons individuelles sur mesure. Maisons RE2020, ossature bois et passive. Du terrain à la remise des clés. Garantie décennale et parfait achèvement. Devis gratuit.","Michel","Construc","05 58 33 44 55","/banners/immobilier.jpg"),
      d("im4","Gestion Location 40","Immobilier","Dax","40100","12 Avenue Victor Hugo",43.7101,-1.0527,"premium","SAS","Gestion locative complète : recherche de locataires, rédaction des baux, états des lieux, quittances et suivi des travaux. Gestion saisonnière sur la côte. Commission transparente.","Nadège","Gestion","05 58 44 55 66","/banners/immobilier.jpg"),
      d("im5","Expertise Foncière","Immobilier","Biscarrosse","40600","3 Boulevard de l'Expert",44.3952,-1.1637,"standard","EI","Expert immobilier certifié. Estimations de valeur vénale, DPE, diagnostic amiante, plomb et termites. Rapports d'expertise pour successions, divorces et transactions. Devis en ligne.","Thierry","Expert","05 58 55 66 77","/banners/immobilier.jpg"),
    ],
  },

  // ── Informatique ─────────────────────────────────────────────
  informatique: {
    slug: "informatique",
    category: "Informatique & Numérique",
    emoji: "💻",
    title: "Informatique &amp; Numérique<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Développeurs web, graphistes, réparateurs informatiques et agences digitales des Landes (40).",
    seoTitle: "Professionnels du numérique et de l'informatique dans les Landes",
    seoText: [
      "La transformation numérique est en marche dans les Landes. De plus en plus de TPE, PME et commerçants landais font appel à des professionnels du numérique pour développer leur présence en ligne, moderniser leurs outils de gestion et former leurs équipes aux nouvelles technologies.",
      "Notre annuaire référence les meilleurs <strong class=\"text-landes-pine\">professionnels de l'informatique et du numérique dans les Landes</strong> : développeurs web, agences digitales, graphistes, infogérants, réparateurs de matériel informatique et formateurs en bureautique.",
      "La création d'un site internet, le référencement naturel (SEO), la gestion des réseaux sociaux et la mise en place d'une boutique en ligne sont autant de services proposés par les agences web et les freelances du numérique basés dans les Landes.",
      "Les entreprises landaises ont également besoin d'être accompagnées dans la sécurisation de leurs données, la mise en place de solutions cloud et la maintenance de leur parc informatique. Des spécialistes locaux en infogérance et cybersécurité répondent à ces besoins de <strong class=\"text-landes-pine\">Mont-de-Marsan</strong> à <strong class=\"text-landes-pine\">Dax</strong> en passant par toutes les communes du département.",
      "Que vous soyez artisan, commerçant ou dirigeant d'une PME landaise, faites confiance aux professionnels du numérique de votre département pour vous accompagner dans votre digitalisation.",
    ],
    ctaText: "Développeur, graphiste, infogérant ou formateur informatique — référencez votre activité et développez votre clientèle parmi les entreprises landaises.",
    demoPros: [
      d("in1","Web Landes Agency","Informatique & Numérique","Mont-de-Marsan","40000","25 Rue du Digital",43.8914,-0.5006,"gold","SAS","Agence web créative : sites vitrine, e-commerce, applications mobiles. SEO, Google Ads et réseaux sociaux. Accompagnement complet de la stratégie digitale au reporting mensuel.","Alexandre","Web","05 58 11 22 33"),
      d("in2","Répar'Info 40","Informatique & Numérique","Dax","40100","7 Rue du PC",43.7101,-1.0527,"premium","EI","Réparation PC, Mac et smartphones. Suppression de virus, récupération de données, mise à jour matériel. Intervention à domicile possible. Devis gratuit. Pièces garanties 12 mois.","Kevin","Répar","05 58 22 33 44"),
      d("in3","Studio Créa Digital","Informatique & Numérique","Hossegor","40150","4 Rue du Studio",43.6640,-1.4292,"gold","EURL","Graphisme et identité visuelle. Création de logos, chartes graphiques, supports print et digitaux. Illustration, motion design et direction artistique. Portfolio sur demande.","Chloé","Créa","05 58 33 44 55"),
      d("in4","Cloud Solutions 40","Informatique & Numérique","Biscarrosse","40600","2 Allée du Cloud",44.3952,-1.1637,"premium","SAS","Infogérance, hébergement et solutions cloud pour TPE/PME. Sauvegarde automatique, messagerie professionnelle et cybersécurité. Contrats de maintenance mensuels. SLA garanti.","Thomas","Cloud","05 58 44 55 66"),
      d("in5","Formation Numérique 40","Informatique & Numérique","Capbreton","40130","9 Rue des Formations",43.6630,-1.4431,"standard","SAS","Formations bureautique, réseaux sociaux, création de site web et sécurité informatique. Présentiel et distanciel. Certifié QUALIOPI. Financement CPF et OPCO acceptés.","Isabelle","Form","05 58 55 66 77"),
    ],
  },

  // ── Médical ──────────────────────────────────────────────────
  medical: {
    slug: "medical",
    category: "Médical & Paramédical",
    emoji: "🏥",
    title: "Médical &amp; Paramédical<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Kinés, infirmiers, pharmaciens, dentistes et praticiens de santé dans les Landes (40).",
    seoTitle: "Professionnels de santé et soins médicaux dans les Landes",
    seoText: [
      "Trouver un professionnel de santé de confiance dans les Landes est essentiel pour le bien-être des habitants et des visiteurs du département. Notre annuaire répertorie les praticiens médicaux et paramédicaux du département des Landes.",
      "Notre annuaire référence les <strong class=\"text-landes-pine\">professionnels de santé des Landes</strong> : kinésithérapeutes, infirmiers libéraux, pharmaciens, dentistes, opticiens, podologues, orthophonistes, médecins généralistes et spécialistes qui accompagnent les patients avec professionnalisme.",
      "<strong class=\"text-landes-pine\">Dax</strong>, première station thermale de France, concentre une offre médicale et paramédicale exceptionnelle, notamment en rhumatologie, en médecine physique et en kinésithérapie, grâce à ses nombreuses structures thermales et cliniques spécialisées.",
      "Les communes rurales des Landes bénéficient également de l'engagement de praticiens libéraux qui maintiennent une offre de soins de proximité indispensable pour les habitants des territoires éloignés des grandes villes comme <strong class=\"text-landes-pine\">Aire-sur-l'Adour</strong>, <strong class=\"text-landes-pine\">Hagetmau</strong> ou <strong class=\"text-landes-pine\">Morcenx</strong>.",
      "Que vous ayez besoin de soins de première nécessité, d'une rééducation post-opératoire, d'un bilan de santé ou de soins dentaires, notre annuaire vous permet de trouver rapidement un professionnel de santé disponible dans les Landes.",
    ],
    ctaText: "Kinésithérapeute, infirmier, pharmacien, dentiste ou médecin — référencez votre cabinet et facilitez l'accès aux soins pour les patients des Landes.",
    demoPros: [
      d("me1","Cabinet Kiné Dax","Médical & Paramédical","Dax","40100","5 Rue de la Santé",43.7101,-1.0527,"gold","SELARL","Kinésithérapie rééducative et sportive. Massages thérapeutiques, drainage lymphatique, rééducation post-opératoire et prise en charge des sportifs. Conventionné Sécurité Sociale.","Nathalie","Kiné","05 58 11 22 33"),
      d("me2","Pharmacie des Pins","Médical & Paramédical","Mont-de-Marsan","40000","10 Avenue de la Pharmacie",43.8914,-0.5006,"premium","SNC","Pharmacie de proximité avec conseil personnalisé. Parapharmacie, orthopédie et délivrance de matériel médical. Téléconsultation médicale disponible. Livraison à domicile sur demande.","Philippe","Pharma","05 58 22 33 44"),
      d("me3","Cabinet Infirmier Bisca","Médical & Paramédical","Biscarrosse","40600","3 Rue des Soins",44.3952,-1.1637,"gold","SCM","Infirmières libérales. Soins à domicile 7j/7 : pansements, injections, prises de sang, glycémie, chimiothérapie à domicile. Prise en charge SSIAD et HAD. Diabétologie et plaies chroniques.","Marie-Claire","Infirm","05 58 33 44 55"),
      d("me4","Dentiste Soustons","Médical & Paramédical","Soustons","40140","8 Allée du Cabinet",43.7540,-1.2749,"premium","SCP","Cabinet dentaire complet. Soins courants, blanchiment, implants, prothèses et orthodontie invisaligne. Urgences le matin sans rendez-vous. Radiographie numérique et laser dentaire.","David","Dentiste","05 58 44 55 66"),
      d("me5","Optique Hossegor","Médical & Paramédical","Hossegor","40150","2 Place du Village",43.6640,-1.4292,"standard","SAS","Opticien lunetier. Lunettes de vue et solaires, lentilles de contact. Bilan visuel gratuit sur rendez-vous. Tiers-payant toutes mutuelles. Large choix de montures et verres progressifs.","Virginie","Optique","05 58 55 66 77"),
    ],
  },

  // ── Agriculture ──────────────────────────────────────────────
  agriculture: {
    slug: "agriculture",
    category: "Nature & Agriculture",
    emoji: "🌾",
    title: "Nature &amp; Agriculture<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Producteurs locaux, agriculteurs, pépiniéristes et professionnels de la nature dans les Landes (40).",
    seoTitle: "Producteurs locaux et agriculture dans les Landes",
    seoText: [
      "Les Landes sont un territoire agricole d'exception. Entre la forêt de pins maritime, les cultures maraîchères du Marsan, les élevages de canards du Chalosse et les vignobles de Tursan, le département produit des aliments d'une qualité et d'une typicité remarquables.",
      "Notre annuaire référence les <strong class=\"text-landes-pine\">producteurs locaux et professionnels de la nature dans les Landes</strong> : éleveurs de canards, maraîchers biologiques, apiculteurs, viticulteurs, pépiniéristes, exploitants forestiers et paysagistes qui font vivre le territoire.",
      "Le canard landais est l'emblème gastronomique du département. Les élevages de <strong class=\"text-landes-pine\">Chalosse</strong> et du <strong class=\"text-landes-pine\">Pays Tarusate</strong> produisent un foie gras et des magrets reconnus comme les meilleurs de France, labellisés IGP (Indication Géographique Protégée).",
      "Le maraîchage bio se développe fortement dans les Landes, avec de nombreux agriculteurs engagés dans des pratiques durables et des circuits courts. Les AMAP (Associations pour le Maintien de l'Agriculture Paysanne) permettent aux familles landaises de s'approvisionner directement chez les producteurs.",
      "Que vous cherchiez à acheter des produits frais directement à la ferme, à faire entretenir votre jardin par un paysagiste professionnel, ou à planter des essences locales dans votre terrain, notre annuaire vous met en relation avec les professionnels de la nature des Landes.",
    ],
    ctaText: "Éleveur, maraîcher, apiculteur, paysagiste ou forestier — référencez votre exploitation et développez votre clientèle directe dans les Landes.",
    demoPros: [
      d("ag1","Ferme du Canard","Nature & Agriculture","Hagetmau","40700","Chemin de la Ferme",43.6429,-0.5910,"gold","EARL","Élevage traditionnel de canards IGP Chalosse. Production de foie gras, magrets, confits et rillettes. Vente à la ferme et livraison. Visites de l'exploitation sur réservation.","Jean-Pierre","Canard","05 58 11 22 33"),
      d("ag2","Pépinière des Landes","Nature & Agriculture","Sabres","40630","Route des Arbres",44.1500,-0.7333,"premium","SARL","Vente de plants, arbres, arbustes et plantes vivaces adaptés au climat landais. Service de plantation et création de jardins. Conseils d'expert et diagnostic paysager gratuit.","Bertrand","Pépinière","05 58 22 33 44"),
      d("ag3","Apiculture Forêt 40","Nature & Agriculture","Labouheyre","40210","Chemin des Ruches",44.1500,-0.9333,"gold","EI","Apiculteur passionné. Miels de forêt landaise, de fleurs sauvages et de bruyère. Propolis, cire et produits de la ruche. Vente directe et livraison à domicile. Initiation apiculture.","Robert","Miel","05 58 33 44 55"),
      d("ag4","Maraîchage Bio Landes","Nature & Agriculture","Aire-sur-l'Adour","40800","Chemin des Légumes",43.9265,-0.3303,"premium","EARL","Légumes de saison cultivés en agriculture biologique. AMAP et vente sur marchés locaux. Paniers hebdomadaires de 6kg. Variétés anciennes et semences paysannes. Accès à la ferme.","Lucie","Bio","05 58 44 55 66"),
      d("ag5","Sylviculture Landes","Nature & Agriculture","Morcenx","40110","Route Forestière",44.0906,-0.6003,"standard","SARL","Gestion et exploitation de forêts de pins maritimes. Élagage, abattage, débroussaillage et reboisement. Vente de bois de chauffage et plaquettes forestières. Intervention dans tout le 40.","Patrick","Forêt","05 58 55 66 77"),
    ],
  },

  // ── Services ─────────────────────────────────────────────────
  services: {
    slug: "services",
    category: "Services à la personne",
    emoji: "🤝",
    title: "Services à la personne<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Aide à domicile, baby-sitting, jardinage, ménage et conciergerie dans les Landes (40).",
    seoTitle: "Services à la personne et aide à domicile dans les Landes",
    seoText: [
      "Les services à la personne sont en pleine expansion dans les Landes, répondant aux besoins croissants d'aide à domicile pour les personnes âgées, de garde d'enfants pour les familles actives, et de services pratiques pour tous les ménages landais.",
      "Notre annuaire référence les <strong class=\"text-landes-pine\">meilleurs prestataires de services à la personne dans les Landes</strong> : aides à domicile, assistantes maternelles, jardiniers, agents d'entretien, pressings, concierges et coursiers qui facilitent votre quotidien.",
      "Le maintien à domicile des personnes âgées et handicapées est une priorité dans les Landes. Des professionnels qualifiés et bienveillants interviennent chaque jour pour accompagner les personnes dépendantes dans les gestes du quotidien : aide à la toilette, préparation des repas, courses et compagnie.",
      "Les familles landaises bénéficient également de nombreux services : garde d'enfants à domicile, aide aux devoirs, jardinage et entretien de piscine. Ces services permettent de concilier vie professionnelle et vie familiale dans de meilleures conditions.",
      "Tous les prestataires de services à la personne référencés sur notre annuaire sont déclarés et permettent de bénéficier du <strong class=\"text-landes-pine\">crédit d'impôt de 50%</strong> sur les dépenses engagées, dans la limite des plafonds légaux.",
    ],
    ctaText: "Aide à domicile, baby-sitter, jardinier, agent d'entretien ou concierge — référencez votre activité et développez votre clientèle dans les Landes.",
    demoPros: [
      d("se1","Aide & Présence 40","Services à la personne","Mont-de-Marsan","40000","5 Rue de l'Entraide",43.8914,-0.5006,"gold","SAS","Aide à domicile pour personnes âgées et dépendantes. Aide aux gestes quotidiens, accompagnement sorties, portage de repas. Agréée et conventionnée. Crédit impôt 50%.","Sylvie","Aide","05 58 11 22 33"),
      d("se2","Baby-Sitting Pro Dax","Services à la personne","Dax","40100","8 Avenue des Familles",43.7101,-1.0527,"premium","EI","Garde d'enfants à domicile. Nounous diplômées, titulaires du BAFA et premiers secours. Gardes régulières ou ponctuelles. Aide aux devoirs incluse. Disponible soirs et week-ends.","Élodie","Baby","05 58 22 33 44"),
      d("se3","Jardinage Landes","Services à la personne","Biscarrosse","40600","3 Chemin du Jardin",44.3952,-1.1637,"gold","EI","Entretien de jardins et espaces verts. Tonte, taille de haies, élagage, débroussaillage, plantation et arrosage. Entretien de piscines. Devis gratuit, intervention hebdomadaire possible.","Laurent","Jardin","05 58 33 44 55"),
      d("se4","Conciergerie Côte","Services à la personne","Hossegor","40150","4 Rue de la Conciergerie",43.6640,-1.4292,"premium","SAS","Conciergerie pour résidences secondaires et locations saisonnières. Check-in, check-out, ménage, linge, petits travaux et gestion des urgences. Disponible 7j/7 sur la côte landaise.","Valérie","Concierg","05 58 44 55 66"),
      d("se5","Pressing Express","Services à la personne","Capbreton","40130","1 Place du Centre",43.6630,-1.4431,"standard","SAS","Pressing et blanchisserie. Nettoyage à sec, repassage, détachage et restauration textile. Livraison à domicile disponible. Traitement des vêtements délicats et cuirs.","Monique","Press","05 58 55 66 77"),
    ],
  },

  // ── Sport (slug only — page déjà existante) ──────────────────
  sport: {
    slug: "sport",
    category: "Sport & Fitness",
    emoji: "🏄",
    title: "Sport &amp; Fitness<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Clubs, écoles de sport et coachs sportifs du département des Landes (40).",
    seoTitle: "Sport & activités sportives dans les Landes",
    seoText: [
      "Le département des Landes est une destination de choix pour les amateurs de sport. Grâce à ses 200 km de côte Atlantique, ses forêts et ses lacs, les Landes offrent un terrain de jeu exceptionnel pour la pratique sportive toute l'année.",
      "Notre annuaire recense les meilleurs <strong class=\"text-landes-pine\">professionnels du sport dans les Landes</strong> : écoles de surf, salles de sport, clubs de tennis, centres équestres, studios de yoga et loueurs de vélos.",
      "Les Landes sont mondialement connues pour leurs vagues, attirant chaque année des milliers de surfeurs sur les plages de <strong class=\"text-landes-pine\">Hossegor</strong>, <strong class=\"text-landes-pine\">Biscarrosse</strong>, <strong class=\"text-landes-pine\">Capbreton</strong> et <strong class=\"text-landes-pine\">Mimizan</strong>.",
      "Au-delà du surf, la forêt landaise se prête parfaitement à la randonnée, au cyclisme et au VTT, grâce à ses nombreuses pistes balisées. Les amateurs de sports de raquette trouveront aussi des clubs de tennis et de padel dans toutes les communes.",
      "Que vous recherchiez une salle de fitness, un coach personnel, un professeur de yoga, un club équestre ou une école de kitesurf, notre annuaire vous permet de trouver le bon professionnel du sport dans les Landes en quelques clics.",
    ],
    ctaText: "Club, école de sport, coach ou salle de fitness — référencez votre activité et soyez trouvé par des milliers de sportifs landais.",
    demoPros: [
      d("s1","Surf School Biscarrosse","Sport & Fitness","Biscarrosse","40600","1 Avenue de la Plage",44.3970,-1.1650,"gold","SARL","École de surf reconnue. Cours collectifs et particuliers pour tous niveaux. Location de matériel. Stages vacances enfants et adultes. Moniteurs diplômés d'État.","Julien","Waves","05 58 11 22 33"),
      d("s2","Atlantic Gym","Sport & Fitness","Mont-de-Marsan","40000","15 Rue du Stade",43.8960,-0.5040,"premium","SAS","Salle de sport et fitness. Musculation, cardio, cours collectifs. Coaching personnalisé. Accès 7j/7 avec badge. Essai gratuit sur rendez-vous.","Laura","Fit","05 58 22 33 44"),
      d("s3","Vélo Évasion Landes","Sport & Fitness","Mimizan","40200","5 Route des Pistes",44.2050,-1.2310,"premium","EURL","Location de vélos électriques et VTT. Circuits guidés en forêt. Balades en famille et séjours vélo tout compris.","Pierre","Vélo","05 58 33 44 55"),
      d("s4","Tennis Club Dacquois","Sport & Fitness","Dax","40100","8 Allée du Tennis",43.7080,-1.0510,"standard","Association","Club de tennis avec 8 courts et 4 terrains de padel. Cours tous niveaux. Stages vacances.","Marc","Tennis","05 58 44 55 66"),
      d("s5","Centre Équestre des Pins","Sport & Fitness","Sabres","40630","Chemin des Cavaliers",44.1520,-0.7310,"gold","SARL","Centre équestre en forêt. Cours équitation, randonnées et stages vacances. Poney-club pour enfants.","Sophie","Equestre","05 58 55 66 77"),
    ],
  },

  // ── Transport ────────────────────────────────────────────────
  transport: {
    slug: "transport",
    category: "Transport & Logistique",
    emoji: "🚚",
    title: "Transport &amp; Logistique<br/><span class=\"text-landes-sand\">dans les Landes</span>",
    subtitle: "Taxis, déménageurs, ambulances, coursiers et transporteurs dans les Landes (40).",
    seoTitle: "Transport et logistique dans les Landes",
    seoText: [
      "Le transport est un secteur essentiel dans les Landes, département étendu sur plus de 9 000 km² où les distances entre communes peuvent être importantes. Taxis, VTC, ambulanciers, déménageurs et coursiers assurent la mobilité des personnes et des marchandises dans tout le territoire.",
      "Notre annuaire référence les meilleurs <strong class=\"text-landes-pine\">professionnels du transport et de la logistique dans les Landes</strong> : taxis conventionnés, VTC, ambulances, déménageurs, entreprises de livraison, loueurs de véhicules utilitaires et transporteurs de marchandises.",
      "Le transport sanitaire est particulièrement important dans les Landes, où l'accès aux soins dans les zones rurales nécessite des déplacements réguliers vers les centres hospitaliers de <strong class=\"text-landes-pine\">Mont-de-Marsan</strong>, <strong class=\"text-landes-pine\">Dax</strong> et <strong class=\"text-landes-pine\">Bayonne</strong>. Des sociétés d'ambulances et de VSL (Véhicule Sanitaire Léger) couvrent l'ensemble du département.",
      "Les taxis et VTC landais assurent également les transferts aéroportuaires vers les aéroports de Pau-Pyrénées, Bordeaux-Mérignac et Biarritz-Anglet-Bayonne, facilitant les déplacements des résidents et des touristes en séjour dans les Landes.",
      "Que vous ayez besoin d'un taxi pour un rendez-vous médical, d'un déménageur pour votre prochain déménagement dans les Landes, ou d'un coursier pour une livraison urgente, notre annuaire vous met en relation avec le bon professionnel du transport.",
    ],
    ctaText: "Taxi, ambulancier, déménageur, coursier ou loueur de véhicules — référencez votre activité et développez votre clientèle dans les Landes.",
    demoPros: [
      d("tr1","Taxi Landes Express","Transport & Logistique","Mont-de-Marsan","40000","Gare de Mont-de-Marsan",43.8914,-0.5006,"gold","EI","Taxi conventionné et VTC. Disponible 24h/24 et 7j/7. Transferts gares et aéroports (Pau, Bordeaux, Biarritz). Longues distances. Prise en charge immédiate sur appel.","René","Taxi","05 58 11 22 33"),
      d("tr2","Déménagement 40","Transport & Logistique","Dax","40100","Zone Logistique",43.7101,-1.0527,"premium","SARL","Déménagements locaux, régionaux et nationaux. Emballage professionnel, montage et démontage de meubles. Garde-meuble climatisé. Assurance tous risques incluse. Devis gratuit.","Michel","Déménag","05 58 22 33 44"),
      d("tr3","Ambulances Côte","Transport & Logistique","Capbreton","40130","Avenue Médicale",43.6630,-1.4431,"gold","SARL","Transport sanitaire conventionné Sécurité Sociale. Ambulances et VSL pour consultations, hospitalisations et dialyses. Disponible 24h/24. Prise en charge tiers-payant.","Claude","Ambu","05 58 33 44 55"),
      d("tr4","Livraison Express 40","Transport & Logistique","Biscarrosse","40600","Zone Commerciale",44.3952,-1.1637,"premium","SAS","Coursier et livraison express dans tout le département 40. Colis, documents, marchandises fragiles et alimentaires. Véhicules réfrigérés disponibles. Traçabilité en temps réel.","Antoine","Livr","05 58 44 55 66"),
      d("tr5","Location Véhicules 40","Transport & Logistique","Hossegor","40150","Avenue des Pins",43.6640,-1.4292,"standard","SAS","Location de voitures, utilitaires et camping-cars. Tarifs à la journée, semaine et mois. Livraison sur votre lieu de séjour dans les Landes. Assurance incluse, jeune conducteur accepté.","Pierre","Loc","05 58 55 66 77"),
    ],
  },
};
