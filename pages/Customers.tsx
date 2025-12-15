import React, { useState, useMemo } from 'react';
import { Customer, Transaction } from '../types';
import { Search, UserPlus, Phone, ArrowUpRight, ArrowDownLeft, X, Plus, Users, ClipboardList } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface CustomersProps {
  customers: Customer[];
  onAddCustomer: (c: Customer) => void;
  onAddTransaction: (cid: string, t: Transaction) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, onAddCustomer, onAddTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');

  // Transaction Form State
  const [transAmount, setTransAmount] = useState('');
  const [transDesc, setTransDesc] = useState('');
  const [transType, setTransType] = useState<'UDHAAR' | 'JAMA'>('UDHAAR');
  const [transDate, setTransDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.mobile.includes(searchTerm));
  }, [customers, searchTerm]);

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const getCustomerBalance = (c: Customer) => {
    return c.transactions.reduce((acc, t) => {
      return t.type === 'JAMA' ? acc + t.amount : acc - t.amount;
    }, 0);
  };

  const overallBalance = useMemo(() => {
    return customers.reduce((acc, c) => acc + getCustomerBalance(c), 0);
  }, [customers]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;
    const newCustomer: Customer = {
      id: uuidv4(),
      name: newCustName,
      mobile: newCustMobile,
      transactions: []
    };
    onAddCustomer(newCustomer);
    setNewCustName('');
    setNewCustMobile('');
    setShowAddModal(false);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !transAmount) return;
    
    const newTrans: Transaction = {
        id: uuidv4(),
        date: transDate,
        amount: parseFloat(transAmount),
        type: transType,
        description: transDesc
    };
    onAddTransaction(selectedCustomerId, newTrans);
    setTransAmount('');
    setTransDesc('');
    setTransType('UDHAAR'); // Reset to default
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Top Stats Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Customers</h2>
           <p className="text-slate-500 text-sm">{customers.length} Registered Customers</p>
        </div>
        <div className="flex items-center gap-4">
             <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Market Balance</span>
                <span className={`text-xl font-bold ${overallBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overallBalance >= 0 ? '+' : ''}₹{overallBalance.toLocaleString()}
                </span>
             </div>
             <button 
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
             >
                <UserPlus size={18} />
                <span>Add New</span>
             </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        {/* Left: Customer List */}
        <div className={`lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col ${selectedCustomerId ? 'hidden lg:flex' : 'flex h-full'}`}>
            <div className="p-4 border-b border-slate-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search name or mobile..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No customers found.</div>
                ) : (
                    filteredCustomers.map(customer => {
                        const balance = getCustomerBalance(customer);
                        return (
                            <div 
                                key={customer.id} 
                                onClick={() => setSelectedCustomerId(customer.id)}
                                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedCustomerId === customer.id ? 'bg-indigo-50' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                            <Phone size={12} />
                                            {customer.mobile || 'No Mobile'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {balance >= 0 ? '+' : ''}₹{Math.abs(balance).toLocaleString()}
                                        </span>
                                        <span className="block text-[10px] text-slate-400 uppercase mt-1">Balance</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        {/* Right: Customer Details & Transactions */}
        <div className={`lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col ${selectedCustomerId ? 'flex h-full' : 'hidden lg:flex'}`}>
            {selectedCustomer ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <button className="lg:hidden p-2 hover:bg-slate-200 rounded-full" onClick={() => setSelectedCustomerId(null)}>
                                <ArrowDownLeft size={20} className="rotate-45" />
                            </button>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{selectedCustomer.name}</h2>
                                <p className="text-sm text-slate-500">{selectedCustomer.mobile}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-xs text-slate-500 uppercase">Current Balance</p>
                             <p className={`text-2xl font-bold ${getCustomerBalance(selectedCustomer) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {getCustomerBalance(selectedCustomer) >= 0 ? '+' : ''}₹{Math.abs(getCustomerBalance(selectedCustomer)).toLocaleString()}
                             </p>
                        </div>
                    </div>

                    {/* Transaction List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                        {selectedCustomer.transactions.length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <ClipboardList size={48} className="mb-2 opacity-50" />
                                <p>No transactions yet</p>
                             </div>
                        ) : (
                            selectedCustomer.transactions.map((t) => (
                                <div key={t.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${t.type === 'JAMA' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {t.type === 'JAMA' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{t.description || (t.type === 'JAMA' ? 'Payment Received' : 'Credit Given')}</p>
                                            <p className="text-xs text-slate-400">{t.date}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${t.type === 'JAMA' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'JAMA' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Transaction Footer */}
                    <div className="p-4 bg-white border-t border-slate-200">
                        <form onSubmit={handleAddTransaction} className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setTransType('UDHAAR')}
                                    className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${transType === 'UDHAAR' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    🔴 GIVE UDHAAR (Debit)
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setTransType('JAMA')}
                                    className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${transType === 'JAMA' ? 'bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    🟢 ACCEPT JAMA (Credit)
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="date" 
                                    required
                                    className="w-1/3 p-2 bg-slate-700 text-white border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    value={transDate}
                                    onChange={(e) => setTransDate(e.target.value)}
                                />
                                <input 
                                    type="number" 
                                    placeholder="Amount (₹)" 
                                    required
                                    min="0"
                                    className="w-2/3 p-2 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                    value={transAmount}
                                    onChange={(e) => setTransAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Description / Item details..." 
                                    className="flex-1 p-2 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    value={transDesc}
                                    onChange={(e) => setTransDesc(e.target.value)}
                                />
                                <button type="submit" className="bg-slate-900 text-white p-2 rounded-md hover:bg-slate-800 transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Users size={64} className="mb-4 opacity-20" />
                    <p className="text-lg">Select a customer to view details</p>
                </div>
            )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Add New Customer</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleAddCustomer} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Customer Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-2 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g., Rajesh Kumar"
                            value={newCustName}
                            onChange={(e) => setNewCustName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Mobile Number</label>
                        <input 
                            type="tel" 
                            className="w-full p-2 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g., 9876543210"
                            value={newCustMobile}
                            onChange={(e) => setNewCustMobile(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                        Save Customer
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Customers;