-- ============================================================================
-- DONNÉES DE TEST ET DÉMONSTRATION
-- ============================================================================
-- Projet: FelxPOS - SaaS de Caisse Enregistreuse
-- Objectif: Créer des données de test pour développement et démonstration
-- ============================================================================

-- ============================================================================
-- NETTOYAGE (ATTENTION: Uniquement en développement)
-- ============================================================================

-- Désactiver temporairement les triggers pour nettoyage
-- TRUNCATE CASCADE supprime toutes les données liées
-- TRUNCATE TABLE transactions, daily_closures, audit_logs, fec_exports RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE products, operators, cash_registers RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE tenants RESTART IDENTITY CASCADE;

-- ============================================================================
-- TENANTS DE DÉMONSTRATION
-- ============================================================================

-- Tenant 1: Restaurant "Le Petit Bistrot"
INSERT INTO tenants (
    id,
    siret,
    company_name,
    legal_form,
    naf_code,
    vat_number,
    address_line1,
    postal_code,
    city,
    country,
    email,
    phone,
    nf525_compliant,
    certification_number,
    certification_date,
    is_active,
    subscription_plan
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '12345678901234',
    'Le Petit Bistrot SARL',
    'SARL',
    '5610A',
    'FR12345678901',
    '15 Rue de la Paix',
    '75001',
    'Paris',
    'FR',
    'contact@petitbistrot.fr',
    '+33142857890',
    true,
    'NF525-2024-001234',
    '2024-01-15',
    true,
    'professional'
) ON CONFLICT (id) DO NOTHING;

-- Tenant 2: Boulangerie "Pain d'Or"
INSERT INTO tenants (
    id,
    siret,
    company_name,
    legal_form,
    naf_code,
    vat_number,
    address_line1,
    postal_code,
    city,
    country,
    email,
    phone,
    nf525_compliant,
    is_active,
    subscription_plan
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '98765432109876',
    'Boulangerie Pain d''Or',
    'EI',
    '1071C',
    'FR98765432109',
    '42 Avenue du Commerce',
    '69002',
    'Lyon',
    'FR',
    'contact@paindor.fr',
    '+33478123456',
    true,
    true,
    'starter'
) ON CONFLICT (id) DO NOTHING;

