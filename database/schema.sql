-- ============================================================================
-- SCHÉMA DE BASE DE DONNÉES CONFORME NF525
-- ============================================================================
-- Projet: FelxPOS - SaaS de Caisse Enregistreuse
-- Norme: NF525 (Inaltérabilité, Sécurisation, Conservation, Archivage)
-- SGBD: PostgreSQL 15+
-- ============================================================================

-- Extensions requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES PRINCIPALES
-- ============================================================================

-- Table des tenants (multi-tenant SaaS)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Informations entreprise
    siret VARCHAR(14) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    legal_form VARCHAR(50),
    naf_code VARCHAR(5) NOT NULL,
    vat_number VARCHAR(13),

    -- Adresse
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    postal_code VARCHAR(10),
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'FR',

    -- Contact
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),

    -- Conformité NF525
    nf525_compliant BOOLEAN DEFAULT false,
    certification_number VARCHAR(100),
    certification_date DATE,
    certification_expiry DATE,

    -- Statut
    is_active BOOLEAN DEFAULT true,
    subscription_plan VARCHAR(50) DEFAULT 'starter',

    -- Métadonnées
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Contraintes
    CONSTRAINT check_siret_length CHECK (length(siret) = 14),
    CONSTRAINT check_siret_numeric CHECK (siret ~ '^[0-9]{14}$'),
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Index sur tenants
CREATE INDEX idx_tenants_siret ON tenants(siret);
CREATE INDEX idx_tenants_active ON tenants(is_active) WHERE is_active = true;

-- ============================================================================

-- Table des caisses enregistreuses
CREATE TABLE IF NOT EXISTS cash_registers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,

    -- Identification caisse
    register_code VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    location VARCHAR(100),

    -- Activation
    activation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivation_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,

    -- Configuration
    auto_closure_enabled BOOLEAN DEFAULT true,
    auto_closure_time TIME DEFAULT '23:59:00',
    receipt_header TEXT,
    receipt_footer TEXT,

    -- Métadonnées
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Contraintes
    UNIQUE(tenant_id, register_code),
    CONSTRAINT check_dates CHECK (deactivation_date IS NULL OR deactivation_date > activation_date)
);

-- Index sur cash_registers
CREATE INDEX idx_registers_tenant ON cash_registers(tenant_id);
CREATE INDEX idx_registers_active ON cash_registers(is_active) WHERE is_active = true;

-- ============================================================================

-- Table des opérateurs/utilisateurs
CREATE TABLE IF NOT EXISTS operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,

    -- Informations personnelles
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),

    -- Authentification (gérée par Supabase Auth)
    supabase_user_id UUID UNIQUE,

    -- Rôle et permissions
    role VARCHAR(50) NOT NULL DEFAULT 'cashier',
    permissions JSONB DEFAULT '[]'::jsonb,

    -- Statut
    is_active BOOLEAN DEFAULT true,

    -- Métadonnées
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,

    -- Contraintes
    UNIQUE(tenant_id, email),
    CONSTRAINT check_role CHECK (role IN ('admin', 'manager', 'cashier', 'accountant'))
);

-- Index sur operators
CREATE INDEX idx_operators_tenant ON operators(tenant_id);
CREATE INDEX idx_operators_supabase_user ON operators(supabase_user_id);

-- ============================================================================

-- Table des transactions (IMMUABLE - NF525)
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,

    -- Relations
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE RESTRICT,
    operator_id UUID REFERENCES operators(id) ON DELETE SET NULL,

    -- Identification transaction
    transaction_number BIGINT NOT NULL,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Type de transaction
    transaction_type VARCHAR(20) NOT NULL DEFAULT 'sale',
    status VARCHAR(20) NOT NULL DEFAULT 'completed',

    -- Montants (en centimes pour précision)
    total_ht DECIMAL(12,2) NOT NULL,
    total_vat DECIMAL(12,2) NOT NULL,
    total_ttc DECIMAL(12,2) NOT NULL,

    -- Détails TVA (JSON pour flexibilité)
    vat_details JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Articles vendus
    items JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Paiement
    payment_method VARCHAR(50) NOT NULL,
    payment_details JSONB DEFAULT '{}'::jsonb,

    -- Client (optionnel)
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_name VARCHAR(255),

    -- Hash chain NF525 (CRITIQUE)
    previous_hash VARCHAR(64),
    current_hash VARCHAR(64) NOT NULL,
    hash_sequence BIGINT NOT NULL,

    -- Métadonnées
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Contraintes NF525
    CONSTRAINT check_amounts CHECK (
        total_ttc >= 0 AND
        total_ht >= 0 AND
        total_vat >= 0 AND
        total_ttc = total_ht + total_vat
    ),
    CONSTRAINT check_hash_not_null CHECK (current_hash IS NOT NULL),
    CONSTRAINT check_hash_length CHECK (length(current_hash) = 64),
    CONSTRAINT check_transaction_type CHECK (
        transaction_type IN ('sale', 'refund', 'void', 'correction')
    ),
    CONSTRAINT check_payment_method CHECK (
        payment_method IN ('cash', 'card', 'check', 'transfer', 'voucher', 'mobile')
    ),
    CONSTRAINT unique_transaction_number_per_tenant UNIQUE(tenant_id, transaction_number)
);

