import React, { useMemo, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateSacada, generateBOM, exportToCSV } from '../utils/calculations';
import { Download, AlertCircle, DollarSign, Package, RefreshCw, Plus } from 'lucide-react';
import { BOMItem } from '../types';
import PriceForm from './fornecedores/PriceForm';

export default function BOMTab() {
  const { state, dispatch } = useApp();
  const [showAddPriceModal, setShowAddPriceModal] = useState(false);
  const [selectedBomItemForPrice, setSelectedBomItemForPrice] = useState<BOMItem | null>(null);
  
  const project = state.currentProject;
  if (!project) return null;

  const results = useMemo(() => calculateSacada(project.inputs), [project.inputs]);
  
  useEffect(() => {
    if (!project || state.materials.length === 0) return;
    
    const newBom = generateBOM(project.inputs, results, state.materials, state.materialVariants);
    const currentBom = project.bom || [];
    
    const mergedBom = newBom.map(newItem => {
      const existingItem = currentBom.find(oldItem => oldItem.id === newItem.id);
      if (existingItem) {
        // Preserve user-entered data
        return {
          ...newItem, // Take new quantity
          supplierId: existingItem.supplierId,
          unitCost: existingItem.unitCost,
          markup: existingItem.markup,
          fixed: existingItem.fixed,
        };
      }
      return newItem;
    });

    // Re-calculate costs for all items
    const bomWithCosts = mergedBom.map(item => {
      let updatedItem = { ...item };
      const priceEntry = state.priceEntries.find(p => 
        p.supplierId === item.supplierId && 
        p.materialVariantId === item.materialVariantId &&
        p.active
      );
      
      updatedItem.unitCost = priceEntry?.unitCost;

      if (updatedItem.unitCost !== undefined) {
        updatedItem.totalCost = updatedItem.quantity * updatedItem.unitCost;
      } else {
        updatedItem.totalCost = undefined;
      }

      if (updatedItem.totalCost !== undefined) {
        const markup = updatedItem.category === 'acessorio' ? 0 : updatedItem.markup ?? 0;
        updatedItem.price = updatedItem.totalCost * (1 + markup / 100);
      } else {
        updatedItem.price = undefined;
      }
      return updatedItem;
    });


    if (JSON.stringify(bomWithCosts) !== JSON.stringify(currentBom)) {
      dispatch({ type: 'UPDATE_BOM', payload: bomWithCosts });
    }
  }, [project.inputs, results, state.materials, state.materialVariants, state.priceEntries, project.bom, dispatch]);


  const bom = project.bom || [];

  const handleBomItemUpdate = (itemId: string, updates: Partial<BOMItem>) => {
    const item = bom.find(i => i.id === itemId);
    if (!item) return;

    let updatedItem = { ...item, ...updates };

    if ('supplierId' in updates) {
      const priceEntry = state.priceEntries.find(p => 
        p.supplierId === updatedItem.supplierId && 
        p.materialVariantId === item.materialVariantId &&
        p.active
      );
      updatedItem.unitCost = priceEntry?.unitCost;
    }
    
    if (updatedItem.unitCost !== undefined) {
      updatedItem.totalCost = updatedItem.quantity * updatedItem.unitCost;
    } else {
      updatedItem.totalCost = undefined;
    }

    if (updatedItem.totalCost !== undefined) {
      const markup = updatedItem.category === 'acessorio' ? 0 : updatedItem.markup ?? 0;
      updatedItem.price = updatedItem.totalCost * (1 + markup / 100);
    } else {
      updatedItem.price = undefined;
    }
    
    dispatch({ type: 'UPDATE_BOM_ITEM', payload: updatedItem });
  };

  const handleAddPrice = (item: BOMItem) => {
    setSelectedBomItemForPrice(item);
    setShowAddPriceModal(true);
  };

  const totalCost = bom.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  const totalPrice = bom.reduce((sum, item) => sum + (item.price || 0), 0);
  const itemsWithoutPrice = bom.filter(item => !item.unitCost && item.supplierId);

  const handleExportCSV = () => {
    const exportData = bom.map(item => ({
      'Item': item.name,
      'Categoria': item.category,
      'Quantidade': item.quantity,
      'Unidade': item.unit,
      'Fornecedor': state.suppliers.find(s => s.id === item.supplierId)?.name || 'Não definido',
      'Custo Unitário': item.unitCost?.toFixed(2) || '0.00',
      'Frete': item.freight?.toFixed(2) || '0.00',
      'Impostos': item.taxes?.toFixed(2) || '0.00',
      'Custo Total': item.totalCost?.toFixed(2) || '0.00',
      'Markup %': item.category === 'acessorio' ? 0 : item.markup ?? 0,
      'Preço': item.price?.toFixed(2) || '0.00',
    }));
    
    exportToCSV(exportData, `BOM_${project.name}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Materiais (BOM)</h2>
          <div className="flex space-x-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </button>
            <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Preços
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg"><div className="text-2xl font-bold text-blue-600">{bom.length}</div><div className="text-sm text-blue-800">Itens no BOM</div></div>
          <div className="bg-red-50 p-4 rounded-lg"><div className="text-2xl font-bold text-red-600">R$ {totalCost.toFixed(2)}</div><div className="text-sm text-red-800">Custo Total</div></div>
          <div className="bg-green-50 p-4 rounded-lg"><div className="text-2xl font-bold text-green-600">R$ {totalPrice.toFixed(2)}</div><div className="text-sm text-green-800">Preço Total</div></div>
          <div className="bg-yellow-50 p-4 rounded-lg"><div className="text-2xl font-bold text-yellow-600">{itemsWithoutPrice.length}</div><div className="text-sm text-yellow-800">Sem Preço</div></div>
        </div>
      </div>

      {itemsWithoutPrice.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2"><AlertCircle className="h-5 w-5 text-red-600 mr-2" /><h3 className="text-lg font-medium text-red-800">Itens sem preço ativo</h3></div>
          <p className="text-sm text-red-700 mb-3">Os seguintes itens não possuem preços vigentes para o fornecedor selecionado. Adicione preços para completar o orçamento.</p>
          <div className="space-y-1">{itemsWithoutPrice.map(item => (<div key={item.id} className="text-sm text-red-600">• {item.name}</div>))}</div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Unit.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Markup %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bom.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 ${!item.unitCost && item.supplierId ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4"><div className="flex items-center"><Package className="h-4 w-4 text-gray-400 mr-2" /><div><div className="text-sm font-medium text-gray-900">{item.name}</div><span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${item.category === 'perfil' ? 'bg-blue-100 text-blue-800' : item.category === 'vidro' ? 'bg-green-100 text-green-800' : item.category === 'acessorio' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.category}</span></div></div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select value={item.supplierId || ''} onChange={(e) => handleBomItemUpdate(item.id, { supplierId: e.target.value })} className="text-sm border border-gray-300 rounded px-2 py-1 w-full">
                      <option value="">Selecione</option>
                      {state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unitCost ? (<span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" />{item.unitCost.toFixed(2)}</span>) : (<span className="text-red-500 text-xs">Sem preço</span>)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.totalCost ? `R$ ${item.totalCost.toFixed(2)}` : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.category !== 'acessorio' ? (
                      <input
                        type="number"
                        value={item.markup ?? ''}
                        placeholder="0"
                        onChange={(e) => handleBomItemUpdate(item.id, { markup: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    ) : (
                      <span className="text-sm text-gray-500 px-2 py-1">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{item.price ? `R$ ${item.price.toFixed(2)}` : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!item.fixed}
                          onChange={(e) => handleBomItemUpdate(item.id, { fixed: e.target.checked })}
                          className="mr-1"
                        />
                        <span className="text-xs">Fixar</span>
                      </label>
                      {!item.unitCost && item.supplierId && (<button onClick={() => handleAddPrice(item)} className="text-blue-600 hover:text-blue-800 text-xs underline flex items-center"><Plus className="h-3 w-3 mr-1"/>Preço</button>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo de Custos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Por Categoria</h4>
            <div className="space-y-2">
              {['perfil', 'vidro', 'acessorio', 'escova'].map(category => {
                const categoryItems = bom.filter(item => item.category === category);
                const categoryTotal = categoryItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
                return (<div key={category} className="flex justify-between text-sm"><span className="capitalize">{category}:</span><span className="font-medium">R$ {categoryTotal.toFixed(2)}</span></div>);
              })}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Totais</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Custo de Materiais:</span><span className="font-medium">R$ {totalCost.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span>Preço de Venda:</span><span className="font-medium text-green-600">R$ {totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm border-t pt-2"><span>Margem:</span><span className="font-medium text-blue-600">R$ {(totalPrice - totalCost).toFixed(2)} ({totalCost > 0 ? (((totalPrice - totalCost) / totalCost) * 100).toFixed(1) : 0}%)</span></div>
            </div>
          </div>
        </div>
      </div>
      
      {showAddPriceModal && selectedBomItemForPrice && (
        <PriceForm
          onClose={() => setShowAddPriceModal(false)}
          initialMaterialVariantId={selectedBomItemForPrice.materialVariantId}
          priceToEdit={null}
        />
      )}
    </div>
  );
}
