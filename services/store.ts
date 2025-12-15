import { useState, useEffect, useCallback } from 'react';
import { AppState, Customer, FinanceEntry, Transaction, WorkOrder, ShopSettings } from '../types';
import { loadState, saveState } from './storage';

export const useStore = () => {
  const [state, setState] = useState<AppState>(loadState);

  // Persistence effect
  useEffect(() => {
    saveState(state);
  }, [state]);

  const addCustomer = (customer: Customer) => {
    setState(prev => ({ ...prev, customers: [...prev.customers, customer] }));
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setState(prev => ({
        ...prev,
        customers: prev.customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
    }));
  }

  const deleteCustomer = (id: string) => {
      setState(prev => ({...prev, customers: prev.customers.filter(c => c.id !== id)}));
  }

  const addTransaction = (customerId: string, transaction: Transaction) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.map(c => 
        c.id === customerId 
          ? { ...c, transactions: [transaction, ...c.transactions] } 
          : c
      )
    }));
  };

  const addFinanceEntry = (entry: FinanceEntry) => {
    setState(prev => ({ ...prev, finances: [entry, ...prev.finances] }));
  };

  const deleteFinanceEntry = (id: string) => {
    setState(prev => ({...prev, finances: prev.finances.filter(f => f.id !== id)}));
  }

  const addOrder = (order: WorkOrder) => {
    setState(prev => ({ ...prev, orders: [order, ...prev.orders] }));
  };

  const updateOrder = (order: WorkOrder) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === order.id ? order : o)
    }));
  };

  const updateSettings = (settings: ShopSettings) => {
    setState(prev => ({ ...prev, settings }));
  };

  const importData = (data: AppState) => {
    setState(data);
  }

  return {
    state,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addTransaction,
    addFinanceEntry,
    deleteFinanceEntry,
    addOrder,
    updateOrder,
    updateSettings,
    importData
  };
};