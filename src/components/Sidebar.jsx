import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  CalendarClock, 
  CreditCard, 
  X, 
  LogOut, 
  ChevronRight,
  Shield
} from 'lucide-react';
import PayFlowLogo from './PayFlowLogo';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & Key Metrics' },
  { id: 'customers', label: 'Customers', icon: Users, description: 'Client & Account Management' },
  { id: 'products', label: 'Products', icon: Package, description: 'Inventory & Service Catalog' },
  { id: 'installments', label: 'Installments', icon: CalendarClock, description: 'Payment Plans & Schedules' },
  { id: 'payments', label: 'Payments', icon: CreditCard, description: 'Transactions & Invoices' },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose, user, onLogout }) {
  
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose(); // Close mobile drawer when a link is clicked
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white select-none">
      
      {/* Sidebar Header with PayFlow Logo */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <PayFlowLogo size="md" lightMode={false} />
        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Label */}
      <div className="px-6 pt-6 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-500/30 text-white' 
                    : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </div>

              <ChevronRight className={`w-4 h-4 transition-transform ${
                isActive ? 'text-white opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'
              }`} />
            </button>
          );
        })}
      </nav>

      <div className="p-4" />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Pinned Left) */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 flex-col fixed inset-y-0 left-0 z-30 bg-white shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Off-Canvas Drawer Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Mobile / Tablet Off-Canvas Drawer Panel */}
      <aside className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>
    </>
  );
}
