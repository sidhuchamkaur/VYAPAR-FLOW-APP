import React, { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, IndianRupee, ClipboardList, Settings, Menu, X } from 'lucide-react';
import { ShopSettings } from '../types';

interface LayoutProps {
  children: ReactNode;
  settings: ShopSettings;
}

const Layout: React.FC<LayoutProps> = ({ children, settings }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: IndianRupee, label: 'Income & Expense', path: '/finances' },
    { icon: ClipboardList, label: 'Work Orders', path: '/orders' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold truncate">{settings.shopName || 'VyaparFlow'}</h1>
          <p className="text-xs text-slate-400 mt-1 truncate">{settings.ownerName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 text-xs text-center text-slate-500">
          v1.0.0 • Offline Ready
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-20">
          <span className="font-bold">{settings.shopName || 'VyaparFlow'}</span>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 bg-slate-900/95 z-10 pt-20 px-4">
            <nav className="space-y-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-4 rounded-lg text-lg ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-slate-300'
                    }`
                  }
                >
                  <item.icon size={24} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;