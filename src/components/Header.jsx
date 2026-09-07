import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';

export default function Header({ activeTab, onOpenMobileMenu, user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeNavItem = NAV_ITEMS.find(item => item.id === activeTab) || NAV_ITEMS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs select-none">
      
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Title & Breadcrumb */}
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>PayFlow</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-600 font-semibold">{activeNavItem.label}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
            {activeNavItem.label}
          </h1>
        </div>
      </div>

      {/* Right: User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Notification Bell */}
        <button 
          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition relative cursor-pointer border border-slate-200/80"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition border border-slate-200/80 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800">{user?.name || 'Alex Vance'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name || 'Alex Vance'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@payflow.com'}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of PayFlow</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
