import React, { useMemo } from 'react';
import { AppState } from '../types';
import { Wallet, TrendingUp, TrendingDown, Users, AlertCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const stats = useMemo(() => {
    // Finance Calculations
    const totalIncome = state.finances
      .filter(f => f.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalExpense = state.finances
      .filter(f => f.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const netBalance = totalIncome - totalExpense;

    // Customer Calculations
    // Udhaar (Credit given) -> Negative Balance for customer, Asset for shop
    // Jama (Deposit received) -> Positive Balance for customer, Liability for shop
    // We display standard: Positive = Customer has money with us (Green). Negative = Customer owes us (Red).
    let totalCustomerReceivables = 0; // Money people owe us (Negative balances)
    let totalCustomerPayables = 0; // Money we owe people (Positive balances)

    state.customers.forEach(c => {
      const balance = c.transactions.reduce((acc, t) => {
        return t.type === 'JAMA' ? acc + t.amount : acc - t.amount;
      }, 0);
      if (balance < 0) totalCustomerReceivables += Math.abs(balance);
      else totalCustomerPayables += balance;
    });

    // Orders
    const activeOrders = state.orders.filter(o => o.status !== 'COMPLETED').length;

    return { totalIncome, totalExpense, netBalance, totalCustomerReceivables, activeOrders };
  }, [state]);

  const chartData = useMemo(() => {
      const data = [
          { name: 'Income', amount: stats.totalIncome, fill: '#16a34a' },
          { name: 'Expense', amount: stats.totalExpense, fill: '#dc2626' },
      ];
      return data;
  }, [stats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
          <p className="text-slate-500">Welcome back to your dashboard.</p>
        </div>
        <div className="text-right">
             <p className="text-sm text-slate-500">Total Shop Balance</p>
             <p className={`text-3xl font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{stats.netBalance.toLocaleString()}
             </p>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            label="Total Income" 
            value={`₹${stats.totalIncome.toLocaleString()}`} 
            icon={TrendingUp} 
            color="green" 
        />
        <StatCard 
            label="Total Expenses" 
            value={`₹${stats.totalExpense.toLocaleString()}`} 
            icon={TrendingDown} 
            color="red" 
        />
        <StatCard 
            label="Market Udhaar (To Collect)" 
            value={`₹${stats.totalCustomerReceivables.toLocaleString()}`} 
            subtext="Money customers owe you"
            icon={Wallet} 
            color="orange" 
        />
        <StatCard 
            label="Active Orders" 
            value={stats.activeOrders.toString()} 
            icon={AlertCircle} 
            color="blue" 
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Financial Overview</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{fontSize: 14}} width={80} />
                        <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => `₹${value.toLocaleString()}`} />
                        <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-semibold mb-4 text-slate-800">Quick Actions</h3>
             <div className="space-y-3">
                 <button onClick={() => window.location.hash = '#/customers'} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center gap-3 group">
                    <div className="bg-indigo-100 text-indigo-600 p-2 rounded-md group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Users size={18} />
                    </div>
                    <span className="font-medium text-slate-700">Add New Customer</span>
                 </button>
                 <button onClick={() => window.location.hash = '#/finances'} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center gap-3 group">
                    <div className="bg-green-100 text-green-600 p-2 rounded-md group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <TrendingUp size={18} />
                    </div>
                    <span className="font-medium text-slate-700">Record Income</span>
                 </button>
             </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;