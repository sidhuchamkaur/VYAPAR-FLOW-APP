import React, { useState, useMemo } from 'react';
import { WorkOrder, OrderStatus, Customer, Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Clock, Loader2, CheckCircle2, Search, Filter, Plus } from 'lucide-react';

interface WorkOrdersProps {
  orders: WorkOrder[];
  customers: Customer[];
  onAddOrder: (order: WorkOrder) => void;
  onUpdateOrder: (order: WorkOrder) => void;
  onAddTransaction: (customerId: string, t: Transaction) => void;
}

const WorkOrders: React.FC<WorkOrdersProps> = ({ orders, customers, onAddOrder, onUpdateOrder, onAddTransaction }) => {
  const [showModal, setShowModal] = useState(false);
  
  // New Order Form
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [advance, setAdvance] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<OrderStatus>('PENDING');
  
  // Customer selection logic
  const [custNameInput, setCustNameInput] = useState('');
  const [selectedCustId, setSelectedCustId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const customerSuggestions = useMemo(() => {
    if (!custNameInput) return [];
    return customers.filter(c => c.name.toLowerCase().includes(custNameInput.toLowerCase()));
  }, [customers, custNameInput]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      process: orders.filter(o => o.status === 'IN_PROCESS').length,
      completed: orders.filter(o => o.status === 'COMPLETED').length,
      totalValue: orders.reduce((acc, o) => acc + o.amount, 0)
    };
  }, [orders]);

  const handleCustInputChange = (val: string) => {
    setCustNameInput(val);
    setSelectedCustId(null); // Reset ID if user types freely
    setShowSuggestions(true);
  };

  const selectSuggestion = (c: Customer) => {
    setCustNameInput(c.name);
    setSelectedCustId(c.id);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    // Use selected ID or fallback to "Guest/Walk-in" behavior (though prompt implies linking)
    // For this app, let's enforce linking if possible, or just store the name.
    // If ID exists, we can create a financial transaction immediately.
    
    const newOrder: WorkOrder = {
      id: uuidv4(),
      date,
      customerId: selectedCustId || '',
      customerName: custNameInput,
      detail: desc,
      status,
      amount: parseFloat(amount),
      advance: parseFloat(advance || '0'),
    };

    onAddOrder(newOrder);

    // If customer is selected and there is advance/udhaar
    if (selectedCustId) {
        const orderVal = parseFloat(amount);
        const advVal = parseFloat(advance || '0');
        const remaining = orderVal - advVal;

        // Logic: 
        // 1. Total order amount is a "Udhaar" (Debit) on customer initially? 
        // OR 2. Just record the Advance as "Jama".
        // Let's go with: Record Advance as Jama. If completed and unpaid, record Udhaar.
        // Simplified: Just record Advance as Jama. 
        if (advVal > 0) {
            onAddTransaction(selectedCustId, {
                id: uuidv4(),
                date,
                amount: advVal,
                type: 'JAMA',
                description: `Advance for Order: ${desc}`
            });
        }
        
        // Optionally, if we want to track the full amount as a receivable immediately:
        // onAddTransaction(selectedCustId, { ... type: 'UDHAAR', amount: orderVal ... })
        // But shopkeepers usually track order balance separately until delivery.
        // We will stick to prompt requirement: "udhar and jma amount of order".
        // Let's assume if there is remaining balance, it's effectively Udhaar but we only log it formally when user wants to.
        // For now, only logging the Advance payment is safe.
    }

    setDesc('');
    setAmount('');
    setAdvance('');
    setCustNameInput('');
    setSelectedCustId(null);
    setShowModal(false);
  };

  const handleStatusChange = (order: WorkOrder, newStatus: OrderStatus) => {
    const updated = { ...order, status: newStatus };
    onUpdateOrder(updated);
  };

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 text-white p-4 rounded-xl shadow-sm">
            <p className="text-slate-400 text-xs uppercase">Total Orders</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
            <p className="text-xs text-slate-400 mt-1">Value: ₹{stats.totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-orange-100 text-orange-800 p-4 rounded-xl shadow-sm border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
                <Clock size={16} />
                <p className="text-xs uppercase font-bold">Pending</p>
            </div>
            <h3 className="text-2xl font-bold">{stats.pending}</h3>
        </div>
        <div className="bg-blue-100 text-blue-800 p-4 rounded-xl shadow-sm border border-blue-200">
             <div className="flex items-center gap-2 mb-1">
                <Loader2 size={16} />
                <p className="text-xs uppercase font-bold">In Process</p>
            </div>
            <h3 className="text-2xl font-bold">{stats.process}</h3>
        </div>
        <div className="bg-green-100 text-green-800 p-4 rounded-xl shadow-sm border border-green-200">
             <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={16} />
                <p className="text-xs uppercase font-bold">Completed</p>
            </div>
            <h3 className="text-2xl font-bold">{stats.completed}</h3>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Order List</h2>
        <button 
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
            <Plus size={18} />
            New Order
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">{order.customerName}</h3>
                        <p className="text-xs text-slate-500">{order.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : ''}
                        ${order.status === 'IN_PROCESS' ? 'bg-blue-100 text-blue-700' : ''}
                        ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : ''}
                    `}>
                        {order.status.replace('_', ' ')}
                    </span>
                </div>
                <div className="p-4 flex-1">
                    <p className="text-slate-600 mb-4">{order.detail}</p>
                    <div className="flex justify-between items-end">
                        <div>
                             <p className="text-xs text-slate-400">Total Amount</p>
                             <p className="text-lg font-bold text-slate-800">₹{order.amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-xs text-slate-400">Advance/Jama</p>
                             <p className="text-lg font-bold text-green-600">₹{order.advance.toLocaleString()}</p>
                        </div>
                    </div>
                     <div className="mt-2 text-right">
                        <p className="text-xs text-slate-400">Remaining Udhaar</p>
                        <p className="text-sm font-bold text-red-600">₹{(order.amount - order.advance).toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-3 flex gap-2 border-t border-slate-100">
                    <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                        className="w-full text-sm p-2 bg-slate-700 text-white border border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROCESS">In Process</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>
        ))}
        {orders.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                No active work orders.
            </div>
        )}
      </div>

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Create Work Order</h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                        <Filter className="rotate-45" size={24} /> 
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="block text-sm text-slate-600 mb-1">Customer Name</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Type name to search..."
                            className="w-full p-2 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={custNameInput}
                            onChange={(e) => handleCustInputChange(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                        />
                        {showSuggestions && customerSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 shadow-lg rounded-b-lg max-h-40 overflow-y-auto z-10">
                                {customerSuggestions.map(c => (
                                    <div 
                                        key={c.id} 
                                        className="p-2 hover:bg-slate-50 cursor-pointer text-sm"
                                        onClick={() => selectSuggestion(c)}
                                    >
                                        <span className="font-bold">{c.name}</span> <span className="text-slate-400">({c.mobile})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-slate-600 mb-1">Work Detail</label>
                        <textarea 
                            rows={3}
                            required
                            placeholder="Describe work required..."
                            className="w-full p-2 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm text-slate-600 mb-1">Total Amount</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-600 mb-1">Advance Received (Jama)</label>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                value={advance}
                                onChange={(e) => setAdvance(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-600 mb-1">Date</label>
                            <input 
                                type="date" 
                                required
                                className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-600 mb-1">Status</label>
                            <select 
                                className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROCESS">In Process</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                        Create Order
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrders;