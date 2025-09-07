import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Project, Supplier, Material, Finish, MaterialVariant, PriceEntry, ProjectParams, BOMItem } from '../types';
import { supabase } from '../lib/supabaseClient';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AppState {
  currentProject: Project | null;
  projects: Project[];
  suppliers: Supplier[];
  materials: Material[];
  finishes: Finish[];
  materialVariants: MaterialVariant[];
  priceEntries: PriceEntry[];
  activeTab: string;
  loading: boolean;
  saveStatus: SaveStatus;
}

type AppAction =
  | { type: 'SET_INITIAL_STATE'; payload: Partial<AppState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatus }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT_DETAILS'; payload: Partial<Pick<Project, 'name' | 'state'>> }
  | { type: 'UPDATE_PROJECT_INPUTS'; payload: Partial<Project['inputs']> }
  | { type: 'UPDATE_BOM'; payload: BOMItem[] }
  | { type: 'UPDATE_BOM_ITEM'; payload: BOMItem }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'ADD_MATERIAL'; payload: Material }
  | { type: 'ADD_FINISH'; payload: Finish }
  | { type: 'ADD_MATERIAL_VARIANT'; payload: MaterialVariant }
  | { type: 'ADD_PRICE_ENTRY'; payload: PriceEntry }
  | { type: 'UPDATE_PRICE_ENTRY'; payload: PriceEntry }
  | { type: 'DELETE_PRICE_ENTRY'; payload: string }
  | { type: 'DELETE_PRICES_BY_SUPPLIER'; payload: string };

const defaultParams: ProjectParams = {
  FL: 15, FV: 3, FH: 165, FEg: 5, glassThickness: 8, boxCapacity: 7,
  cutSup: { width: 40, height: 33 }, cutU: { width: 100, height: 40 },
  cutInf: { width: 18, height: 20 }, bocaOffset: 15, drainStep: 500,
  aparadorSize: 250, lockType: 'contra',
};

const createNewProject = (id: string, name: string): Project => ({
  id, name, state: 'SP',
  inputs: {
    geometry: 'Reta', dimensions: { A: 3000, H: 2400 },
    targetLeafWidth: 500, openings: 1, params: defaultParams,
    finish: 'NF', machiningChecklist: {},
  },
  bom: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
});

