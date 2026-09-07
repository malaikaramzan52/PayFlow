import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarClock,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Package,
  Calendar,
  Eye,
  X,
  AlertCircle,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Check,
  CreditCard
} from 'lucide-react';

export default function InstallmentsView({ installments: propInstallments, setInstallments: propSetInstallments }) {
  // Installments State (Clean empty state)
  const [localInstallments, setLocalInstallments] = useState([]);

  const installments = propInstallments || localInstallments;
  const setInstallments = propSetInstallments || setLocalInstallments;

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Paid' | 'Pending' | 'Overdue'

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Add Form State
  const [formData, setFormData] = useState({
    customer: '',
    product: '',
    totalAmount: '',
    totalInstallments: '6',
    paidInstallments: '0',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [formErrors, setFormErrors] = useState({});

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isAddModalOpen || selectedPlan) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddModalOpen, selectedPlan]);

  // Currency Formatter in PKR
  const formatPKR = (num) => {
    return `Rs. ${Number(num || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Predefined lists for dropdowns
  const customersList = [
    'Acme Corporation',
    'Starlight Tech Ltd.',
    'Apex Global Enterprises',
    'Vanguard Dynamics',
    'Horizon Logistics',
    'Nexus Cloud Systems'
  ];

  const productsList = [
    'Enterprise ERP Core Suite',
    'Payroll Automation System',
    'Dedicated Cloud Server & Support',
    'Fleet & Inventory Management Tool',
    'Custom API Integration Package'
  ];

  // Filtering Logic
  const filteredInstallments = installments.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.customer.toLowerCase().includes(q) ||
      item.product.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate High-level Summary Metrics
  const totalActivePlans = installments.length;
  const totalOutstandingBalance = installments.reduce((sum, item) => sum + item.remainingAmount, 0);
  const totalCollectedAmount = installments.reduce((sum, item) => sum + item.paidAmount, 0);
  const overduePlansCount = installments.filter((item) => item.status === 'Overdue').length;

  // Counts for status tabs
  const countPaid = installments.filter((i) => i.status === 'Paid').length;
  const countPending = installments.filter((i) => i.status === 'Pending').length;
  const countOverdue = installments.filter((i) => i.status === 'Overdue').length;

  // Form Input Change Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validation Handler
  const validateForm = () => {
    const errors = {};
    if (!formData.customer.trim()) errors.customer = 'Customer name is required';
    if (!formData.product.trim()) errors.product = 'Product name is required';
    if (!formData.totalAmount || isNaN(formData.totalAmount) || Number(formData.totalAmount) <= 0) {
      errors.totalAmount = 'Valid total amount is required';
    }
    if (!formData.startDate) errors.startDate = 'Start date is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add Form Submission
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const totalAmt = Number(formData.totalAmount);
    const totalInst = Number(formData.totalInstallments);
    const paidInst = Number(formData.paidInstallments);
    const remInst = totalInst - paidInst;
    const instAmount = totalAmt / totalInst;
    const paidAmt = instAmount * paidInst;
    const remAmt = totalAmt - paidAmt;

    // Build Schedule
    const startDateObj = new Date(formData.startDate);
    const schedule = [];

    for (let i = 1; i <= totalInst; i++) {
      const d = new Date(startDateObj);
      d.setMonth(d.getMonth() + (i - 1));
      const formattedDueDate = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

      let seqStatus = 'Pending';
      let paidDate = null;
      if (i <= paidInst) {
        seqStatus = 'Paid';
        paidDate = formattedDueDate;
      }

      schedule.push({
        seq: i,
        dueDate: formattedDueDate,
        amount: instAmount,
        status: seqStatus,
        paidDate: paidDate
      });
    }

    const nextSeq = schedule.find((s) => s.status === 'Pending' || s.status === 'Overdue');
    const nextDate = nextSeq ? nextSeq.dueDate : 'Completed';

    let initialStatus = 'Pending';
    if (remInst === 0) initialStatus = 'Paid';

    const newPlan = {
      id: `INS-${5000 + installments.length + 1}`,
      customer: formData.customer.trim(),
      product: formData.product.trim(),
      totalAmount: totalAmt,
      paidAmount: paidAmt,
      remainingAmount: remAmt,
      installmentAmount: instAmount,
      totalInstallments: totalInst,
      paidInstallments: paidInst,
      remainingInstallments: remInst,
      nextPaymentDate: nextDate,
      status: initialStatus,
      schedule: schedule
    };

    setInstallments([newPlan, ...installments]);
    setIsAddModalOpen(false);
    setFormData({
      customer: '',
      product: '',
      totalAmount: '',
      totalInstallments: '6',
      paidInstallments: '0',
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  // Calculations preview for modal form
  const formTotal = Number(formData.totalAmount) || 0;
  const formTotalInst = Number(formData.totalInstallments) || 1;
  const formPaidInst = Number(formData.paidInstallments) || 0;
  const formInstAmt = formTotal / formTotalInst;
  const formPaidAmt = formInstAmt * formPaidInst;
  const formRemAmt = formTotal - formPaidAmt;

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Installments
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track customer installment plans, payment schedules, and remaining balances
          </p>
        </div>

        {/* Add Installment Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Installment Plan</span>
        </button>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Active Plans</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalActivePlans}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Collected</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{formatPKR(totalCollectedAmount)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Outstanding Balance</span>
            <p className="text-xl font-extrabold text-blue-600 mt-0.5">{formatPKR(totalOutstandingBalance)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overdue Plans</span>
            <p className="text-xl font-extrabold text-rose-600 mt-0.5">{overduePlansCount} Plans</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Controls Header: Search & Status Tabs */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'All'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({installments.length})
            </button>

            <button
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'Pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${statusFilter === 'Pending' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                {countPending}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('Overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'Overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Overdue</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${statusFilter === 'Overdue' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'}`}>
                {countOverdue}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('Paid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'Paid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Paid</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${statusFilter === 'Paid' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                {countPaid}
              </span>
            </button>

          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Customer, Product, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>

        </div>

        {/* Streamlined Table (No Horizontal Scrolling) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Customer & Product</th>
                <th className="py-3.5 px-5">Financial Breakdown</th>
                <th className="py-3.5 px-5">Next Payment</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstallments.length > 0 ? (
                filteredInstallments.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                      
                      {/* Customer & Product */}
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{item.customer}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Package className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{item.product}</span>
                          <span className="font-mono text-slate-400 ml-1">({item.id})</span>
                        </div>
                      </td>

                      {/* Financial Breakdown (Total, Paid, Remaining) */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 text-xs">
                          {formatPKR(item.totalAmount)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2 font-medium">
                          <span className="text-emerald-700">Paid: {formatPKR(item.paidAmount)}</span>
                          <span>•</span>
                          <span className="text-slate-600">Rem: {formatPKR(item.remainingAmount)}</span>
                        </div>
                      </td>

                      {/* Next Payment Date & Monthly Amount */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="font-bold text-blue-600">
                          {formatPKR(item.installmentAmount)} <span className="text-[10px] font-medium text-slate-400">/ mo</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{item.nextPaymentDate}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          item.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {item.status === 'Paid' && <CheckCircle2 className="w-3 h-3" />}
                          {item.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {item.status === 'Overdue' && <AlertTriangle className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPlan(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs rounded-lg transition border border-slate-200 hover:border-blue-200 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Schedule</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No installment plans found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* =========================================
          ADD INSTALLMENT PLAN MODAL (React Portal)
         ========================================= */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Create New Installment Plan</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              
              {/* Customer & Product Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer"
                    list="inst-customers"
                    value={formData.customer}
                    onChange={handleInputChange}
                    placeholder="Type or select customer"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      formErrors.customer ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  <datalist id="inst-customers">
                    {customersList.map((c, i) => (
                      <option key={i} value={c} />
                    ))}
                  </datalist>
                  {formErrors.customer && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.customer}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Product / Service <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="product"
                    list="inst-products"
                    value={formData.product}
                    onChange={handleInputChange}
                    placeholder="Type or select product"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      formErrors.product ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  <datalist id="inst-products">
                    {productsList.map((p, i) => (
                      <option key={i} value={p} />
                    ))}
                  </datalist>
                  {formErrors.product && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.product}</p>
                  )}
                </div>
              </div>

              {/* Total Amount & Tenure */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Total Amount (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                    placeholder="e.g. 300000"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      formErrors.totalAmount ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.totalAmount && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.totalAmount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tenure Months <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="totalInstallments"
                    value={formData.totalInstallments}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  >
                    <option value="3">3 Months</option>
                    <option value="4">4 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="18">18 Months</option>
                    <option value="24">24 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Paid Months
                  </label>
                  <input
                    type="number"
                    name="paidInstallments"
                    min="0"
                    max={formData.totalInstallments}
                    value={formData.paidInstallments}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Plan Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              {/* Calculation Live Summary */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Monthly Rate:</span>
                  <span className="font-bold text-blue-700">{formatPKR(formInstAmt)} / mo</span>
                </div>
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Collected So Far:</span>
                  <span className="font-bold text-emerald-700">{formatPKR(formPaidAmt)}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-700 pt-1 border-t border-blue-100">
                  <span>Remaining Balance:</span>
                  <span className="font-extrabold text-slate-900">{formatPKR(formRemAmt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  Save Installment Plan
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

      {/* =========================================
          VIEW INSTALLMENT DETAILS MODAL (React Portal)
         ========================================= */}
      {selectedPlan && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center border border-blue-400/30 shadow-md">
                  <CalendarClock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-white">Installment Details</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-white/10 rounded border border-white/20 text-blue-200">
                      {selectedPlan.id}
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">{selectedPlan.customer} • {selectedPlan.product}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                {/* Current Status Badge */}
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                  selectedPlan.status === 'Paid'
                    ? 'bg-emerald-500 text-white'
                    : selectedPlan.status === 'Pending'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}>
                  {selectedPlan.status === 'Paid' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {selectedPlan.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                  {selectedPlan.status === 'Overdue' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {selectedPlan.status}
                </span>

                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Customer & Product Banner Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Details</span>
                  <p className="font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    {selectedPlan.customer}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Details</span>
                  <p className="font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                    {selectedPlan.product}
                  </p>
                </div>
              </div>

              {/* 11 Primary Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Amount</span>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">{formatPKR(selectedPlan.totalAmount)}</p>
                </div>
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Paid Amount</span>
                  <p className="text-xs font-extrabold text-emerald-700 mt-0.5">{formatPKR(selectedPlan.paidAmount)}</p>
                </div>
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Remaining Amount</span>
                  <p className="text-xs font-extrabold text-blue-700 mt-0.5">{formatPKR(selectedPlan.remainingAmount)}</p>
                </div>
                <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Installment Amount</span>
                  <p className="text-xs font-extrabold text-purple-700 mt-0.5">{formatPKR(selectedPlan.installmentAmount)}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Installments</span>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">{selectedPlan.totalInstallments} Months</p>
                </div>
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Paid Installments</span>
                  <p className="text-xs font-extrabold text-emerald-700 mt-0.5">{selectedPlan.paidInstallments} Months</p>
                </div>
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Remaining Installments</span>
                  <p className="text-xs font-extrabold text-amber-700 mt-0.5">{selectedPlan.totalInstallments - selectedPlan.paidInstallments} Months</p>
                </div>
                <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Next Payment Date</span>
                  <p className="text-xs font-extrabold text-indigo-700 mt-0.5">{selectedPlan.nextPaymentDate}</p>
                </div>
              </div>

              {/* Installment Tenure Progress Card */}
              {(() => {
                const modalProgressPct = Math.round((selectedPlan.paidInstallments / selectedPlan.totalInstallments) * 100);
                return (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 uppercase tracking-wider text-[10px]">Overall Progress</span>
                      <span className="text-blue-600 font-extrabold">{modalProgressPct}% Completed</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          selectedPlan.status === 'Paid'
                            ? 'bg-emerald-500'
                            : selectedPlan.status === 'Overdue'
                            ? 'bg-rose-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${modalProgressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Payment History Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Payment History</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    {selectedPlan.paidInstallments} of {selectedPlan.totalInstallments} Payments Made
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider sticky top-0 border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-4">Installment Number</th>
                        <th className="py-2.5 px-4">Payment Amount</th>
                        <th className="py-2.5 px-4">Payment Date</th>
                        <th className="py-2.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPlan.schedule.map((seq) => (
                        <tr key={seq.seq} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            Installment #{seq.seq}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-900">
                            {formatPKR(seq.amount)}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {seq.paidDate ? seq.paidDate : seq.dueDate}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              seq.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : seq.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {seq.status === 'Paid' && <CheckCircle2 className="w-3 h-3" />}
                              {seq.status === 'Pending' && <Clock className="w-3 h-3" />}
                              {seq.status === 'Overdue' && <AlertTriangle className="w-3 h-3" />}
                              {seq.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Close Details
                </button>
              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
