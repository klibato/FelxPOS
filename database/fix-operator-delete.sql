-- ============================================================================
-- MIGRATION: Corriger les contraintes ON DELETE pour operators
-- ============================================================================
-- Problème: ON DELETE SET NULL sur plusieurs tables provoque des UPDATE
--           qui sont bloqués par les triggers d'inaltérabilité NF525
-- Solution: Changer en ON DELETE RESTRICT pour empêcher la suppression
-- ============================================================================

-- Étape 1: Transactions
-- Supprimer l'ancienne contrainte
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_operator_id_fkey;

-- Recréer avec ON DELETE RESTRICT
ALTER TABLE transactions
ADD CONSTRAINT transactions_operator_id_fkey
FOREIGN KEY (operator_id)
REFERENCES operators(id)
ON DELETE RESTRICT;

-- Étape 2: Audit Logs
-- Supprimer l'ancienne contrainte
ALTER TABLE audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- Recréer avec ON DELETE RESTRICT
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES operators(id)
ON DELETE RESTRICT;

-- Étape 3: Daily Closures
-- Supprimer l'ancienne contrainte
ALTER TABLE daily_closures
DROP CONSTRAINT IF EXISTS daily_closures_operator_id_fkey;

-- Recréer avec ON DELETE RESTRICT
ALTER TABLE daily_closures
ADD CONSTRAINT daily_closures_operator_id_fkey
FOREIGN KEY (operator_id)
REFERENCES operators(id)
ON DELETE RESTRICT;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================
COMMENT ON CONSTRAINT transactions_operator_id_fkey ON transactions IS
'Empêche la suppression d''un opérateur qui a des transactions (conformité NF525)';

COMMENT ON CONSTRAINT audit_logs_user_id_fkey ON audit_logs IS
'Empêche la suppression d''un opérateur qui a des logs d''audit (conformité NF525)';

COMMENT ON CONSTRAINT daily_closures_operator_id_fkey ON daily_closures IS
'Empêche la suppression d''un opérateur qui a effectué des clôtures (conformité NF525)';

