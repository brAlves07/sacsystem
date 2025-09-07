import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { PriceEntry } from '../../types';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabaseClient';
import PriceForm from './PriceForm';

export default function PrecosList() {
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tabela de Preços</h2>
          <div className="flex space-x-2">
            <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <Upload className="h-4 w-4 mr-2" />Importar CSV
            </button>
            <button onClick={() => handleOpenForm()} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />Novo Preço
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg"><div className="text-2xl font-bold text-blue-600">{state.priceEntries.length}</div><div className="text-sm text-blue-800">Total Preços</div></div>
          <div className="bg-green-50 p-4 rounded-lg"><div className="text-2xl font-bold text-green-600">{state.priceEntries.filter(p => p.active).length}</div><div className="text-sm text-green-800">Vigentes</div></div>
          <div className="bg-yellow-50 p-4 rounded-lg"><div className="text-2xl font-bold text-yellow-600">{state.priceEntries.filter(p => p.preferred).length}</div><div className="text-sm text-yellow-800">Preferidos</div></div>
          <div className="bg-red-50 p-4 rounded-lg"><div className="text-2xl font-bold text-red-600">{state.priceEntries.filter(p => p.validTo && new Date(p.validTo) < new Date()).length}</div><div className="text-sm text-red-800">Vencidos</div></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-medium text-gray-900">Preços Cadastrados</h3></div>
        {state.priceEntries.length === 0 ? (
          <div className="p-8 text-center"><div className="text-gray-500 mb-4">Nenhum preço cadastrado</div><button onClick={() => handleOpenForm()} className="text-blue-600 hover:text-blue-800 underline">Cadastrar primeiro preço</button></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigência</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.priceEntries.map((price) => {
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isFormOpen && <PriceForm onClose={() => setIsFormOpen(false)} priceToEdit={priceToEdit} />}
    </div>
  );
}
