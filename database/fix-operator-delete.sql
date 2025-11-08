-- ============================================================================
-- MIGRATION: Corriger la contrainte ON DELETE pour operators
-- ============================================================================
-- Problème: ON DELETE SET NULL sur transactions.operator_id provoque un UPDATE
--           qui est bloqué par le trigger d'inaltérabilité NF525
-- Solution: Changer en ON DELETE RESTRICT pour empêcher la suppression
-- ============================================================================

-- Étape 1: Supprimer l'ancienne contrainte
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_operator_id_fkey;

-- Étape 2: Recréer la contrainte avec ON DELETE RESTRICT
ALTER TABLE transactions
ADD CONSTRAINT transactions_operator_id_fkey
FOREIGN KEY (operator_id)
REFERENCES operators(id)
ON DELETE RESTRICT;

-- ============================================================================
-- COMMENTAIRE
-- ============================================================================
COMMENT ON CONSTRAINT transactions_operator_id_fkey ON transactions IS
'Empêche la suppression d''un opérateur qui a des transactions (conformité NF525)';
