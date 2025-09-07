import { ProjectInputs, CalculationResult, BOMItem, Material, MaterialVariant } from '../types';

export function calculateSacada(inputs: ProjectInputs): CalculationResult[] {
  const results: CalculationResult[] = [];
  const { geometry, dimensions, targetLeafWidth, params } = inputs;
  
  const fronts = getFronts(geometry, dimensions);
  
  fronts.forEach((front, index) => {
    if (front <= 0) return;
    const frontName = getFrontName(geometry, index);
    const width = front;
    
    const suggestedPanels = Math.max(1, Math.round(width / targetLeafWidth));
    
    let LRP: number;
    const isPassante = (geometry === 'L' || geometry === 'U') && index === 0;
    const additionalGap = isPassante ? params.FEg : 0;
    LRP = (width - 2 * params.FL - (suggestedPanels - 1) * params.FV - additionalGap) / suggestedPanels;
    
    const HRP = dimensions.H - params.FH;
    const area = (LRP * HRP * suggestedPanels) / 1000000;
    const boxes = Math.ceil(suggestedPanels / params.boxCapacity);
    
    const warnings: string[] = [];
    if (LRP < 350) warnings.push('Largura do painel abaixo do mínimo (350mm)');
    if (LRP > 800) warnings.push('Largura do painel acima do máximo (800mm)');
    if (HRP <= 0) warnings.push('Altura inválida após aplicar folgas');
    if (boxes > 1) warnings.push(`Necessárias ${boxes} caixas de saída`);
    if (isPassante) warnings.push(`Folga de passante (FEg) de ${params.FEg}mm aplicada`);
    
    results.push({
      front: frontName,
      suggestedPanels,
      LRP: Math.round(LRP * 100) / 100,
      HRP: Math.round(HRP * 100) / 100,
      area: Math.round(area * 100) / 100,
      boxes,
      warnings,
    });
  });
  
  return results;
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

function getFrontName(geometry: string, index: number): string {
  return `Frente ${String.fromCharCode(65 + index)}`;
}

export function generateBOM(
  inputs: ProjectInputs,
  results: CalculationResult[],
  materials: Material[],
  materialVariants: MaterialVariant[]
): BOMItem[] {
  const bom: BOMItem[] = [];

  const findVariantId = (materialBaseName: string, isProfile: boolean): string | undefined => {
    if (isProfile) {
      const finishCode = inputs.finish;
      const targetDisplayName = `${materialBaseName} - ${finishCode}`;
      const variant = materialVariants.find(v => v.displayName === targetDisplayName);
      return variant?.id;
    }
    
    const material = materials.find(m => m.name === materialBaseName);
    if (!material) return undefined;

    const variant = materialVariants.find(v => v.materialId === material.id && !v.finishId);
    return variant?.id;
  };
  
  const totalPanels = results.reduce((sum, r) => sum + r.suggestedPanels, 0);
  const totalLength = getFronts(inputs.geometry, inputs.dimensions).reduce((sum, w) => sum + w, 0);
  const totalHeight = inputs.dimensions.H;

  const perfilURegulagemVariantId = findVariantId('Perfil U de regulagem (A)', true);
  if (totalHeight > 0 && perfilURegulagemVariantId) {
    bom.push({
      id: 'perfil-u-regulagem',
      name: 'Perfil U de regulagem (A)',
      category: 'perfil',
      quantity: Math.round((totalHeight * 2) / 1000 * 100) / 100,
      unit: 'm',
      materialVariantId: perfilURegulagemVariantId,
    });
  }

  const trilhoSuperiorVariantId = findVariantId('Trilho superior (D)', true);
  if (totalLength > 0 && trilhoSuperiorVariantId) {
    bom.push({
      id: 'trilho-superior',
      name: 'Trilho superior (D)',
      category: 'perfil',
      quantity: Math.round(totalLength / 1000 * 100) / 100,
      unit: 'm',
      materialVariantId: trilhoSuperiorVariantId,
    });
  }

  const trilhoInferiorVariantId = findVariantId('Trilho inferior (C)', true);
  if (totalLength > 0 && trilhoInferiorVariantId) {
    bom.push({
      id: 'trilho-inferior',
      name: 'Trilho inferior (C)',
      category: 'perfil',
      quantity: Math.round(totalLength / 1000 * 100) / 100,
      unit: 'm',
      materialVariantId: trilhoInferiorVariantId,
    });
  }

  const leitoVidroVariantId = findVariantId('Leito do vidro (E)', true);
  if (leitoVidroVariantId) {
    results.forEach(result => {
      const lrpMeters = result.LRP / 1000;
      bom.push({
        id: `leito-vidro-${result.front.toLowerCase().replace(/ /g, '-')}`,
        name: `Leito do vidro (E) - ${result.front}`,
        category: 'perfil',
        quantity: Math.round(lrpMeters * result.suggestedPanels * 100) / 100,
        unit: 'm',
        materialVariantId: leitoVidroVariantId,
      });
    });
  }

  const escovaTotalLength = (totalHeight * totalPanels + totalLength) / 1000;
  if (escovaTotalLength > 0) {
    const escova5x7VariantId = findVariantId('Escova 5x7', false);
    if (escova5x7VariantId) {
      bom.push({ id: 'escova-5x7', name: 'Escova 5x7', category: 'escova', quantity: Math.round(escovaTotalLength * 0.6 * 100) / 100, unit: 'm', materialVariantId: escova5x7VariantId });
    }
    const escova5x5VariantId = findVariantId('Escova 5x5', false);
    if (escova5x5VariantId) {
      bom.push({ id: 'escova-5x5', name: 'Escova 5x5', category: 'escova', quantity: Math.round(escovaTotalLength * 0.4 * 100) / 100, unit: 'm', materialVariantId: escova5x5VariantId });
    }
  }

  const kitPivoQty = 2;
  
  if (totalPanels > 0) {
    const kitRoldanaVariantId = findVariantId('Kit roldana painel', false);
    if (kitRoldanaVariantId) bom.push({ id: 'kit-roldana-painel', name: 'Kit roldana painel', category: 'acessorio', quantity: Math.max(0, totalPanels - kitPivoQty), unit: 'kit', materialVariantId: kitRoldanaVariantId });
    
    const tampasLeitoVariantId = findVariantId('Tampas de leito', false);
    if (tampasLeitoVariantId) bom.push({ id: 'tampas-leito', name: 'Tampas de leito', category: 'acessorio', quantity: totalPanels * 2, unit: 'peça', materialVariantId: tampasLeitoVariantId });
    
    const estacionamentoVariantId = findVariantId('Estacionamento', false);
    if (estacionamentoVariantId) bom.push({ id: 'estacionamento', name: 'Estacionamento', category: 'acessorio', quantity: Math.ceil(totalPanels / 3) * 2, unit: 'peça', materialVariantId: estacionamentoVariantId });
  }

  const kitPivoVariantId = findVariantId('Kit pivô', false);
  if (kitPivoVariantId) bom.push({ id: 'kit-pivo', name: 'Kit pivô', category: 'acessorio', quantity: kitPivoQty, unit: 'kit', materialVariantId: kitPivoVariantId });
  
  if (inputs.openings > 0) {
    const lockName = inputs.params.lockType === 'contra' ? 'Fechadura com Contra' : 'Fechadura Vidro-Vidro';
    const lockVariantId = findVariantId(lockName, false);
    if (lockVariantId) {
      bom.push({
        id: `fechadura-${inputs.params.lockType}`,
        name: `${lockName} ${inputs.params.glassThickness}mm`,
        category: 'acessorio',
        quantity: inputs.openings,
        unit: 'peça',
        materialVariantId: lockVariantId,
      });
    }
  }
  
  const conjuntoSaidaVariantId = findVariantId('Conjunto saída sup/inf', false);
  if (conjuntoSaidaVariantId) bom.push({ id: 'conjunto-saida', name: 'Conjunto saída sup/inf', category: 'acessorio', quantity: 2, unit: 'conj', materialVariantId: conjuntoSaidaVariantId });
  
  const numSaidas = 2; 
  const aparadorVariantId = findVariantId('Aparador', false);
  if (aparadorVariantId) {
    bom.push({
        id: 'aparador',
        name: `Aparador ${inputs.params.aparadorSize}mm`,
        category: 'acessorio',
        quantity: numSaidas,
        unit: 'peça',
        materialVariantId: aparadorVariantId,
    });
  }
  
  const vidroVariantId = findVariantId('Vidro temperado', false);
  if (vidroVariantId) {
    results.forEach(result => {
      const glassArea = (result.LRP * result.HRP * result.suggestedPanels) / 1000000;
      bom.push({
        id: `vidro-temperado-${inputs.params.glassThickness}mm-${result.front.toLowerCase().replace(/ /g, '-')}`,
        name: `Vidro temperado ${inputs.params.glassThickness}mm - ${result.front}`,
        category: 'vidro',
        quantity: Math.round(glassArea * 100) / 100,
        unit: 'm²',
        materialVariantId: vidroVariantId,
      });
    });
  }
  
  return bom.filter(item => item.quantity > 0);
}

export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
