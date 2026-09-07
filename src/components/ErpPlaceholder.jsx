import React from 'react';
import { LogOut, User, Shield, CheckCircle2, LayoutDashboard, Layers, Users, CreditCard, PieChart, FileText } from 'lucide-react';
import PayFlowLogo from './PayFlowLogo';

export default function ErpPlaceholder({ user, onLogout }) {
  const futureModules = [
    { name: 'Dashboard Overview', icon: LayoutDashboard, tag: 'Step 2' },
    { name: 'Payroll Management', icon: CreditCard, tag: 'Future Step' },
    { name: 'Employee Directory', icon: Users, tag: 'Future Step' },
    { name: 'Finance & Invoicing', icon: PieChart, tag: 'Future Step' },
    { name: 'Reports & Analytics', icon: FileText, tag: 'Future Step' },
    { name: 'System Settings', icon: Layers, tag: 'Future Step' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <PayFlowLogo size="md" lightMode={false} />

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-slate-200">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-none">{user.name}</span>
              <span className="text-[11px] font-medium text-slate-500 mt-1">{user.role}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-200 hover:border-red-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8 flex flex-col gap-8 my-auto">
        
        {/* Auth Success Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-10" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                  Step 1 Complete
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Welcome to PayFlow ERP Panel
                </h1>
              </div>
            </div>

            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" /> Active Session
            </span>
          </div>

          {/* User Profile Card Details */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Authenticated User</span>
              <p className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" /> {user.name}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
              <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                {user.email}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Role</span>
              <p className="text-sm font-semibold text-blue-700 mt-1">
                {user.role}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
            <p className="leading-relaxed">
              <strong>Step 1 Status:</strong> The login interface, design system tokens (White + Blue palette, typography, form validation, show/hide password toggle), and mock authentication flow are active. Dashboard and functional ERP modules will be added in upcoming steps.
            </p>
          </div>
        </div>

        {/* Future Modules Placeholder Grid */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">
            ERP Modules Placeholder (Upcoming Steps)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {futureModules.map((mod, idx) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs opacity-75 hover:opacity-100 transition flex flex-col justify-between h-32 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                      {mod.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{mod.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Module locked in Step 1</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400">
        © 2026 PayFlow Enterprise Resource Planning. All rights reserved.
      </footer>
    </div>
  );
}