-- Tenant 3: Boutique "Mode & Style"
INSERT INTO tenants (
    id,
    siret,
    company_name,
    legal_form,
    naf_code,
    vat_number,
    address_line1,
    postal_code,
    city,
    country,
    email,
    phone,
    nf525_compliant,
    is_active,
    subscription_plan
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '11122233344455',
    'Mode & Style SAS',
    'SAS',
    '4771Z',
    'FR11122233344',
    '8 Boulevard Haussmann',
    '33000',
    'Bordeaux',
    'FR',
    'info@modestyle.fr',
    '+33556789012',
    false,
    true,
    'enterprise'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CAISSES ENREGISTREUSES
-- ============================================================================

-- Caisse principale du Petit Bistrot
INSERT INTO cash_registers (
    id,
    tenant_id,
    register_code,
    serial_number,
    name,
    location,
    activation_date,
    is_active,
    auto_closure_enabled,
    auto_closure_time,
    receipt_header,
    receipt_footer
) VALUES (
    '0c111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'MAIN',
    'SN-BISTROT-001',
    'Caisse Principale',
    'Comptoir',
    '2024-01-01 09:00:00+00',
    true,
    true,
    '23:59:00',
    E'LE PETIT BISTROT\n15 Rue de la Paix, 75001 Paris\nTél: 01 42 85 78 90',
    E'Merci de votre visite!\nÀ bientôt!'
) ON CONFLICT (id) DO NOTHING;

-- Caisse terrasse du Petit Bistrot
INSERT INTO cash_registers (
    id,
    tenant_id,
    register_code,
    serial_number,
    name,
    location,
    activation_date,
    is_active
) VALUES (
    '0c111112-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'TERRACE',
    'SN-BISTROT-002',
    'Caisse Terrasse',
    'Terrasse',
    '2024-03-15 09:00:00+00',
    true
) ON CONFLICT (id) DO NOTHING;

-- Caisse de la boulangerie
INSERT INTO cash_registers (
    id,
    tenant_id,
    register_code,
    serial_number,
    name,
    location,
    activation_date,
    is_active,
    receipt_header
) VALUES (
    '0c222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'MAIN',
    'SN-PAIN-001',
    'Caisse Unique',
    'Boutique',
    '2024-01-01 06:00:00+00',
    true,
    E'BOULANGERIE PAIN D''OR\n42 Avenue du Commerce\n69002 Lyon'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- OPÉRATEURS
-- ============================================================================

-- Manager du bistrot
INSERT INTO operators (
    id,
    tenant_id,
    email,
    first_name,
    last_name,
    role,
    is_active
) VALUES (
    '0a111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'manager@petitbistrot.fr',
    'Pierre',
    'Martin',
    'manager',
    true
) ON CONFLICT (id) DO NOTHING;

-- Serveur du bistrot
INSERT INTO operators (
    id,
    tenant_id,
    email,
    first_name,
    last_name,
    role,
    is_active
) VALUES (
    '0a111112-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'sophie@petitbistrot.fr',
    'Sophie',
    'Dubois',
    'cashier',
    true
) ON CONFLICT (id) DO NOTHING;

-- Propriétaire de la boulangerie
INSERT INTO operators (
    id,
    tenant_id,
    email,
    first_name,
    last_name,
    role,
    is_active
) VALUES (
    '0a222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'jean@paindor.fr',
    'Jean',
    'Dupont',
    'admin',
    true
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PRODUITS (CATALOGUE)
-- ============================================================================

-- Produits du bistrot
INSERT INTO products (tenant_id, sku, name, price, vat_rate, category, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'PLAT-001', 'Steak Frites', 18.50, 'intermediate', 'Plats', true),
    ('11111111-1111-1111-1111-111111111111', 'PLAT-002', 'Salade César', 12.00, 'intermediate', 'Plats', true),
    ('11111111-1111-1111-1111-111111111111', 'PLAT-003', 'Burger Maison', 15.50, 'intermediate', 'Plats', true),
    ('11111111-1111-1111-1111-111111111111', 'BOIS-001', 'Coca-Cola 33cl', 3.50, 'standard', 'Boissons', true),
    ('11111111-1111-1111-1111-111111111111', 'BOIS-002', 'Eau Minérale 50cl', 2.50, 'reduced', 'Boissons', true),
    ('11111111-1111-1111-1111-111111111111', 'BOIS-003', 'Vin Rouge (verre)', 5.00, 'standard', 'Boissons', true),
    ('11111111-1111-1111-1111-111111111111', 'DESS-001', 'Tarte Tatin', 6.50, 'intermediate', 'Desserts', true),
    ('11111111-1111-1111-1111-111111111111', 'DESS-002', 'Café Gourmand', 8.00, 'intermediate', 'Desserts', true)
ON CONFLICT (tenant_id, sku) DO NOTHING;

-- Produits de la boulangerie
INSERT INTO products (tenant_id, sku, barcode, name, price, vat_rate, category, is_active, track_inventory, stock_quantity) VALUES
    ('22222222-2222-2222-2222-222222222222', 'PAIN-001', '3012345678901', 'Baguette Tradition', 1.20, 'reduced', 'Pains', true, true, 150),
    ('22222222-2222-2222-2222-222222222222', 'PAIN-002', '3012345678902', 'Pain Complet', 1.50, 'reduced', 'Pains', true, true, 80),
    ('22222222-2222-2222-2222-222222222222', 'VIEN-001', '3012345678903', 'Croissant', 1.30, 'reduced', 'Viennoiseries', true, true, 200),
    ('22222222-2222-2222-2222-222222222222', 'VIEN-002', '3012345678904', 'Pain au Chocolat', 1.40, 'reduced', 'Viennoiseries', true, true, 180),
    ('22222222-2222-2222-2222-222222222222', 'VIEN-003', '3012345678905', 'Chausson aux Pommes', 1.80, 'reduced', 'Viennoiseries', true, true, 50),
    ('22222222-2222-2222-2222-222222222222', 'PATI-001', '3012345678906', 'Éclair au Café', 3.50, 'reduced', 'Pâtisseries', true, true, 30),
    ('22222222-2222-2222-2222-222222222222', 'PATI-002', '3012345678907', 'Tarte aux Fraises', 4.20, 'reduced', 'Pâtisseries', true, true, 25)
ON CONFLICT (tenant_id, sku) DO NOTHING;

-- ============================================================================
-- TRANSACTIONS DE DÉMONSTRATION
-- ============================================================================
-- Note: Les triggers calculeront automatiquement les hash

-- Transaction 1: Petit déjeuner à la boulangerie
INSERT INTO transactions (
    tenant_id,
    register_id,
    operator_id,
    transaction_date,
    transaction_type,
    status,
    total_ht,
    total_vat,
    total_ttc,
    vat_details,
    items,
    payment_method,
    customer_name
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '0c222222-2222-2222-2222-222222222222',
    '0a222222-2222-2222-2222-222222222222',
    '2024-11-08 07:15:23+00',
    'sale',
    'completed',
    3.55,
    0.20,
    3.75,
    '{"5.5": {"ht": 3.55, "vat": 0.20, "ttc": 3.75}}'::jsonb,
    '[
        {"sku": "PAIN-001", "name": "Baguette Tradition", "quantity": 1, "price": 1.20, "vatRate": "reduced"},
        {"sku": "VIEN-001", "name": "Croissant", "quantity": 2, "price": 1.30, "vatRate": "reduced"}
    ]'::jsonb,
    'cash',
    'Client régulier'
);

-- Transaction 2: Commande pâtisseries
INSERT INTO transactions (
    tenant_id,
    register_id,
    operator_id,
    transaction_date,
    transaction_type,
    status,
    total_ht,
    total_vat,
    total_ttc,
    vat_details,
    items,
    payment_method,
    customer_email
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '0c222222-2222-2222-2222-222222222222',
    '0a222222-2222-2222-2222-222222222222',
    '2024-11-08 09:30:12+00',
    'sale',
    'completed',
    11.37,
    0.63,
    12.00,
    '{"5.5": {"ht": 11.37, "vat": 0.63, "ttc": 12.00}}'::jsonb,
    '[
        {"sku": "PATI-001", "name": "Éclair au Café", "quantity": 2, "price": 3.50, "vatRate": "reduced"},
        {"sku": "PATI-002", "name": "Tarte aux Fraises", "quantity": 1, "price": 4.20, "vatRate": "reduced"},
        {"sku": "PAIN-001", "name": "Baguette Tradition", "quantity": 1, "price": 1.20, "vatRate": "reduced"}
    ]'::jsonb,
    'card',
    'marie.dupuis@email.fr'
);

-- Transaction 3: Déjeuner au bistrot
INSERT INTO transactions (
    tenant_id,
    register_id,
    operator_id,
    transaction_date,
    transaction_type,
    status,
    total_ht,
    total_vat,
    total_ttc,
    vat_details,
    items,
    payment_method
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '0c111111-1111-1111-1111-111111111111',
    '0a111112-1111-1111-1111-111111111111',
    '2024-11-08 12:45:00+00',
    'sale',
    'completed',
    32.45,
    3.55,
    36.00,
    '{"10": {"ht": 28.18, "vat": 2.82, "ttc": 31.00}, "5.5": {"ht": 2.37, "vat": 0.13, "ttc": 2.50}, "20": {"ht": 2.92, "vat": 0.58, "ttc": 3.50}}'::jsonb,
    '[
        {"sku": "PLAT-001", "name": "Steak Frites", "quantity": 1, "price": 18.50, "vatRate": "intermediate"},
        {"sku": "PLAT-002", "name": "Salade César", "quantity": 1, "price": 12.00, "vatRate": "intermediate"},
        {"sku": "BOIS-001", "name": "Coca-Cola 33cl", "quantity": 1, "price": 3.50, "vatRate": "standard"},
        {"sku": "BOIS-002", "name": "Eau Minérale 50cl", "quantity": 1, "price": 2.50, "vatRate": "reduced"}
    ]'::jsonb,
    'card'
);

