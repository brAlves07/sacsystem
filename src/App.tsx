import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import EntradasTab from './components/EntradasTab';
import ResultadosTab from './components/ResultadosTab';
import BOMTab from './components/BOMTab';
import FornecedoresTab from './components/fornecedores/FornecedoresTab';
import CatalogoTab from './components/CatalogoTab';

function AppContent() {
  const { state } = useApp();

  const renderActiveTab = () => {
    switch (state.activeTab) {
      case 'entradas':
        return <EntradasTab />;
      case 'resultados':
        return <ResultadosTab />;
      case 'bom':
        return <BOMTab />;
      case 'fornecedores':
        return <FornecedoresTab />;
      case 'catalogo':
        return <CatalogoTab />;
      default:
        return <EntradasTab />;
    }
  };

  return (
    <Layout>
      {renderActiveTab()}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
