import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

interface SupplierFormProps {
  onClose: () => void;
  supplierToEdit: Supplier | null;
}

export default function SupplierForm({ onClose, supplierToEdit }: SupplierFormProps) {
  const { state, dispatch } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{ cnpj?: string }>({});
  const [formData, setFormData] = useState({
    name: supplierToEdit?.name || '',
    cnpj: supplierToEdit?.cnpj || '',
    states: supplierToEdit?.states || ['SP'],
    phone: supplierToEdit?.contact?.phone || '',
    email: supplierToEdit?.contact?.email || '',
    whatsapp: supplierToEdit?.contact?.whatsapp || '',
    defaultLeadTime: supplierToEdit?.defaultLeadTime || 7,
    notes: supplierToEdit?.notes || '',
    active: supplierToEdit?.active ?? true,
    preferred: supplierToEdit?.preferred ?? false,
  });
  
  const validateForm = (): boolean => {
    setFormErrors({});
    if (formData.cnpj) {
      const existingSupplier = state.suppliers.find(
        (s) => s.cnpj && s.cnpj === formData.cnpj && s.id !== supplierToEdit?.id
      );
      if (existingSupplier) {
        setFormErrors({ cnpj: `CNPJ já cadastrado para: ${existingSupplier.name}.` });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    const payload = {
      name: formData.name,
      cnpj: formData.cnpj || null, // Ensure empty string is saved as null
      states: formData.states,
      contact: {
        phone: formData.phone,
        email: formData.email,
        whatsapp: formData.whatsapp,
      },
      default_lead_time: formData.defaultLeadTime,
      notes: formData.notes,
      active: formData.active,
      preferred: formData.preferred,
    };

    let data, error;
    if (supplierToEdit) {
      ({ data, error } = await supabase.from('suppliers').update(payload).eq('id', supplierToEdit.id).select().single());
    } else {
      ({ data, error } = await supabase.from('suppliers').insert(payload).select().single());
    }
    
    setIsSaving(false);
    if (error) {
      if (error.message.includes('suppliers_cnpj_key')) {
        setFormErrors({ cnpj: 'Este CNPJ já está cadastrado no sistema.' });
      } else {
        alert('Erro ao salvar fornecedor: ' + error.message);
      }
      return;
    }
    if (data) {
      const savedSupplier: Supplier = {
        id: data.id,
        name: data.name,
        cnpj: data.cnpj,
        states: data.states,
        contact: data.contact,
        defaultFreightPerKm: data.default_freight_per_km,
        defaultLeadTime: data.default_lead_time,
        notes: data.notes,
        active: data.active,
        preferred: data.preferred,
        createdAt: data.created_at
      };
      dispatch({ type: supplierToEdit ? 'UPDATE_SUPPLIER' : 'ADD_SUPPLIER', payload: savedSupplier });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{supplierToEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input 
                type="text" 
                value={formData.cnpj} 
                onChange={(e) => {
                  setFormData({ ...formData, cnpj: e.target.value });
                  if (formErrors.cnpj) setFormErrors({});
                }} 
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${formErrors.cnpj ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.cnpj && <p className="text-xs text-red-600 mt-1">{formErrors.cnpj}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input type="text" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo Padrão (dias)</label>
              <input type="number" required value={formData.defaultLeadTime} onChange={(e) => setFormData({ ...formData, defaultLeadTime: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center">
              <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Ativo
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={formData.preferred} onChange={e => setFormData({...formData, preferred: e.target.checked})} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Preferido
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-400">
              {isSaving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