-- Transaction 4: Table de 4 au bistrot
INSERT INTO transactions (
    tenant_id,
    register_id,
    operator_id,
    transaction_date,
    transaction_type,
    status,
    total_ht,
    total_vat,
    total_ttc,
    vat_details,
    items,
    payment_method
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '0c111111-1111-1111-1111-111111111111',
    '0a111112-1111-1111-1111-111111111111',
    '2024-11-08 13:20:00+00',
    'sale',
    'completed',
    87.27,
    9.73,
    97.00,
    '{"10": {"ht": 63.64, "vat": 6.36, "ttc": 70.00}, "20": {"ht": 18.33, "vat": 3.67, "ttc": 22.00}, "5.5": {"ht": 4.74, "vat": 0.26, "ttc": 5.00}}'::jsonb,
    '[
        {"sku": "PLAT-003", "name": "Burger Maison", "quantity": 3, "price": 15.50, "vatRate": "intermediate"},
        {"sku": "PLAT-002", "name": "Salade César", "quantity": 1, "price": 12.00, "vatRate": "intermediate"},
        {"sku": "BOIS-001", "name": "Coca-Cola 33cl", "quantity": 3, "price": 3.50, "vatRate": "standard"},
        {"sku": "BOIS-003", "name": "Vin Rouge (verre)", "quantity": 2, "price": 5.00, "vatRate": "standard"},
        {"sku": "BOIS-002", "name": "Eau Minérale 50cl", "quantity": 2, "price": 2.50, "vatRate": "reduced"},
        {"sku": "DESS-001", "name": "Tarte Tatin", "quantity": 2, "price": 6.50, "vatRate": "intermediate"}
    ]'::jsonb,
    'card'
);

