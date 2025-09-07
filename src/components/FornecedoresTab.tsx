import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Star, Upload, Loader2 } from 'lucide-react';
import { Supplier, PriceEntry } from '../types';
import { format } from 'date-fns';
import AddPriceForm from './AddPriceForm';
import { supabase } from '../lib/supabaseClient';

export default function FornecedoresTab() {
  const [activeSubTab, setActiveSubTab] = useState<'fornecedores' | 'precos'>('fornecedores');

  const subTabs = [
    { id: 'fornecedores', name: 'Fornecedores' },
    { id: 'precos', name: 'Tabela de Preços' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeSubTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >{tab.name}</button>
            ))}
          </nav>
        </div>
      </div>
      {activeSubTab === 'fornecedores' && <FornecedoresContent />}
      {activeSubTab === 'precos' && <PrecosContent />}
    </div>
  );
}

function FornecedoresContent() {
  const { state, dispatch } = useApp();
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = (supplier: Supplier | null = null) => {
    setSupplierToEdit(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async (supplierId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor? Isso não excluirá os preços associados.')) {
      const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
      if (error) {
        alert('Erro ao excluir fornecedor: ' + error.message);
      } else {
        dispatch({ type: 'DELETE_SUPPLIER', payload: supplierId });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Gestão de Fornecedores</h2>
          <button onClick={() => handleOpenForm()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"><Plus className="h-4 w-4 mr-2" />Novo Fornecedor</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg"><div className="text-2xl font-bold text-blue-600">{state.suppliers.length}</div><div className="text-sm text-blue-800">Total Fornecedores</div></div>
          <div className="bg-green-50 p-4 rounded-lg"><div className="text-2xl font-bold text-green-600">{state.suppliers.filter(s => s.active).length}</div><div className="text-sm text-green-800">Ativos</div></div>
          <div className="bg-yellow-50 p-4 rounded-lg"><div className="text-2xl font-bold text-yellow-600">{state.suppliers.filter(s => s.preferred).length}</div><div className="text-sm text-yellow-800">Preferidos</div></div>
          <div className="bg-purple-50 p-4 rounded-lg"><div className="text-2xl font-bold text-purple-600">{new Set(state.suppliers.flatMap(s => s.states)).size}</div><div className="text-sm text-purple-800">Estados Atendidos</div></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-medium text-gray-900">Lista de Fornecedores</h3></div>
        {state.suppliers.length === 0 ? (<div className="p-8 text-center"><div className="text-gray-500 mb-4">Nenhum fornecedor cadastrado</div><button onClick={() => handleOpenForm()} className="text-blue-600 hover:text-blue-800 underline">Cadastrar primeiro fornecedor</button></div>) : (<div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estados</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{state.suppliers.map((supplier) => (<tr key={supplier.id} className="hover:bg-gray-50"><td className="px-6 py-4"><div className="flex items-center">{supplier.preferred && (<Star className="h-4 w-4 text-yellow-500 mr-2" />)}<div><div className="text-sm font-medium text-gray-900">{supplier.name}</div>{supplier.notes && (<div className="text-sm text-gray-500">{supplier.notes}</div>)}</div></div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.cnpj}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.states.join(', ')}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"><div className="space-y-1">{supplier.contact.phone && (<div>📞 {supplier.contact.phone}</div>)}{supplier.contact.email && (<div>✉️ {supplier.contact.email}</div>)}{supplier.contact.whatsapp && (<div>💬 {supplier.contact.whatsapp}</div>)}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.defaultLeadTime} dias</td><td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${supplier.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{supplier.active ? 'Ativo' : 'Inativo'}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm"><div className="flex items-center space-x-2"><button onClick={() => handleOpenForm(supplier)} className="text-blue-600 hover:text-blue-800"><Edit2 className="h-4 w-4" /></button><button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button></div></td></tr>))}</tbody></table></div>)}
      </div>
      {isFormOpen && (<SupplierForm onClose={() => setIsFormOpen(false)} supplierToEdit={supplierToEdit} />)}
    </div>
  );
}

function PrecosContent() {
  const { state, dispatch } = useApp();
  const [priceToEdit, setPriceToEdit] = useState<PriceEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const handleOpenForm = (price: PriceEntry | null = null) => {
    setPriceToEdit(price);
    setIsFormOpen(true);
  };

  const handleDelete = async (priceId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este preço?')) {
      const { error } = await supabase.from('price_entries').delete().eq('id', priceId);
      if (error) {
        alert('Erro ao excluir preço: ' + error.message);
      } else {
        dispatch({ type: 'DELETE_PRICE_ENTRY', payload: priceId });
      }
    }
  };

  const getMaterialDisplayName = (variantId: string) => state.materialVariants.find(v => v.id === variantId)?.displayName || 'Desconhecido';
  const getSupplierName = (supplierId: string) => state.suppliers.find(s => s.id === supplierId)?.name || 'Desconhecido';
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return null;
    return format(new Date(dateString), 'dd/MM/yy');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Tabela de Preços</h2><div className="flex space-x-2"><button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"><Upload className="h-4 w-4 mr-2" />Importar CSV</button><button onClick={() => handleOpenForm()} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"><Plus className="h-4 w-4 mr-2" />Novo Preço</button></div></div><div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="bg-blue-50 p-4 rounded-lg"><div className="text-2xl font-bold text-blue-600">{state.priceEntries.length}</div><div className="text-sm text-blue-800">Total Preços</div></div><div className="bg-green-50 p-4 rounded-lg"><div className="text-2xl font-bold text-green-600">{state.priceEntries.filter(p => p.active).length}</div><div className="text-sm text-green-800">Vigentes</div></div><div className="bg-yellow-50 p-4 rounded-lg"><div className="text-2xl font-bold text-yellow-600">{state.priceEntries.filter(p => p.preferred).length}</div><div className="text-sm text-yellow-800">Preferidos</div></div><div className="bg-red-50 p-4 rounded-lg"><div className="text-2xl font-bold text-red-600">{state.priceEntries.filter(p => p.validTo && new Date(p.validTo) < new Date()).length}</div><div className="text-sm text-red-800">Vencidos</div></div></div></div>
      <div className="bg-white rounded-lg shadow"><div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-medium text-gray-900">Preços Cadastrados</h3></div>{state.priceEntries.length === 0 ? (<div className="p-8 text-center"><div className="text-gray-500 mb-4">Nenhum preço cadastrado</div><button onClick={() => handleOpenForm()} className="text-blue-600 hover:text-blue-800 underline">Cadastrar primeiro preço</button></div>) : (<div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigência</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{state.priceEntries.map((price) => {
        const validFromFormatted = formatDate(price.validFrom);
        const validToFormatted = formatDate(price.validTo);
        return (
          <tr key={price.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getSupplierName(price.supplierId)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getMaterialDisplayName(price.materialVariantId)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{typeof price.unitCost === 'number' ? `R$ ${price.unitCost.toFixed(2)}` : 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.saleUnit}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{price.leadTime} dias</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{validFromFormatted || 'Inválida'} - {validToFormatted || 'Aberto'}</td>
            <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${price.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{price.active ? 'Ativo' : 'Inativo'}</span></td>
            <td className="px-6 py-4 whitespace-nowrap text-sm"><div className="flex items-center space-x-2"><button onClick={() => handleOpenForm(price)} className="text-blue-600 hover:text-blue-800"><Edit2 className="h-4 w-4" /></button><button onClick={() => handleDelete(price.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button></div></td>
          </tr>
        )
      })}</tbody></table></div>)}</div>
      {isFormOpen && <AddPriceForm onClose={() => setIsFormOpen(false)} priceToEdit={priceToEdit} />}
    </div>
  );
}

