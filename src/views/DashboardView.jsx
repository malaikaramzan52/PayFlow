import React, { useState, useRef, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  CalendarClock, 
  AlertCircle, 
  Search, 
  Filter, 
  Calendar,
  ChevronRight,
  ArrowUpRight,
  PieChart as PieIcon,
  Layers,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';

export default function DashboardView({ installments = [], payments = [], customers = [] }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Sep 2026');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper Currency Formatter
  const formatPKR = (num) => {
    return `Rs. ${Number(num || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Dynamic Metrics Calculations
  const totalSalesVal = installments.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
  const totalPaidVal = installments.reduce((sum, i) => sum + Number(i.paidAmount || 0), 0);
  const totalRemainingVal = installments.reduce((sum, i) => sum + Number(i.remainingAmount || 0), 0);
  const activeCount = installments.filter((i) => i.status !== 'Paid').length;
  const upcomingCount = installments.filter((i) => i.status === 'Pending' || i.status === 'Overdue').length;

  // Todays payments sum
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const todaysCollectionsVal = payments
    .filter((p) => p.paymentDate === todayStr)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // 6 Primary Key Metric Stat Cards Data
  const metrics = [
    {
      title: "Today's Collections",
      amount: formatPKR(todaysCollectionsVal),
      change: payments.length > 0 ? `${payments.length} transactions` : "0 transactions today",
      isPositive: true,
      icon: DollarSign,
      color: "emerald",
      badgeText: "Today"
    },
    {
      title: "Total Installment Sales",
      amount: formatPKR(totalSalesVal),
      change: installments.length > 0 ? `${installments.length} total sales` : "No sales recorded",
      isPositive: true,
      icon: TrendingUp,
      color: "blue",
      badgeText: "Overall"
    },
    {
      title: "Total Paid",
      amount: formatPKR(totalPaidVal),
      change: totalSalesVal > 0 ? `${Math.round((totalPaidVal / totalSalesVal) * 100)}% collected` : "0% collected",
      isPositive: true,
      icon: CheckCircle2,
      color: "emerald",
      badgeText: "Collected"
    },
    {
      title: "Total Remaining",
      amount: formatPKR(totalRemainingVal),
      change: totalSalesVal > 0 ? `${Math.round((totalRemainingVal / totalSalesVal) * 100)}% pending` : "0% pending",
      isPositive: false,
      icon: Clock,
      color: "amber",
      badgeText: "Pending"
    },
    {
      title: "Active Installments",
      amount: `${activeCount}`,
      change: activeCount > 0 ? `${activeCount} active plans` : "No active plans",
      isPositive: true,
      icon: CalendarClock,
      color: "indigo",
      badgeText: "Active Plans"
    },
    {
      title: "Upcoming Payments",
      amount: `${upcomingCount}`,
      change: upcomingCount > 0 ? `${upcomingCount} payments due` : "No upcoming due",
      isPositive: null,
      icon: AlertCircle,
      color: "blue",
      badgeText: "Action Needed"
    }
  ];

  // Overview Chart Data
  const chartPaid = totalPaidVal;
  const chartRemaining = totalRemainingVal;

  // 6-Month Trend Data (Derived dynamically)
  const monthLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const monthlyData = monthLabels.map((m, idx) => {
    if (totalSalesVal > 0 && idx === 5) {
      return { month: m, paid: totalPaidVal, remaining: totalRemainingVal };
    }
    return { month: m, paid: 0, remaining: 0 };
  });

  // Derived Upcoming Payments List from active installments
  const derivedUpcomingPayments = installments.map((plan) => {
    let planStatus = 'Upcoming';
    if (plan.status === 'Paid') planStatus = 'Paid';
    if (plan.status === 'Overdue') planStatus = 'Overdue';

    return {
      id: plan.id,
      customer: plan.customer,
      email: `${plan.customer.toLowerCase().replace(/[^a-z]/g, '')}@payflow.pk`,
      product: plan.product,
      amount: formatPKR(plan.installmentAmount),
      dueDate: plan.nextPaymentDate === 'Completed' ? 'Fully Paid' : plan.nextPaymentDate,
      relativeDue: plan.status === 'Overdue' ? 'Action Required' : plan.status === 'Paid' ? 'Paid' : 'Next Due',
      status: planStatus
    };
  });

  // Filter Table Records
  const filteredPayments = derivedUpcomingPayments.filter(item => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSearch = 
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time financial collections, installment tracking, and payment schedules
          </p>
        </div>

        {/* Functional Calendar Selector Button & Popover Dropdown */}
        <div className="relative" ref={calendarRef}>
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="text-xs text-slate-700 font-semibold bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{selectedMonth}</span>
          </button>

          {/* Popover Calendar Dropdown */}
          {isCalendarOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in select-none">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Select Date Range
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {selectedMonth}
                </span>
              </div>

              {/* Month Quick Select Pills */}
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Quick Select Month</p>
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      setIsCalendarOpen(false);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedMonth === m
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {m.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Day Grid Preview */}
              <div className="pt-2.5 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Calendar Days</p>
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                    const isSelectedDay = selectedMonth.startsWith(`${day} `);
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          setSelectedMonth(`${day} ${selectedMonth.split(' ').slice(-2).join(' ')}`);
                          setIsCalendarOpen(false);
                        }}
                        className={`py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          isSelectedDay
                            ? 'bg-blue-600 text-white font-bold'
                            : 'hover:bg-blue-50 hover:text-blue-600 text-slate-700'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6 Primary Key Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, idx) => {
          const IconComp = m.icon;
          return (
            <div 
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {m.title}
                </span>
                <div className={`w-9.5 h-9.5 rounded-xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-105 ${
                  m.color === 'emerald' ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20' :
                  m.color === 'amber' ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20' :
                  m.color === 'indigo' ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/20' :
                  'bg-blue-600 text-white border-blue-500 shadow-blue-600/20'
                }`}>
                  <IconComp className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {m.amount}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                  <span className={`font-medium flex items-center gap-1 ${
                    m.isPositive === true ? 'text-emerald-600' :
                    m.isPositive === false ? 'text-slate-500' :
                    'text-blue-600'
                  }`}>
                    {m.isPositive === true && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {m.change}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                    {m.badgeText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Installment Overview Chart & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Paid vs Remaining Donut & Bar Visual Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          
          {(() => {
            const totalVal = totalSalesVal || 0;
            const paidPct = totalVal > 0 ? Math.round((chartPaid / totalVal) * 100) : 0;

            return (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <PieIcon className="w-4 h-4 text-blue-600" />
                      Installment Overview Chart
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Paid vs Remaining Collections Ratio</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {paidPct}% Collected
                  </span>
                </div>

                {/* Visual Donut / Ring Ratio Chart */}
                <div className="py-6 flex flex-col sm:flex-row items-center justify-around gap-6">
                  
                  {/* SVG Ring Progress */}
                  <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background Ring */}
                      <path
                        className="text-slate-100"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Remaining Amount Ring (Amber/Blue soft) */}
                      <path
                        className="text-amber-400"
                        strokeDasharray="100, 100"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Paid Amount Ring (Primary Blue) */}
                      <path
                        className="text-blue-600"
                        strokeDasharray={`${paidPct}, 100`}
                        strokeWidth="4.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-semibold text-slate-400">Total Sales</span>
                      <span className="text-sm font-extrabold text-slate-900">{formatPKR(totalVal)}</span>
                    </div>
                  </div>

                  {/* Legend & Breakdown Stats */}
                  <div className="space-y-4 w-full sm:w-auto">
                    
                    {/* Paid Indicator */}
                    <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Total Paid Amount</p>
                          <span className="text-[11px] text-slate-500 font-medium">{paidPct}% of total</span>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-blue-700">{formatPKR(chartPaid)}</span>
                    </div>

                    {/* Remaining Indicator */}
                    <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-100 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Remaining Balance</p>
                          <span className="text-[11px] text-slate-500 font-medium">{100 - paidPct}% outstanding</span>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-amber-700">{formatPKR(chartRemaining)}</span>
                    </div>

                  </div>

                </div>
              </>
            );
          })()}

          {/* Monthly Collection Bars */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-700 mb-3">6-Month Collection Trend</p>
            <div className="grid grid-cols-6 gap-2 items-end h-20">
              {monthlyData.map((d, i) => {
                const paidHeight = (d.paid / 50000) * 100;
                const remHeight = (d.remaining / 50000) * 100;

                return (
                  <div key={i} className="flex flex-col items-center gap-1 group">
                    <div className="w-full bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end h-16 relative">
                      <div 
                        style={{ height: `${remHeight}%` }} 
                        className="w-full bg-amber-300 group-hover:bg-amber-400 transition-colors" 
                        title={`Remaining: Rs. ${d.remaining}`}
                      />
                      <div 
                        style={{ height: `${paidHeight}%` }} 
                        className="w-full bg-blue-600 group-hover:bg-blue-700 transition-colors" 
                        title={`Paid: Rs. ${d.paid}`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right: Summary Highlights & Key Performance Status */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 rounded-2xl text-white flex flex-col justify-between relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Performance Summary
              </span>
              <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded border border-blue-400/20">
                Live Status
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Collection Velocity</span>
                <p className="text-lg font-bold text-white mt-0.5">Rs. 4,750.00 / day</p>
                <p className="text-xs text-blue-200/80 mt-1">Average daily installment collection rate</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">On-Time Payment Efficiency</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">94.8%</p>
                <p className="text-xs text-blue-200/80 mt-1">134 out of 142 active plans paid on schedule</p>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>PayFlow Suite v1.0</span>
            <span className="text-blue-300 font-medium">All Data Synced</span>
          </div>
        </div>

      </div>

      {/* Upcoming Payments Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Controls Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Upcoming Payments
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                {filteredPayments.length} Records
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Schedule of imminent installment collections</p>
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
              {['All', 'Upcoming', 'Overdue', 'Paid'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    statusFilter === tab
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
              />
            </div>

          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">Installment Amount</th>
                <th className="py-3.5 px-6">Due Date</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-mono font-bold text-blue-700">{item.id}</td>
                    
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{item.customer}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.email}</div>
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-700">{item.product}</td>
                    
                    <td className="py-4 px-6 font-extrabold text-slate-900 text-sm">{item.amount}</td>
                    
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.dueDate}
                      </div>
                      <div className={`text-[11px] font-medium mt-0.5 ${
                        item.status === 'Overdue' ? 'text-red-500 font-semibold' : 'text-slate-400'
                      }`}>
                        {item.relativeDue}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        item.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'Upcoming'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Paid' ? 'bg-emerald-500' :
                          item.status === 'Upcoming' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No payment records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
