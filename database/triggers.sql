-- ============================================================================
-- TRIGGERS D'INALTÉRABILITÉ ET SÉCURISATION NF525
-- ============================================================================
-- Projet: FelxPOS - SaaS de Caisse Enregistreuse
-- Objectif: Garantir l'inaltérabilité des transactions (pilier 1 NF525)
-- ============================================================================

-- ============================================================================
-- FONCTION: Calcul du hash SHA-256 avec chaînage
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_transaction_hash()
RETURNS TRIGGER AS $$
DECLARE
    data_to_hash TEXT;
    prev_hash VARCHAR(64);
    next_sequence BIGINT;
BEGIN
    -- Récupérer le hash de la transaction précédente pour ce tenant
    -- IMPORTANT: Verrouillage FOR UPDATE pour éviter les race conditions
    SELECT current_hash, hash_sequence
    INTO prev_hash, next_sequence
    FROM transactions
    WHERE tenant_id = NEW.tenant_id
    ORDER BY hash_sequence DESC
    LIMIT 1
    FOR UPDATE;

    -- Si aucune transaction précédente, c'est la genèse
    IF prev_hash IS NULL THEN
        prev_hash := 'GENESIS';
        next_sequence := 0;
    END IF;

    -- Incrémenter la séquence
    next_sequence := next_sequence + 1;

    -- Construire la chaîne de données à hasher
    -- Format: prev_hash|uuid|tx_number|date|total_ttc|payment|items
    data_to_hash := CONCAT(
        prev_hash, '|',
        NEW.uuid::TEXT, '|',
        NEW.transaction_number::TEXT, '|',
        EXTRACT(EPOCH FROM NEW.transaction_date)::TEXT, '|',
        NEW.total_ttc::TEXT, '|',
        NEW.payment_method, '|',
        NEW.items::TEXT
    );

    -- Calculer le hash SHA-256
    NEW.previous_hash := prev_hash;
    NEW.current_hash := encode(digest(data_to_hash, 'sha256'), 'hex');
    NEW.hash_sequence := next_sequence;

    -- Logger dans l'audit (sera géré par trigger séparé)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Empêcher modification de transactions
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_transaction_modification()
RETURNS TRIGGER AS $$
BEGIN
    -- Lever une exception pour bloquer toute modification
    RAISE EXCEPTION 'ERREUR NF525: Les transactions sont INALTÉRABLES. Aucune modification autorisée.'
        USING HINT = 'Pour corriger une erreur, créez une transaction de type "correction" ou "refund"',
              ERRCODE = 'integrity_constraint_violation';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Empêcher suppression de transactions
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_transaction_deletion()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'ERREUR NF525: Les transactions sont INALTÉRABLES. Aucune suppression autorisée.'
        USING HINT = 'La conservation des données est obligatoire pendant 6 ans minimum',
              ERRCODE = 'integrity_constraint_violation';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Générer numéro de transaction séquentiel
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number BIGINT;
BEGIN
    -- Obtenir le prochain numéro pour ce tenant
    SELECT COALESCE(MAX(transaction_number), 0) + 1
    INTO next_number
    FROM transactions
    WHERE tenant_id = NEW.tenant_id
    FOR UPDATE;

    NEW.transaction_number := next_number;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Générer numéro de reçu formaté
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
    tenant_prefix VARCHAR(10);
    year_suffix VARCHAR(4);
    receipt_num VARCHAR(50);
BEGIN
    -- Récupérer un préfixe basé sur le SIRET
    SELECT SUBSTRING(siret, 1, 4) INTO tenant_prefix
    FROM tenants
    WHERE id = NEW.tenant_id;

    -- Année courante
    year_suffix := TO_CHAR(NEW.transaction_date, 'YYYY');

    -- Format: PREFIX-YYYY-NNNNNNNNNN
    -- Exemple: 1234-2024-0000001234
    receipt_num := CONCAT(
        tenant_prefix, '-',
        year_suffix, '-',
        LPAD(NEW.transaction_number::TEXT, 10, '0')
    );

    NEW.receipt_number := receipt_num;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Valider cohérence des montants
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_transaction_amounts()
RETURNS TRIGGER AS $$
DECLARE
    calculated_ttc DECIMAL(12,2);
BEGIN
    -- Vérifier que TTC = HT + TVA (avec tolérance de 0.01€ pour arrondis)
    calculated_ttc := NEW.total_ht + NEW.total_vat;

    IF ABS(NEW.total_ttc - calculated_ttc) > 0.01 THEN
        RAISE EXCEPTION 'ERREUR: Incohérence des montants. TTC=% mais HT+TVA=%',
            NEW.total_ttc, calculated_ttc
            USING ERRCODE = 'check_violation';
    END IF;

    -- Vérifier que les montants sont positifs (sauf refunds)
    IF NEW.transaction_type = 'sale' AND (NEW.total_ttc < 0 OR NEW.total_ht < 0) THEN
        RAISE EXCEPTION 'ERREUR: Les montants d''une vente doivent être positifs'
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Logger dans audit_logs
-- ============================================================================