function SupplierForm({ onClose, supplierToEdit }: { onClose: () => void, supplierToEdit: Supplier | null }) {
  const { dispatch } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: supplierToEdit?.name || '',
    cnpj: supplierToEdit?.cnpj || '',
    states: supplierToEdit?.states || ['SP'],
    contact: supplierToEdit?.contact || { phone: '', email: '', whatsapp: '' },
    defaultLeadTime: supplierToEdit?.defaultLeadTime || 7,
    notes: supplierToEdit?.notes || '',
    active: supplierToEdit?.active ?? true,
    preferred: supplierToEdit?.preferred ?? false,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      name: formData.name, cnpj: formData.cnpj, states: formData.states,
      contact: formData.contact, default_lead_time: formData.defaultLeadTime,
      notes: formData.notes, active: formData.active, preferred: formData.preferred,
    };

    let data, error;
    if (supplierToEdit) {
      ({ data, error } = await supabase.from('suppliers').update(payload).eq('id', supplierToEdit.id).select().single());
    } else {
      ({ data, error } = await supabase.from('suppliers').insert(payload).select().single());
    }
    
    setIsSaving(false);
    if (error) {
      alert('Erro ao salvar fornecedor: ' + error.message);
      return;
    }
    if (data) {
      const savedSupplier: Supplier = { id: data.id, name: data.name, cnpj: data.cnpj, states: data.states, contact: data.contact, defaultFreightPerKm: data.default_freight_per_km, defaultLeadTime: data.default_lead_time, notes: data.notes, active: data.active, preferred: data.preferred, createdAt: data.created_at };
      dispatch({ type: supplierToEdit ? 'UPDATE_SUPPLIER' : 'ADD_SUPPLIER', payload: savedSupplier });
      onClose();
    }
  };

  return (<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-medium text-gray-900">{supplierToEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3></div><form onSubmit={handleSubmit} className="px-6 py-4 space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label><input type="text" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input type="text" value={formData.contact.phone} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value }})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={formData.contact.email} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value }})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label><input type="text" value={formData.contact.whatsapp} onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, whatsapp: e.target.value }})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Prazo (dias)</label><input type="number" value={formData.defaultLeadTime} onChange={(e) => setFormData({ ...formData, defaultLeadTime: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Obs.</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div><div className="flex items-center space-x-6 pt-2"><label className="flex items-center"><input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="mr-2" />Ativo</label><label className="flex items-center"><input type="checkbox" checked={formData.preferred} onChange={e => setFormData({...formData, preferred: e.target.checked})} className="mr-2" />Preferido</label></div><div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">Cancelar</button><button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-400">{isSaving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}Salvar</button></div></form></div></div>);
}
