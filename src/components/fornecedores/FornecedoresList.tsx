import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { Supplier } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import SupplierForm from './SupplierForm';

export default function FornecedoresList() {
  const { state, dispatch } = useApp();
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = (supplier: Supplier | null = null) => {
    setSupplierToEdit(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async (supplierId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor? TODOS os preços associados a ele também serão permanentemente excluídos. Esta ação não pode ser desfeita.')) {
      // 1. Delete associated prices
      const { error: pricesError } = await supabase
        .from('price_entries')
        .delete()
        .eq('supplier_id', supplierId);
      
      if (pricesError) {
        alert('Erro ao excluir os preços associados: ' + pricesError.message);
        return;
      }

      // 2. Delete the supplier
      const { error: supplierError } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (supplierError) {
        alert('Erro ao excluir o fornecedor: ' + supplierError.message);
        return;
      }
      
      // 3. Update local state
      dispatch({ type: 'DELETE_PRICES_BY_SUPPLIER', payload: supplierId });
      dispatch({ type: 'DELETE_SUPPLIER', payload: supplierId });
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
