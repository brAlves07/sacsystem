/*
          # [Operation Name]
          Initial Schema Setup

          ## Query Description: [This script sets up the initial database schema for the Sacada Calculator application. It creates tables for projects, suppliers, materials, finishes, material variants, and price entries. It also inserts default data for materials and finishes. This is a foundational script and is safe to run on a new project.]

          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["High"]
          - Requires-Backup: [false]
          - Reversible: [false]

          ## Structure Details:
          - Creates tables: projects, suppliers, materials, finishes, material_variants, price_entries
          - Inserts initial data into: materials, finishes

          ## Security Implications:
          - RLS Status: [Enabled]
          - Policy Changes: [Yes]
          - Auth Requirements: [None, allows all for now]

          ## Performance Impact:
          - Indexes: [Primary Keys]
          - Triggers: [None]
          - Estimated Impact: [Low, initial setup]
          */

-- Tabela de Fornecedores
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    states TEXT[],
    contact JSONB,
    default_freight_per_km NUMERIC,
    default_lead_time INTEGER NOT NULL,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    preferred BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Materiais
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('perfil', 'vidro', 'acessorio', 'escova')),
    base_unit TEXT NOT NULL,
    default_waste NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Acabamentos
CREATE TABLE finishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Variantes de Material
CREATE TABLE material_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    finish_id UUID REFERENCES finishes(id) ON DELETE CASCADE,
    specifications TEXT,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(material_id, finish_id, specifications)
);

-- Tabela de Preços
CREATE TABLE price_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    material_variant_id UUID NOT NULL,
    unit_cost NUMERIC NOT NULL,
    sale_unit TEXT NOT NULL,
    moq NUMERIC,
    lead_time INTEGER NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE,
    states TEXT[],
    icms_percent NUMERIC,
    freight_included BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    preferred BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Projetos
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    inputs JSONB NOT NULL,
    results JSONB,
    bom JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (Permitir tudo para todos por enquanto, pois não há autenticação)
CREATE POLICY "Allow all access on suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on materials" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on finishes" ON finishes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on material_variants" ON material_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on price_entries" ON price_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access on projects" ON projects FOR ALL USING (true) WITH CHECK (true);

-- Inserir dados iniciais de acabamentos
INSERT INTO finishes (code, name) VALUES
('NF', 'Natural'),
('PT', 'Preto'),
('BZ', 'Bronze'),
('CH', 'Champagne'),
('BC', 'Branco');

-- Inserir dados iniciais de materiais
INSERT INTO materials (name, category, base_unit, default_waste) VALUES
('Perfil U de regulagem (A)', 'perfil', 'm', 3),
('Trilho superior (D)', 'perfil', 'm', 3),
('Trilho inferior (C)', 'perfil', 'm', 3),
('Leito do vidro (E)', 'perfil', 'm', 3),
('U 20x14 (F)', 'perfil', 'm', 3),
('L 1"x1" (G)', 'perfil', 'm', 3),
('Escova 5x7', 'escova', 'm', 5),
('Escova 5x5', 'escova', 'm', 5),
('Kit roldana painel', 'acessorio', 'kit', 0),
('Kit pivô', 'acessorio', 'kit', 0),
('Estacionamento', 'acessorio', 'peça', 0),
('Vidro temperado', 'vidro', 'm²', 5),
('Conjunto saída sup/inf', 'acessorio', 'conj', 0),
('Tampas de leito', 'acessorio', 'peça', 0),
('Aparador', 'acessorio', 'peça', 0),
('Fechadura Contra', 'acessorio', 'peça', 0),
('Fechadura Vidro-Vidro', 'acessorio', 'peça', 0);