-- Index critiques pour performances
CREATE INDEX idx_transactions_tenant_date ON transactions(tenant_id, transaction_date DESC);
CREATE INDEX idx_transactions_register ON transactions(register_id, transaction_date DESC);
CREATE INDEX idx_transactions_hash_sequence ON transactions(tenant_id, hash_sequence);
CREATE INDEX idx_transactions_receipt ON transactions(receipt_number);
CREATE INDEX idx_transactions_customer ON transactions(customer_email) WHERE customer_email IS NOT NULL;
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- Index GIN pour recherche JSON
CREATE INDEX idx_transactions_items ON transactions USING gin(items);
CREATE INDEX idx_transactions_vat ON transactions USING gin(vat_details);

-- ============================================================================

-- Table d'audit (IMMUABLE - NF525)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,

    -- Relations
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES operators(id) ON DELETE SET NULL,

    -- Événement
    event_type VARCHAR(100) NOT NULL,
    event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Contexte
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    action VARCHAR(50),

    -- Données
    old_values JSONB,
    new_values JSONB,

    -- Traçabilité réseau
    ip_address INET,
    user_agent TEXT,

    -- Hash chain pour l'audit aussi (double sécurité)
    hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64),

    -- Métadonnées
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Contraintes
    CONSTRAINT check_event_type CHECK (
        event_type IN (
            'TRANSACTION_CREATED', 'TRANSACTION_REFUNDED',
            'CLOSURE_PERFORMED', 'CLOSURE_ARCHIVED',
            'OPERATOR_LOGIN', 'OPERATOR_LOGOUT',
            'SETTINGS_CHANGED', 'EXPORT_GENERATED',
            'HASH_VERIFICATION_FAILED', 'SYSTEM_ERROR'
        )
    )
);

-- Index sur audit_logs
CREATE INDEX idx_audit_tenant_date ON audit_logs(tenant_id, event_date DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, event_date DESC);
CREATE INDEX idx_audit_event_type ON audit_logs(event_type, event_date DESC);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- ============================================================================

-- Table des clôtures journalières (IMMUABLE - NF525)
CREATE TABLE IF NOT EXISTS daily_closures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE RESTRICT,
    operator_id UUID REFERENCES operators(id) ON DELETE SET NULL,

    -- Date de clôture
    closure_date DATE NOT NULL,
    closure_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Statistiques journalières
    total_transactions INTEGER NOT NULL DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_refunds INTEGER DEFAULT 0,
    total_voids INTEGER DEFAULT 0,

    -- Totaux financiers
    total_ht DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_vat DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_ttc DECIMAL(12,2) NOT NULL DEFAULT 0,

    -- Répartition TVA
    vat_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Répartition par moyen de paiement
    payment_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Hash de contrôle NF525
    first_transaction_hash VARCHAR(64),
    last_transaction_hash VARCHAR(64),
    closure_hash VARCHAR(64) NOT NULL,

    -- Archivage
    archive_url TEXT,
    archived_at TIMESTAMPTZ,
    archive_signature VARCHAR(128),

    -- Statut
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMPTZ,

    -- Métadonnées
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Contraintes NF525
    CONSTRAINT unique_closure_per_day UNIQUE(tenant_id, register_id, closure_date),
    CONSTRAINT check_totals CHECK (total_ttc = total_ht + total_vat),
    CONSTRAINT check_transaction_count CHECK (
        total_transactions = total_sales + total_refunds + total_voids
    ),
    CONSTRAINT check_closure_hash_not_null CHECK (closure_hash IS NOT NULL)
);

