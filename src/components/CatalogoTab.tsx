import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Package, Palette } from 'lucide-react';

export default function CatalogoTab() {
  const { state, dispatch } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'materiais' | 'acabamentos'>('materiais');

  const subTabs = [
    { id: 'materiais', name: 'Materiais', icon: Package },
    { id: 'acabamentos', name: 'Acabamentos', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navegação */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeSubTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {activeSubTab === 'materiais' && <MateriaisContent />}
      {activeSubTab === 'acabamentos' && <AcabamentosContent />}
    </div>
  );
}

function MateriaisContent() {
  const { state, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);

  const categoryColors: Record<string, string> = {
    perfil: 'bg-blue-100 text-blue-800',
    vidro: 'bg-green-100 text-green-800',
    acessorio: 'bg-purple-100 text-purple-800',
    escova: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Catálogo de Materiais</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Material
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{state.materials.length}</div>
            <div className="text-sm text-blue-800">Total Materiais</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{state.materials.filter(m => m.category === 'perfil').length}</div>
            <div className="text-sm text-green-800">Perfis</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{state.materials.filter(m => m.category === 'acessorio').length}</div>
            <div className="text-sm text-purple-800">Acessórios</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{state.materials.filter(m => m.category === 'escova').length}</div>
            <div className="text-sm text-yellow-800">Escovas</div>
          </div>
        </div>
      </div>

      {/* Lista de Materiais */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Materiais Cadastrados</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade Base
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perda Padrão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{material.name}</div>
                        {material.notes && (
                          <div className="text-sm text-gray-500">{material.notes}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${categoryColors[material.category]}`}>
                      {material.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.baseUnit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.defaultWaste}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AcabamentosContent() {
  const { state, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Acabamentos e Cores</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Acabamento
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{state.finishes.length}</div>
            <div className="text-sm text-blue-800">Total Acabamentos</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">5</div>
            <div className="text-sm text-green-800">Cores Padrão</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{state.finishes.length - 5}</div>
            <div className="text-sm text-purple-800">Personalizados</div>
          </div>
        </div>
      </div>

      {/* Grid de Acabamentos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acabamentos Disponíveis</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {state.finishes.map((finish) => (
            <div key={finish.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600"></div>
                <div className="flex space-x-1">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">{finish.code}</div>
              <div className="text-xs text-gray-500">{finish.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
