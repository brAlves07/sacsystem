import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateSacada } from '../utils/calculations';
import { AlertTriangle, CheckCircle, Download } from 'lucide-react';

export default function ResultadosTab() {
  const { state, dispatch } = useApp();
  
  const project = state.currentProject;
  if (!project) return null;

  const results = calculateSacada(project.inputs);

  const totalArea = results.reduce((sum, r) => sum + r.area, 0);
  const totalPanels = results.reduce((sum, r) => sum + r.suggestedPanels, 0);
  const totalBoxes = results.reduce((sum, r) => sum + r.boxes, 0);

  const checklistItems = [
    { id: 'cutSup', label: `Cortes superiores: ${project.inputs.params.cutSup.width}×${project.inputs.params.cutSup.height}mm` },
    { id: 'cutU', label: `Cortes U de regulagem: ${project.inputs.params.cutU.width}×${project.inputs.params.cutU.height}mm` },
    { id: 'cutInf', label: `Cortes inferiores: ${project.inputs.params.cutInf.width}×${project.inputs.params.cutInf.height}mm` },
    { id: 'bocaOffset', label: `Centro da boca = LRP - ${project.inputs.params.bocaOffset}mm` },
    { id: 'drenos', label: `Drenos a cada ${project.inputs.params.drainStep}mm` },
    { id: 'rebites', label: `Rebites a cada 300mm (1º a 10mm da parede)` },
  ];

  const handleChecklistChange = (id: string, checked: boolean) => {
    dispatch({
      type: 'UPDATE_PROJECT_INPUTS',
      payload: {
        machiningChecklist: {
          ...project.inputs.machiningChecklist,
          [id]: checked,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Resumo dos Cálculos</h2>
          <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar Resultados
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalPanels}</div>
            <div className="text-sm text-blue-800">Painéis Totais</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalArea.toFixed(2)} m²</div>
            <div className="text-sm text-green-800">Área Total</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{totalBoxes}</div>
            <div className="text-sm text-yellow-800">Caixas de Saída</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{project.inputs.geometry}</div>
            <div className="text-sm text-purple-800">Geometria</div>
          </div>
        </div>
      </div>

      {/* Resultados por Frente */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Resultados por Frente</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Painéis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LRP (mm)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HRP (mm)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Área (m²)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Caixas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.front}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.suggestedPanels}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.LRP.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.HRP.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.area.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.boxes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {result.warnings.length === 0 ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">OK</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-yellow-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Avisos</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Avisos e Observações */}
      {results.some(r => r.warnings.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-yellow-800">Avisos e Observações</h3>
          </div>
          <div className="space-y-2">
            {results.map((result, index) => 
              result.warnings.map((warning, wIndex) => (
                <div key={`${index}-${wIndex}`} className="text-sm text-yellow-700">
                  <strong>{result.front}:</strong> {warning}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Lista de Corte */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lista de Corte</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Perfis */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Perfis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Perfil "U" de regulagem (A):</span>
                <span className="font-medium">2 peças × {project.inputs.dimensions.H}mm</span>
              </div>
              <div className="flex justify-between">
                <span>Trilho superior (D):</span>
                <span className="font-medium">{results.reduce((sum, r, i) => sum + (getFronts(project.inputs.geometry, project.inputs.dimensions)[i] || 0), 0)}mm</span>
              </div>
              <div className="flex justify-between">
                <span>Trilho inferior (C):</span>
                <span className="font-medium">{results.reduce((sum, r, i) => sum + (getFronts(project.inputs.geometry, project.inputs.dimensions)[i] || 0), 0)}mm</span>
              </div>
            </div>
          </div>

          {/* Leitos */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Leitos</h4>
            <div className="space-y-2 text-sm">
              {results.map((result, index) => (
                <div key={index} className="flex justify-between">
                  <span>Leito {result.front}:</span>
                  <span className="font-medium">{result.suggestedPanels} × {result.LRP.toFixed(2)}mm</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checklist de Usinagem */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Checklist de Usinagem</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {checklistItems.slice(0, 3).map(item => (
                <label key={item.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={project.inputs.machiningChecklist[item.id] || false}
                    onChange={e => handleChecklistChange(item.id, e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              {checklistItems.slice(3).map(item => (
                <label key={item.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={project.inputs.machiningChecklist[item.id] || false}
                    onChange={e => handleChecklistChange(item.id, e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFronts(geometry: string, dimensions: any): number[] {
  switch (geometry) {
    case 'Reta':
      return [dimensions.A];
    case 'L':
      return [dimensions.A, dimensions.B || 0];
    case 'U':
      return [dimensions.A, dimensions.B || 0, dimensions.C || 0];
    default:
      return [dimensions.A];
  }
}
