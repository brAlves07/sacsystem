import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PriceEntry } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

interface PriceFormProps {
  onClose: () => void;
  priceToEdit?: PriceEntry | null;
  initialMaterialVariantId?: string;
}

export default function PriceForm({ onClose, priceToEdit, initialMaterialVariantId }: PriceFormProps) {
  const { state, dispatch } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [selectedFinishId, setSelectedFinishId] = useState<string>('');

  const [formData, setFormData] = useState({
    supplierId: priceToEdit?.supplierId || (state.suppliers.length > 0 ? state.suppliers[0].id : ''),
    unitCost: priceToEdit?.unitCost ?? '',
    saleUnit: priceToEdit?.saleUnit || 'm',
    validFrom: priceToEdit?.validFrom ? new Date(priceToEdit.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validTo: priceToEdit?.validTo ? new Date(priceToEdit.validTo).toISOString().split('T')[0] : '',
    leadTime: priceToEdit?.leadTime || 7,
    active: priceToEdit?.active ?? true,
    freightIncluded: priceToEdit?.freightIncluded ?? false,
    preferred: priceToEdit?.preferred ?? false,
  });

  const selectedMaterial = useMemo(() => 
    state.materials.find(m => m.id === selectedMaterialId), 
    [selectedMaterialId, state.materials]
  );
  
  useEffect(() => {
    const variantId = priceToEdit?.materialVariantId || initialMaterialVariantId;
    if (variantId) {
      const variant = state.materialVariants.find(v => v.id === variantId);
      if (variant) {
        setSelectedMaterialId(variant.materialId);
        if (variant.finishId) {
          setSelectedFinishId(variant.finishId);
        }
      }
    }
  }, [priceToEdit, initialMaterialVariantId, state.materialVariants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let materialVariantId = '';
    if (selectedMaterial) {
      if (selectedMaterial.category === 'perfil') {
        if (!selectedFinishId) {
          alert('Por favor, selecione um acabamento para o perfil.');
          return;
        }
        materialVariantId = state.materialVariants.find(v => v.materialId === selectedMaterialId && v.finishId === selectedFinishId)?.id || '';
      } else {
        materialVariantId = state.materialVariants.find(v => v.materialId === selectedMaterialId && !v.finishId)?.id || '';
      }
    }
    
    if (!formData.supplierId || !materialVariantId || formData.unitCost === '') {
      alert('Por favor, preencha Fornecedor, Material, Acabamento (se aplicável) e Custo Unitário.');
      return;
    }
    setIsSaving(true);

    const payload = {
      supplier_id: formData.supplierId,
      material_variant_id: materialVariantId,
      unit_cost: formData.unitCost,
      sale_unit: formData.saleUnit,
      valid_from: formData.validFrom,
      valid_to: formData.validTo || null,
      lead_time: formData.leadTime,
      active: formData.active,
      freight_included: formData.freightIncluded,
      preferred: formData.preferred,
    };

    let data, error;
    if (priceToEdit) {
      ({ data, error } = await supabase.from('price_entries').update(payload).eq('id', priceToEdit.id).select().single());
    } else {
      ({ data, error } = await supabase.from('price_entries').insert(payload).select().single());
    }
    
    setIsSaving(false);
    if (error) {
      alert('Erro ao salvar preço: ' + error.message);
      return;
    }
    if (data) {
      const savedPrice: PriceEntry = {
        id: data.id, supplierId: data.supplier_id, materialVariantId: data.material_variant_id,
        unitCost: data.unit_cost, saleUnit: data.sale_unit, moq: data.moq, leadTime: data.lead_time,
        validFrom: data.valid_from, validTo: data.valid_to, states: data.states, icmsPercent: data.icms_percent,
        freightIncluded: data.freight_included, active: data.active, preferred: data.preferred, createdAt: data.created_at
      };
      dispatch({ type: priceToEdit ? 'UPDATE_PRICE_ENTRY' : 'ADD_PRICE_ENTRY', payload: savedPrice });
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-medium text-gray-900">{priceToEdit ? 'Editar Preço' : 'Novo Preço'}</h3></div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor *</label>
              <select required value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="" disabled>Selecione...</option>
                {state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material Base *</label>
              <select required value={selectedMaterialId} onChange={e => { setSelectedMaterialId(e.target.value); setSelectedFinishId(''); }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="" disabled>Selecione...</option>
                {state.materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            {selectedMaterial && selectedMaterial.category === 'perfil' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acabamento *</label>
                <select required value={selectedFinishId} onChange={e => setSelectedFinishId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="" disabled>Selecione...</option>
                  {state.finishes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custo Unitário (R$) *</label>
              <input type="number" step="0.01" required placeholder="0.00" value={formData.unitCost} onChange={e => setFormData({...formData, unitCost: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade de Venda *</label>
              <select required value={formData.saleUnit} onChange={e => setFormData({...formData, saleUnit: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="m">Metro (m)</option><option value="barra_6m">Barra 6m</option><option value="peça">Peça</option><option value="kit">Kit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vigente Desde *</label>
              <input type="date" required value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vigente Até</label>
              <input type="date" value={formData.validTo} onChange={e => setFormData({...formData, validTo: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center"><input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="mr-2" />Ativo</label>
            <label className="flex items-center"><input type="checkbox" checked={formData.preferred} onChange={e => setFormData({...formData, preferred: e.target.checked})} className="mr-2" />Preferido</label>
            <label className="flex items-center"><input type="checkbox" checked={formData.freightIncluded} onChange={e => setFormData({...formData, freightIncluded: e.target.checked})} className="mr-2" />Frete Incluso</label>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-400">{isSaving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}Salvar Preço</button>
          </div>
        </form>
      </div>
    </div>
  );
}
