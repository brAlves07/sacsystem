export type GeometryType = 'Reta' | 'L' | 'U';

export interface ProjectParams {
  FL: number; // folga lateral parede↔vidro
  FV: number; // folga entre vidros
  FH: number; // folga de altura
  FEg: number; // folga entre graus (passante)
  glassThickness: number; // espessura do vidro
  boxCapacity: number; // capacidade de caixa de saída
  cutSup: { width: number; height: number }; // cortes superiores
  cutU: { width: number; height: number }; // corte U de regulagem
  cutInf: { width: number; height: number }; // corte inferior
  bocaOffset: number; // centro da boca offset
  drainStep: number; // passo de drenos
  aparadorSize: 250 | 350 | 450 | 550;
  lockType: 'contra' | 'vidro-vidro';
}

export interface ProjectInputs {
  geometry: GeometryType;
  dimensions: {
    A: number; // frente A
    B?: number; // frente B (L/U)
    C?: number; // frente C (U)
    H: number; // altura
  };
  targetLeafWidth: number; // alvo de largura da folha
  openings: number; // número de aberturas
  params: ProjectParams;
  finish: string; // acabamento/cor
  machiningChecklist: Record<string, boolean>;
}

export interface CalculationResult {
  front: string;
  suggestedPanels: number;
  LRP: number; // largura real por painel
  HRP: number; // altura real por painel
  area: number; // área em m²
  boxes: number; // caixas de saída necessárias
  warnings: string[];
}

export interface BOMItem {
  id: string;
  name: string;
  category: 'perfil' | 'vidro' | 'acessorio' | 'escova';
  quantity: number;
  unit: string;
  materialVariantId?: string;
  supplierId?: string;
  unitCost?: number;
  freight?: number;
  taxes?: number;
  totalCost?: number;
  markup?: number;
  price?: number;
  fixed?: boolean; // fixar fornecedor
}

export interface Material {
  id: string;
  name: string;
  category: 'perfil' | 'vidro' | 'acessorio' | 'escova';
  baseUnit: string;
  defaultWaste: number; // perda padrão %
  notes?: string;
  createdAt: string;
}

export interface Finish {
  id: string;
  code: string;
  name: string;
  createdAt: string;
}

export interface MaterialVariant {
  id: string;
  materialId: string;
  finishId?: string;
  specifications?: string;
  displayName: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  states: string[];
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  defaultFreightPerKm?: number;
  defaultLeadTime: number;
  notes?: string;
  active: boolean;
  preferred: boolean;
  createdAt: string;
}

export interface PriceEntry {
  id: string;
  supplierId: string;
  materialVariantId: string;
  unitCost: number;
  saleUnit: string; // m, barra_6m, peça, kit
  moq?: number; // quantidade mínima
  leadTime: number;
  validFrom: string;
  validTo?: string;
  states: string[];
  icmsPercent?: number;
  freightIncluded: boolean;
  active: boolean;
  preferred: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  state: string;
  inputs: ProjectInputs;
  results?: CalculationResult[];
  bom: BOMItem[];
  createdAt: string;
  updatedAt: string;
}