const initialState: AppState = {
  currentProject: null,
  projects: [],
  suppliers: [], materials: [], finishes: [], materialVariants: [], priceEntries: [],
  activeTab: 'entradas', loading: true, saveStatus: 'idle',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INITIAL_STATE':
      return { ...state, ...action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload], currentProject: action.payload };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'UPDATE_PROJECT_DETAILS':
      if (!state.currentProject) return state;
      const updatedProjectDetails = { ...state.currentProject, ...action.payload, updatedAt: new Date().toISOString() };
      return { ...state, currentProject: updatedProjectDetails, projects: state.projects.map(p => p.id === updatedProjectDetails.id ? updatedProjectDetails : p) };
    case 'UPDATE_PROJECT_INPUTS':
      if (!state.currentProject) return state;
      const updatedProject = { ...state.currentProject, inputs: { ...state.currentProject.inputs, ...action.payload }, updatedAt: new Date().toISOString() };
      return { ...state, currentProject: updatedProject, projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p) };
    case 'UPDATE_BOM':
      if (!state.currentProject) return state;
      const projectWithNewBom = { ...state.currentProject, bom: action.payload, updatedAt: new Date().toISOString() };
      return { ...state, currentProject: projectWithNewBom, projects: state.projects.map(p => p.id === projectWithNewBom.id ? projectWithNewBom : p) };
    case 'UPDATE_BOM_ITEM':
      if (!state.currentProject || !state.currentProject.bom) return state;
      const updatedBom = state.currentProject.bom.map(item => item.id === action.payload.id ? action.payload : item);
      const projectWithUpdatedBomItem = { ...state.currentProject, bom: updatedBom, updatedAt: new Date().toISOString() };
      return { ...state, currentProject: projectWithUpdatedBomItem, projects: state.projects.map(p => p.id === projectWithUpdatedBomItem.id ? projectWithUpdatedBomItem : p) };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'UPDATE_SUPPLIER':
      return { ...state, suppliers: state.suppliers.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SUPPLIER':
      return { ...state, suppliers: state.suppliers.filter(s => s.id !== action.payload) };
    case 'ADD_MATERIAL':
      return { ...state, materials: [...state.materials, action.payload] };
    case 'ADD_FINISH':
      return { ...state, finishes: [...state.finishes, action.payload] };
    case 'ADD_MATERIAL_VARIANT':
      return { ...state, materialVariants: [...state.materialVariants, action.payload] };
    case 'ADD_PRICE_ENTRY':
      return { ...state, priceEntries: [...state.priceEntries, action.payload] };
    case 'UPDATE_PRICE_ENTRY':
      return { ...state, priceEntries: state.priceEntries.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PRICE_ENTRY':
      return { ...state, priceEntries: state.priceEntries.filter(p => p.id !== action.payload) };
    case 'DELETE_PRICES_BY_SUPPLIER':
      return { ...state, priceEntries: state.priceEntries.filter(p => p.supplierId !== action.payload) };
    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction>; } | null>(null);

// Mappers from snake_case (DB) to camelCase (TS)
const mapSupplier = (s: any): Supplier => ({ id: s.id, name: s.name, cnpj: s.cnpj, states: s.states, contact: s.contact, defaultFreightPerKm: s.default_freight_per_km, defaultLeadTime: s.default_lead_time, notes: s.notes, active: s.active, preferred: s.preferred, createdAt: s.created_at });
const mapMaterial = (m: any): Material => ({ id: m.id, name: m.name, category: m.category, baseUnit: m.base_unit, defaultWaste: m.default_waste, notes: m.notes, createdAt: m.created_at });
const mapFinish = (f: any): Finish => ({ id: f.id, code: f.code, name: f.name, createdAt: f.created_at });
const mapMaterialVariant = (v: any): MaterialVariant => ({ id: v.id, materialId: v.material_id, finishId: v.finish_id, specifications: v.specifications, displayName: v.display_name, createdAt: v.created_at });
const mapPriceEntry = (p: any): PriceEntry => ({ id: p.id, supplierId: p.supplier_id, materialVariantId: p.material_variant_id, unitCost: p.unit_cost, saleUnit: p.sale_unit, moq: p.moq, leadTime: p.lead_time, validFrom: p.valid_from, validTo: p.valid_to, states: p.states, icmsPercent: p.icms_percent, freightIncluded: p.freight_included, active: p.active, preferred: p.preferred, createdAt: p.created_at });
const mapProject = (p: any): Project => ({ id: p.id, name: p.name, state: p.state, inputs: p.inputs, results: p.results, bom: p.bom, createdAt: p.created_at, updatedAt: p.updated_at });


export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const [
          { data: suppliers, error: suppliersError },
          { data: materials, error: materialsError },
          { data: finishes, error: finishesError },
          { data: materialVariants, error: variantsError },
          { data: priceEntries, error: pricesError },
          { data: projects, error: projectsError },
        ] = await Promise.all([
          supabase.from('suppliers').select('*').order('name'),
          supabase.from('materials').select('*').order('name'),
          supabase.from('finishes').select('*').order('name'),
          supabase.from('material_variants').select('*'),
          supabase.from('price_entries').select('*'),
          supabase.from('projects').select('*').order('updated_at', { ascending: false }),
        ]);

        if (suppliersError || materialsError || finishesError || variantsError || pricesError || projectsError) {
          console.error({ suppliersError, materialsError, finishesError, variantsError, pricesError, projectsError });
          throw new Error('Falha ao carregar dados do Supabase');
        }

        const mappedSuppliers = (suppliers || []).map(mapSupplier);
        const mappedMaterials = (materials || []).map(mapMaterial);
        const mappedFinishes = (finishes || []).map(mapFinish);
        const existingVariantsData = (materialVariants || []).map(mapMaterialVariant);
        const mappedPriceEntries = (priceEntries || []).map(mapPriceEntry);
        const mappedProjects = (projects || []).map(mapProject);

        // Auto-generate missing material variants
        const variantsToCreate: any[] = [];
        const existingVariantKeys = new Set(existingVariantsData.map(v => `${v.materialId}-${v.finishId || 'null'}`));

        for (const material of mappedMaterials) {
          if (material.category === 'perfil') {
            for (const finish of mappedFinishes) {
              const key = `${material.id}-${finish.id}`;
              if (!existingVariantKeys.has(key)) {
                variantsToCreate.push({ material_id: material.id, finish_id: finish.id, display_name: `${material.name} - ${finish.code}` });
              }
            }
          } else {
            const key = `${material.id}-null`;
            if (!existingVariantKeys.has(key)) {
              variantsToCreate.push({ material_id: material.id, display_name: material.name });
            }
          }
        }

        if (variantsToCreate.length > 0) {
          const { error: insertError } = await supabase.from('material_variants').insert(variantsToCreate).select();
          if (insertError) {
            console.error("Erro ao criar variantes de material:", insertError);
          }
        }
        
        // Re-fetch all variants to ensure a single source of truth and avoid duplicates
        const { data: allVariantsData, error: allVariantsError } = await supabase.from('material_variants').select('*').order('display_name');

        if (allVariantsError) {
          console.error("Falha ao recarregar variantes de material:", allVariantsError);
          throw new Error('Falha ao carregar variantes de material');
        }

        const allMaterialVariants = (allVariantsData || []).map(mapMaterialVariant);

        let currentProject = null;
        let projectList: Project[] = mappedProjects;
        if (projectList.length > 0) {
          currentProject = projectList[0];
        } else {
          const newProject = createNewProject(uuidv4(), 'Nova Obra');
          projectList.push(newProject);
          currentProject = newProject;
        }

        dispatch({
          type: 'SET_INITIAL_STATE',
          payload: {
            suppliers: mappedSuppliers,
            materials: mappedMaterials,
            finishes: mappedFinishes,
            materialVariants: allMaterialVariants,
            priceEntries: mappedPriceEntries,
            projects: projectList,
            currentProject: currentProject,
          },
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isInitialMount.current || state.loading || !state.currentProject) {
      if (!state.loading) isInitialMount.current = false;
      return;
    }

    dispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' });

    const handler = setTimeout(async () => {
      if (!state.currentProject) return;
      
      const projectToSave = { ...state.currentProject, updated_at: new Date().toISOString() };
      const payload = {
        id: projectToSave.id, name: projectToSave.name, state: projectToSave.state,
        inputs: projectToSave.inputs || {}, bom: projectToSave.bom || [],
        created_at: projectToSave.createdAt, updated_at: projectToSave.updatedAt,
      };
      const { error } = await supabase.from('projects').upsert(payload);

      if (error) {
        console.error('Erro no auto-save:', error);
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });
      } else {
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'saved' });
        setTimeout(() => dispatch({ type: 'SET_SAVE_STATUS', payload: 'idle' }), 2000);
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [state.currentProject, state.loading]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {state.loading ? (
        <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
          Carregando e sincronizando dados...
        </div>
      ) : children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}

export { createNewProject };