CREATE OR REPLACE FUNCTION log_transaction_to_audit()
RETURNS TRIGGER AS $$
DECLARE
    event_name VARCHAR(100);
BEGIN
    -- Déterminer le type d'événement
    IF TG_OP = 'INSERT' THEN
        event_name := 'TRANSACTION_CREATED';
    ELSIF TG_OP = 'UPDATE' THEN
        event_name := 'TRANSACTION_MODIFIED'; -- Ne devrait jamais arriver
    ELSIF TG_OP = 'DELETE' THEN
        event_name := 'TRANSACTION_DELETED'; -- Ne devrait jamais arriver
    END IF;

    -- Insérer dans audit_logs
    INSERT INTO audit_logs (
        tenant_id,
        event_type,
        event_date,
        resource_type,
        resource_id,
        new_values,
        hash,
        previous_hash
    ) VALUES (
        NEW.tenant_id,
        event_name,
        NEW.created_at,
        'transaction',
        NEW.uuid::TEXT,
        to_jsonb(NEW),
        NEW.current_hash,
        NEW.previous_hash
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Empêcher modification des clôtures
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_closure_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'ERREUR NF525: Les clôtures journalières sont INALTÉRABLES.'
        USING HINT = 'Une clôture ne peut jamais être modifiée ou supprimée',
              ERRCODE = 'integrity_constraint_violation';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Calculer hash de clôture
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_closure_hash()
RETURNS TRIGGER AS $$
DECLARE
    data_to_hash TEXT;
BEGIN
    -- Construire les données de la clôture à hasher
    data_to_hash := CONCAT(
        NEW.tenant_id::TEXT, '|',
        NEW.closure_date::TEXT, '|',
        NEW.total_transactions::TEXT, '|',
        NEW.total_ttc::TEXT, '|',
        COALESCE(NEW.first_transaction_hash, 'NONE'), '|',
        COALESCE(NEW.last_transaction_hash, 'NONE')
    );

    -- Calculer le hash
    NEW.closure_hash := encode(digest(data_to_hash, 'sha256'), 'hex');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Empêcher modification des audit_logs
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'ERREUR: Les logs d''audit sont INALTÉRABLES.'
        USING HINT = 'Les audit logs ne peuvent jamais être modifiés ou supprimés',
              ERRCODE = 'integrity_constraint_violation';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Mise à jour automatique du timestamp updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Vérifier qu'une clôture n'existe pas déjà
-- ============================================================================

CREATE OR REPLACE FUNCTION check_closure_not_exists()
RETURNS TRIGGER AS $$
DECLARE
    existing_closure_id UUID;
BEGIN
    -- Vérifier si une clôture existe déjà pour cette date
    SELECT id INTO existing_closure_id
    FROM daily_closures
    WHERE tenant_id = NEW.tenant_id
      AND register_id = NEW.register_id
      AND closure_date = NEW.closure_date;

    IF existing_closure_id IS NOT NULL THEN
        RAISE EXCEPTION 'ERREUR: Une clôture existe déjà pour le % sur cette caisse.',
            NEW.closure_date
            USING HINT = 'Impossible de créer plusieurs clôtures pour la même journée',
                  ERRCODE = 'unique_violation';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- APPLICATION DES TRIGGERS SUR TRANSACTIONS
-- ============================================================================

-- 1. BEFORE INSERT: Générer numéros et calculer hash
CREATE TRIGGER trg_01_generate_transaction_number
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION generate_transaction_number();

CREATE TRIGGER trg_02_generate_receipt_number
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION generate_receipt_number();

CREATE TRIGGER trg_03_validate_amounts
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION validate_transaction_amounts();

CREATE TRIGGER trg_04_calculate_hash
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_transaction_hash();

-- 2. AFTER INSERT: Logger dans audit
CREATE TRIGGER trg_05_log_to_audit
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION log_transaction_to_audit();

-- 3. BEFORE UPDATE: BLOQUER toute modification
CREATE TRIGGER trg_prevent_update
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_transaction_modification();

-- 4. BEFORE DELETE: BLOQUER toute suppression
CREATE TRIGGER trg_prevent_delete
    BEFORE DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_transaction_deletion();

-- ============================================================================
-- APPLICATION DES TRIGGERS SUR DAILY_CLOSURES
-- ============================================================================

-- BEFORE INSERT: Vérifier unicité et calculer hash
CREATE TRIGGER trg_closure_check_not_exists
    BEFORE INSERT ON daily_closures
    FOR EACH ROW
    EXECUTE FUNCTION check_closure_not_exists();

CREATE TRIGGER trg_closure_calculate_hash
    BEFORE INSERT ON daily_closures
    FOR EACH ROW
    EXECUTE FUNCTION calculate_closure_hash();

-- BEFORE UPDATE/DELETE: BLOQUER toute modification
CREATE TRIGGER trg_closure_prevent_update
    BEFORE UPDATE ON daily_closures
    FOR EACH ROW
    EXECUTE FUNCTION prevent_closure_modification();

CREATE TRIGGER trg_closure_prevent_delete
    BEFORE DELETE ON daily_closures
    FOR EACH ROW
    EXECUTE FUNCTION prevent_closure_modification();

-- ============================================================================
-- APPLICATION DES TRIGGERS SUR AUDIT_LOGS
-- ============================================================================

-- Empêcher toute modification des logs
CREATE TRIGGER trg_audit_prevent_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER trg_audit_prevent_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

-- ============================================================================
-- TRIGGERS DE MISE À JOUR AUTOMATIQUE
-- ============================================================================

-- Mise à jour du timestamp updated_at
CREATE TRIGGER trg_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cash_registers_updated_at
    BEFORE UPDATE ON cash_registers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_operators_updated_at
    BEFORE UPDATE ON operators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FONCTION UTILITAIRE: Vérifier intégrité de la chaîne de hash
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_hash_chain(
    p_tenant_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    is_valid BOOLEAN,
    total_checked BIGINT,
    first_error_id BIGINT,
    first_error_hash VARCHAR(64)
) AS $$
DECLARE
    tx RECORD;
    expected_hash VARCHAR(64);
    prev_hash VARCHAR(64) := 'GENESIS';
    checked_count BIGINT := 0;
    error_found BOOLEAN := FALSE;
    error_id BIGINT;
    error_hash VARCHAR(64);
BEGIN
    -- Parcourir toutes les transactions dans l'ordre
    FOR tx IN
        SELECT *
        FROM transactions
        WHERE tenant_id = p_tenant_id
          AND (p_start_date IS NULL OR transaction_date >= p_start_date)
          AND (p_end_date IS NULL OR transaction_date <= p_end_date)
        ORDER BY hash_sequence ASC
    LOOP
        checked_count := checked_count + 1;

        -- Vérifier que le previous_hash correspond
        IF tx.previous_hash != prev_hash THEN
            error_found := TRUE;
            error_id := tx.id;
            error_hash := tx.current_hash;
            EXIT;
        END IF;

        -- Recalculer le hash
        expected_hash := encode(
            digest(
                CONCAT(
                    prev_hash, '|',
                    tx.uuid::TEXT, '|',
                    tx.transaction_number::TEXT, '|',
                    EXTRACT(EPOCH FROM tx.transaction_date)::TEXT, '|',
                    tx.total_ttc::TEXT, '|',
                    tx.payment_method, '|',
                    tx.items::TEXT
                ),
                'sha256'
            ),
            'hex'
        );

        -- Vérifier que le hash est correct
        IF expected_hash != tx.current_hash THEN
            error_found := TRUE;
            error_id := tx.id;
            error_hash := tx.current_hash;
            EXIT;
        END IF;

        prev_hash := tx.current_hash;
    END LOOP;

    -- Retourner le résultat
    RETURN QUERY SELECT
        NOT error_found,
        checked_count,
        error_id,
        error_hash;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION UTILITAIRE: Statistiques de conformité
-- ============================================================================

CREATE OR REPLACE FUNCTION get_compliance_stats(p_tenant_id UUID)
RETURNS TABLE (
    total_transactions BIGINT,
    total_closures BIGINT,
    oldest_transaction TIMESTAMPTZ,
    newest_transaction TIMESTAMPTZ,
    hash_chain_valid BOOLEAN,
    unarchived_closures BIGINT,
    total_revenue DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM transactions WHERE tenant_id = p_tenant_id),
        (SELECT COUNT(*) FROM daily_closures WHERE tenant_id = p_tenant_id),
        (SELECT MIN(transaction_date) FROM transactions WHERE tenant_id = p_tenant_id),
        (SELECT MAX(transaction_date) FROM transactions WHERE tenant_id = p_tenant_id),
        (SELECT is_valid FROM verify_hash_chain(p_tenant_id)),
        (SELECT COUNT(*) FROM daily_closures WHERE tenant_id = p_tenant_id AND archived_at IS NULL),
        (SELECT COALESCE(SUM(total_ttc), 0) FROM transactions WHERE tenant_id = p_tenant_id AND transaction_type = 'sale');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

COMMENT ON FUNCTION calculate_transaction_hash() IS 'Calcule le hash SHA-256 avec chaînage pour conformité NF525';
COMMENT ON FUNCTION prevent_transaction_modification() IS 'Bloque toute modification de transaction (NF525)';
COMMENT ON FUNCTION verify_hash_chain(UUID, TIMESTAMPTZ, TIMESTAMPTZ) IS 'Vérifie l''intégrité de la chaîne de hash';
COMMENT ON FUNCTION get_compliance_stats(UUID) IS 'Retourne les statistiques de conformité NF525 pour un tenant';

-- ============================================================================
-- FIN DES TRIGGERS
-- ============================================================================
