import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Finances from './pages/Finances';
import WorkOrders from './pages/WorkOrders';
import Settings from './pages/Settings';
import { useStore } from './services/store';

const App: React.FC = () => {
  const { 
    state, 
    addCustomer, 
    addTransaction, 
    addFinanceEntry, 
    deleteFinanceEntry,
    addOrder,
    updateOrder,
    updateSettings,
    importData
  } = useStore();

  return (
    <HashRouter>
      <Layout settings={state.settings}>
        <Routes>
          <Route path="/" element={<Dashboard state={state} />} />
          <Route 
            path="/customers" 
            element={
              <Customers 
                customers={state.customers} 
                onAddCustomer={addCustomer}
                onAddTransaction={addTransaction}
              />
            } 
          />
          <Route 
            path="/finances" 
            element={
              <Finances 
                finances={state.finances}
                onAddEntry={addFinanceEntry}
                onDeleteEntry={deleteFinanceEntry}
              />
            } 
          />
          <Route 
            path="/orders" 
            element={
              <WorkOrders 
                orders={state.orders}
                customers={state.customers}
                onAddOrder={addOrder}
                onUpdateOrder={updateOrder}
                onAddTransaction={addTransaction}
              />
            } 
          />
          <Route 
            path="/settings" 
            element={
              <Settings 
                settings={state.settings}
                fullState={state}
                onUpdateSettings={updateSettings}
                onImportData={importData}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;