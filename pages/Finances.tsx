import React, { useState, useMemo } from 'react';
import { FinanceEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TrendingUp, TrendingDown, Trash2, Calendar, Plus } from 'lucide-react';

interface FinancesProps {
  finances: FinanceEntry[];
  onAddEntry: (entry: FinanceEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const Finances: React.FC<FinancesProps> = ({ finances, onAddEntry, onDeleteEntry }) => {
  const [activeTab, setActiveTab] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  
  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const newEntry: FinanceEntry = {
      id: uuidv4(),
      date,
      amount: parseFloat(amount),
      type: activeTab,
      category: 'General', // Could be expanded
      description
    };

    onAddEntry(newEntry);
    setAmount('');
    setDescription('');
  };

  const totals = useMemo(() => {
    const income = finances.filter(f => f.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = finances.filter(f => f.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense, balance: income - expense };
  }, [finances]);

  const sortedFinances = useMemo(() => {
    return [...finances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [finances]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-green-700 uppercase">Total Income</p>
             <p className="text-2xl font-bold text-green-700">₹{totals.income.toLocaleString()}</p>
           </div>
           <div className="bg-white p-3 rounded-full shadow-sm text-green-600">
             <TrendingUp size={24} />
           </div>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-red-700 uppercase">Total Expenses</p>
             <p className="text-2xl font-bold text-red-700">₹{totals.expense.toLocaleString()}</p>
           </div>
           <div className="bg-white p-3 rounded-full shadow-sm text-red-600">
             <TrendingDown size={24} />
           </div>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-blue-700 uppercase">Net Balance</p>
             <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                ₹{totals.balance.toLocaleString()}
             </p>
           </div>
           <div className="bg-white p-3 rounded-full shadow-sm text-blue-600">
             <Calendar size={24} />
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Entry Form */}
        <div className="lg:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
           <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Entry</h2>
           
           <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
             <button 
                onClick={() => setActiveTab('INCOME')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'INCOME' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Income
             </button>
             <button 
                onClick={() => setActiveTab('EXPENSE')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'EXPENSE' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Expense
             </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm text-slate-600 mb-1">Date</label>
                <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
             </div>
             <div>
                <label className="block text-sm text-slate-600 mb-1">Amount (₹)</label>
                <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                />
             </div>
             <div>
                <label className="block text-sm text-slate-600 mb-1">Description</label>
                <textarea 
                    rows={3}
                    placeholder="Details about this entry..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
             </div>
             <button 
                type="submit" 
                className={`w-full py-3 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2 ${activeTab === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
             >
                <Plus size={20} />
                Add {activeTab === 'INCOME' ? 'Income' : 'Expense'}
             </button>
           </form>
        </div>

        {/* Transaction History */}
        <div className="lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Detail</th>
                            <th className="px-6 py-3 font-medium">Type</th>
                            <th className="px-6 py-3 font-medium text-right">Amount</th>
                            <th className="px-6 py-3 font-medium text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedFinances.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-slate-400">No records found.</td>
                            </tr>
                        ) : (
                            sortedFinances.map((entry) => (
                                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{entry.date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">{entry.description || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${entry.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {entry.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-bold text-right ${entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                        {entry.type === 'INCOME' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => onDeleteEntry(entry.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Finances;