-- ============================================================================
-- CONFIGURATION SYSTÈME
-- ============================================================================

-- Configuration TVA France
INSERT INTO system_config (tenant_id, config_key, config_value) VALUES
    ('11111111-1111-1111-1111-111111111111', 'vat_rates', '{
        "standard": 20.0,
        "intermediate": 10.0,
        "reduced": 5.5,
        "super_reduced": 5.5,
        "minimum": 2.1
    }'::jsonb),
    ('22222222-2222-2222-2222-222222222222', 'vat_rates', '{
        "standard": 20.0,
        "intermediate": 10.0,
        "reduced": 5.5,
        "super_reduced": 5.5,
        "minimum": 2.1
    }'::jsonb)
ON CONFLICT (tenant_id, config_key) DO NOTHING;

-- Configuration reçus
INSERT INTO system_config (tenant_id, config_key, config_value) VALUES
    ('11111111-1111-1111-1111-111111111111', 'receipt_config', '{
        "show_qr_code": true,
        "show_hash": true,
        "footer_message": "Merci de votre visite!"
    }'::jsonb),
    ('22222222-2222-2222-2222-222222222222', 'receipt_config', '{
        "show_qr_code": true,
        "show_hash": true,
        "footer_message": "À bientôt!"
    }'::jsonb)
ON CONFLICT (tenant_id, config_key) DO NOTHING;

-- ============================================================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ============================================================================

-- Afficher un résumé
DO $$
DECLARE
    tenant_count INTEGER;
    register_count INTEGER;
    operator_count INTEGER;
    transaction_count INTEGER;
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM tenants;
    SELECT COUNT(*) INTO register_count FROM cash_registers;
    SELECT COUNT(*) INTO operator_count FROM operators;
    SELECT COUNT(*) INTO transaction_count FROM transactions;
    SELECT COUNT(*) INTO product_count FROM products;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'DONNÉES DE SEED INSÉRÉES AVEC SUCCÈS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tenants: %', tenant_count;
    RAISE NOTICE 'Caisses: %', register_count;
    RAISE NOTICE 'Opérateurs: %', operator_count;
    RAISE NOTICE 'Produits: %', product_count;
    RAISE NOTICE 'Transactions: %', transaction_count;
    RAISE NOTICE '========================================';
END $$;

-- Afficher les statistiques de conformité pour chaque tenant
SELECT
    t.company_name,
    s.*
FROM tenants t
CROSS JOIN LATERAL get_compliance_stats(t.id) s
ORDER BY t.company_name;

-- ============================================================================
-- FIN DU SEED
-- ============================================================================
