import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { GeometryType, ProjectParams } from '../types';
import Tooltip from './Tooltip';

const getAparadorSize = (capacity: number): 250 | 350 | 450 | 550 => {
  if (capacity <= 5) return 250;
  if (capacity <= 7) return 350;
  if (capacity <= 9) return 450;
  return 550;
};

export default function EntradasTab() {
  const { state, dispatch } = useApp();
  const [showParams, setShowParams] = useState(false);
  
  const project = state.currentProject;
  if (!project) return null;

  const { inputs } = project;

  const updateInputs = (updates: Partial<typeof inputs>) => {
    dispatch({ type: 'UPDATE_PROJECT_INPUTS', payload: updates });
  };

  const updateDimensions = (key: string, value: number) => {
    updateInputs({
      dimensions: { ...inputs.dimensions, [key]: value }
    });
  };

  const updateParams = (key: keyof ProjectParams, value: any) => {
    updateInputs({
      params: { ...inputs.params, [key]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Configuração da Obra</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Obra
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => dispatch({ type: 'UPDATE_PROJECT_DETAILS', payload: { name: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado (UF)
            </label>
            <select
              value={project.state}
              onChange={(e) => dispatch({ type: 'UPDATE_PROJECT_DETAILS', payload: { state: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              <option value="RS">Rio Grande do Sul</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alvo Largura da Folha (mm)
            </label>
            <input
              type="number"
              value={inputs.targetLeafWidth}
              onChange={(e) => updateInputs({ targetLeafWidth: Number(e.target.value) })}
              placeholder="500"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Geometria e Dimensões</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Geometria
            </label>
            <div className="space-y-2">
              {(['Reta', 'L', 'U'] as GeometryType[]).map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    value={type}
                    checked={inputs.geometry === type}
                    onChange={(e) => updateInputs({ geometry: e.target.value as GeometryType })}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensões (mm)
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <label className="w-20 text-sm text-gray-600">Frente A:</label>
                <input
                  type="number"
                  value={inputs.dimensions.A}
                  onChange={(e) => updateDimensions('A', Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {(inputs.geometry === 'L' || inputs.geometry === 'U') && (
                <div className="flex items-center space-x-2">
                  <label className="w-20 text-sm text-gray-600">Frente B:</label>
                  <input
                    type="number"
                    value={inputs.dimensions.B || 0}
                    onChange={(e) => updateDimensions('B', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              
              {inputs.geometry === 'U' && (
                <div className="flex items-center space-x-2">
                  <label className="w-20 text-sm text-gray-600">Frente C:</label>
                  <input
                    type="number"
                    value={inputs.dimensions.C || 0}
                    onChange={(e) => updateDimensions('C', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <label className="w-20 text-sm text-gray-600">Altura H:</label>
                <input
                  type="number"
                  value={inputs.dimensions.H}
                  onChange={(e) => updateDimensions('H', Number(e.target.value))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="w-20 text-sm text-gray-600">Nº Aberturas:</label>
                <input
                  type="number"
                  value={inputs.openings}
                  onChange={(e) => updateInputs({ openings: Math.max(1, Number(e.target.value)) })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <button
          onClick={() => setShowParams(!showParams)}
          className="w-full px-6 py-4 flex items-center justify-between text-left"
        >
          <h3 className="text-lg font-medium text-gray-900">Parâmetros da Obra</h3>
          {showParams ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {showParams && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tooltip text="Folga entre a parede e o primeiro/último painel de vidro.">
                    <span className="flex items-center cursor-help">
                      FL - Folga Lateral (mm)
                      <Info className="h-3 w-3 inline ml-1 text-gray-400" />
                    </span>
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={inputs.params.FL}
                  onChange={(e) => updateParams('FL', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tooltip text="Folga padrão entre cada painel de vidro.">
                    <span className="flex items-center cursor-help">
                      FV - Folga Entre Vidros (mm)
                      <Info className="h-3 w-3 inline ml-1 text-gray-400" />
                    </span>
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={inputs.params.FV}
                  onChange={(e) => updateParams('FV', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tooltip text="Folga vertical total (superior + inferior) para o sistema.">
                    <span className="flex items-center cursor-help">
                      FH - Folga de Altura (mm)
                      <Info className="h-3 w-3 inline ml-1 text-gray-400" />
                    </span>
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={inputs.params.FH}
                  onChange={(e) => updateParams('FH', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tooltip text="Folga adicional aplicada apenas no painel passante em vãos L/U.">
                    <span className="flex items-center cursor-help">
                      FEg - Folga Entre Graus (mm)
                      <Info className="h-3 w-3 inline ml-1 text-gray-400" />
                    </span>
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={inputs.params.FEg}
                  onChange={(e) => updateParams('FEg', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Espessura do Vidro (mm)
                </label>
                <select
                  value={inputs.params.glassThickness}
                  onChange={(e) => updateParams('glassThickness', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={8}>8 mm</option>
                  <option value={10}>10 mm</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidade Caixa Saída
                </label>
                <input
                  type="number"
                  value={inputs.params.boxCapacity}
                  onChange={(e) => {
                    const newCapacity = Number(e.target.value);
                    const newAparadorSize = getAparadorSize(newCapacity);
                    updateInputs({
                      params: {
                        ...inputs.params,
                        boxCapacity: newCapacity,
                        aparadorSize: newAparadorSize,
                      },
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho do Aparador (mm)
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-700">
                  {inputs.params.aparadorSize} (calculado)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Fechadura
                </label>
                <select
                  value={inputs.params.lockType}
                  onChange={(e) => updateParams('lockType', e.target.value as 'contra' | 'vidro-vidro')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="contra">Fechadura com Contra</option>
                  <option value="vidro-vidro">Fechadura Vidro-Vidro</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Usinagens/Cortes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Corte Superior (mm)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={inputs.params.cutSup.width}
                      onChange={(e) => updateParams('cutSup', { ...inputs.params.cutSup, width: Number(e.target.value) })}
                      placeholder="Largura"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={inputs.params.cutSup.height}
                      onChange={(e) => updateParams('cutSup', { ...inputs.params.cutSup, height: Number(e.target.value) })}
                      placeholder="Altura"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Corte U Regulagem (mm)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={inputs.params.cutU.width}
                      onChange={(e) => updateParams('cutU', { ...inputs.params.cutU, width: Number(e.target.value) })}
                      placeholder="Largura"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      value={inputs.params.cutU.height}
                      onChange={(e) => updateParams('cutU', { ...inputs.params.cutU, height: Number(e.target.value) })}
                      placeholder="Altura"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Boca Offset (mm)
                  </label>
                  <input
                    type="number"
                    value={inputs.params.bocaOffset}
                    onChange={(e) => updateParams('bocaOffset', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passo Drenos (mm)
                  </label>
                  <input
                    type="number"
                    value={inputs.params.drainStep}
                    onChange={(e) => updateParams('drainStep', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acabamento / Cor</h3>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {state.finishes.map((finish) => (
            <label key={finish.id} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="finish"
                value={finish.code}
                checked={inputs.finish === finish.code}
                onChange={(e) => updateInputs({ finish: e.target.value })}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{finish.code} - {finish.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