-- Index sur daily_closures
CREATE INDEX idx_closures_tenant_date ON daily_closures(tenant_id, closure_date DESC);
CREATE INDEX idx_closures_register ON daily_closures(register_id, closure_date DESC);
CREATE INDEX idx_closures_archived ON daily_closures(archived_at DESC) WHERE archived_at IS NOT NULL;
CREATE INDEX idx_closures_unarchived ON daily_closures(closure_date) WHERE archived_at IS NULL;

-- ============================================================================

-- Table des produits/articles (pour pré-configuration)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identification
    sku VARCHAR(100),
    barcode VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Prix
    price DECIMAL(10,2) NOT NULL,
    vat_rate VARCHAR(20) NOT NULL DEFAULT 'standard',

    -- Catégorie
    category VARCHAR(100),

    -- Stock (optionnel)
    track_inventory BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER,

    -- Statut
    is_active BOOLEAN DEFAULT true,

    -- Métadonnées
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Contraintes
    CONSTRAINT check_price_positive CHECK (price >= 0),
    CONSTRAINT check_vat_rate CHECK (
        vat_rate IN ('standard', 'intermediate', 'reduced', 'super_reduced', 'minimum')
    ),
    CONSTRAINT unique_sku_per_tenant UNIQUE(tenant_id, sku)
);

-- Index sur products
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- ============================================================================

-- Table des exports FEC
CREATE TABLE IF NOT EXISTS fec_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,

    -- Période
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Export
    file_url TEXT NOT NULL,
    file_size BIGINT,
    line_count INTEGER,

    -- Vérification
    debit_total DECIMAL(15,2),
    credit_total DECIMAL(15,2),
    is_balanced BOOLEAN,

    -- Signature
    file_hash VARCHAR(64),
    signature VARCHAR(128),

    -- Métadonnées
    generated_by UUID REFERENCES operators(id),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Contraintes
    CONSTRAINT check_date_range CHECK (end_date >= start_date)
);

-- Index sur fec_exports
CREATE INDEX idx_fec_exports_tenant ON fec_exports(tenant_id, generated_at DESC);
CREATE INDEX idx_fec_exports_dates ON fec_exports(start_date, end_date);

-- ============================================================================

-- Table de configuration système
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Configuration
    config_key VARCHAR(100) NOT NULL,
    config_value JSONB NOT NULL,

    -- Métadonnées
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES operators(id),

    -- Contrainte
    UNIQUE(tenant_id, config_key)
);

-- Index sur system_config
CREATE INDEX idx_config_tenant ON system_config(tenant_id);

-- ============================================================================
-- VUES MATÉRIALISÉES POUR PERFORMANCES
-- ============================================================================

-- Vue des statistiques quotidiennes
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_stats AS
SELECT
    tenant_id,
    register_id,
    DATE(transaction_date) as date,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN transaction_type = 'sale' THEN 1 ELSE 0 END) as sales_count,
    SUM(CASE WHEN transaction_type = 'refund' THEN 1 ELSE 0 END) as refund_count,
    SUM(total_ht) as total_ht,
    SUM(total_vat) as total_vat,
    SUM(total_ttc) as total_ttc
FROM transactions
GROUP BY tenant_id, register_id, DATE(transaction_date);

-- Index sur la vue matérialisée
CREATE UNIQUE INDEX idx_daily_stats_unique ON daily_stats(tenant_id, register_id, date);

-- ============================================================================
-- COMMENTAIRES POUR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE tenants IS 'Table multi-tenant contenant les informations des entreprises utilisatrices';
COMMENT ON TABLE transactions IS 'Table IMMUABLE des transactions conforme NF525 - AUCUNE modification autorisée';
COMMENT ON TABLE audit_logs IS 'Table IMMUABLE de traçabilité complète de toutes les actions';
COMMENT ON TABLE daily_closures IS 'Clôtures journalières obligatoires NF525 avec hash de contrôle';
COMMENT ON COLUMN transactions.current_hash IS 'Hash SHA-256 de sécurisation NF525 - chaîné au hash précédent';
COMMENT ON COLUMN transactions.hash_sequence IS 'Numéro de séquence dans la chaîne de hash par tenant';
COMMENT ON COLUMN daily_closures.closure_hash IS 'Hash de contrôle de la clôture pour vérification d''intégrité';

-- ============================================================================
-- FIN DU SCHÉMA
-- ============================================================================
