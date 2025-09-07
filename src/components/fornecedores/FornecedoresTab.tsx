import React, { useState } from 'react';
import FornecedoresList from './FornecedoresList';
import PrecosList from './PrecosList';

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
      {activeSubTab === 'fornecedores' && <FornecedoresList />}
      {activeSubTab === 'precos' && <PrecosList />}
    </div>
  );
}
