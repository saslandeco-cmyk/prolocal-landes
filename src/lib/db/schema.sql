-- ═══════════════════════════════════════════════════════════════════
-- Schéma de base de données — Prolocal-Landes.fr
-- Étape 1 de la migration localStorage → base de données réelle.
--
-- À exécuter une fois dans l'éditeur SQL de Vercel Postgres
-- (Vercel Dashboard → Storage → votre base → Query).
--
-- Choix de conception : chaque table combine des colonnes "en dur" pour
-- les champs utilisés dans les recherches/filtres/tris (donc indexables),
-- et une colonne `data JSONB` contenant l'objet complet (tous les champs
-- optionnels/évolutifs du type TypeScript correspondant : réseaux sociaux,
-- horaires, photos, options complémentaires, etc.). Ce choix évite une
-- table rigide à des dizaines de colonnes et une migration SQL à chaque
-- nouveau champ ajouté à l'application — la seule source de vérité pour
-- la forme exacte des données reste le type TypeScript `Professional`
-- (src/types/index.ts), toujours sérialisé tel quel dans `data`.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS professionals (
  id              TEXT PRIMARY KEY,
  siren           TEXT NOT NULL,
  siret           TEXT,
  company_name    TEXT NOT NULL,
  category        TEXT NOT NULL,
  subcategory     TEXT,
  city            TEXT NOT NULL,
  postal_code     TEXT NOT NULL,
  plan            TEXT NOT NULL DEFAULT 'standard',   -- standard | premium | gold
  status          TEXT NOT NULL DEFAULT 'active',     -- active | pending | suspended | rejected
  claimed         BOOLEAN NOT NULL DEFAULT FALSE,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  email           TEXT,
  phone           TEXT,
  data            JSONB NOT NULL,                     -- objet Professional complet
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recherche/filtre par catégorie, ville, statut (pages annuaire/catégories)
CREATE INDEX IF NOT EXISTS idx_professionals_category    ON professionals (category);
CREATE INDEX IF NOT EXISTS idx_professionals_subcategory  ON professionals (subcategory);
CREATE INDEX IF NOT EXISTS idx_professionals_city         ON professionals (city);
CREATE INDEX IF NOT EXISTS idx_professionals_status       ON professionals (status);
CREATE INDEX IF NOT EXISTS idx_professionals_siren        ON professionals (siren);
-- Recherche géographique (page "Autour de moi")
CREATE INDEX IF NOT EXISTS idx_professionals_lat_lng      ON professionals (lat, lng);
-- Recherche texte (nom d'entreprise)
CREATE INDEX IF NOT EXISTS idx_professionals_company_name ON professionals USING gin (to_tsvector('french', company_name));

CREATE TABLE IF NOT EXISTS reviews (
  id              TEXT PRIMARY KEY,
  pro_id          TEXT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'approved',   -- pending | approved | rejected
  data            JSONB NOT NULL,                     -- objet Review complet (auteur, commentaire, réponse pro, etc.)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_pro_id ON reviews (pro_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status);

-- ── Table de suivi de la migration (pour la double-écriture de l'étape 2) ──
-- Permet de savoir, par professionnel, si sa fiche a déjà été migrée vers
-- la base et peut donc être lue depuis celle-ci en priorité.
CREATE TABLE IF NOT EXISTS migration_status (
  pro_id          TEXT PRIMARY KEY,
  migrated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── CRM : prospects et clients d'un professionnel (étape 5) ──
CREATE TABLE IF NOT EXISTS clients (
  id              TEXT PRIMARY KEY,
  pro_id          TEXT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  first_name      TEXT,
  last_name       TEXT,
  company         TEXT,
  email           TEXT,
  status          TEXT NOT NULL DEFAULT 'prospect',  -- prospect | actif | inactif | vip
  data            JSONB NOT NULL,                    -- objet Client complet
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_pro_id ON clients (pro_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients (status);
CREATE INDEX IF NOT EXISTS idx_clients_email  ON clients (email);

-- ── Facturation : devis, factures et avoirs d'un professionnel (étape 5) ──
CREATE TABLE IF NOT EXISTS billing_documents (
  id              TEXT PRIMARY KEY,
  pro_id          TEXT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,                     -- devis | facture | avoir
  status          TEXT NOT NULL DEFAULT 'brouillon',  -- brouillon | envoyé | accepté | refusé | payé | annulé
  number          TEXT,
  issue_date      DATE,
  data            JSONB NOT NULL,                    -- objet BillingDocument complet
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_documents_pro_id ON billing_documents (pro_id);
CREATE INDEX IF NOT EXISTS idx_billing_documents_type   ON billing_documents (type);
CREATE INDEX IF NOT EXISTS idx_billing_documents_status ON billing_documents (status);

-- ── Catalogue des options complémentaires (géré depuis l'admin) ──
-- Table facultative : si vide ou base non configurée, le site retombe sur
-- le catalogue par défaut codé en dur (src/lib/pricing.ts), pour ne jamais
-- casser le parcours de paiement.
CREATE TABLE IF NOT EXISTS complementary_options (
  id                TEXT PRIMARY KEY,        -- identifiant technique stable (ex: "pub", "seo")
  name              TEXT NOT NULL,
  description       TEXT,
  unit_amount       INTEGER NOT NULL,        -- montant en centimes d'euro
  cadence           TEXT NOT NULL,           -- "month" | "once"
  stripe_product_id TEXT NOT NULL,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
