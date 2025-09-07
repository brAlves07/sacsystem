import React from 'react';
import { useApp, createNewProject } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Calculator, Package, Users, Library, BarChart3, Plus, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const tabs = [
  { id: 'entradas', name: 'Entradas', icon: Calculator },
  { id: 'resultados', name: 'Resultados', icon: BarChart3 },
  { id: 'bom', name: 'BOM', icon: Package },
  { id: 'fornecedores', name: 'Fornecedores', icon: Users },
  { id: 'catalogo', name: 'Catálogo', icon: Library },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { state, dispatch } = useApp();

  const handleNewProject = () => {
    const newName = `Nova Obra ${state.projects.length + 1}`;
    const newProject = createNewProject(uuidv4(), newName);
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
  };

  const handleProjectChange = (projectId: string) => {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
    }
  };

  const getSaveStatusIndicator = () => {
    switch (state.saveStatus) {
      case 'saving':
        return <div className="flex items-center text-sm text-yellow-600"><Loader2 className="animate-spin h-4 w-4 mr-2" />Salvando...</div>;
      case 'saved':
        return <div className="flex items-center text-sm text-green-600"><CheckCircle className="h-4 w-4 mr-2" />Salvo</div>;
      case 'error':
        return <div className="flex items-center text-sm text-red-600"><AlertTriangle className="h-4 w-4 mr-2" />Erro</div>;
      default:
        return <div className="h-4 w-4 mr-2"></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                Calculadora de Sacadas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label htmlFor="project-select" className="sr-only">Selecionar Obra</label>
                <select
                  id="project-select"
                  value={state.currentProject?.id || ''}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="text-sm font-medium text-gray-700 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {state.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleNewProject}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova Obra
              </button>
              <div className="w-28 text-right">
                {getSaveStatusIndicator()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = state.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
                  className={`flex items-center px-3 py-4 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
