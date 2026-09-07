import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  X, 
  Eye, 
  Plus, 
  AlertCircle,
  FileText,
  Calendar,
  Building,
  CreditCard
} from 'lucide-react';

export default function CustomersView({ customers: propCustomers, setCustomers: propSetCustomers }) {
  // Customers State (Clean empty state)
  const [localCustomers, setLocalCustomers] = useState([]);

  const customers = propCustomers || localCustomers;
  const setCustomers = propSetCustomers || setLocalCustomers;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Lock body scrolling when modal is open to prevent background movement
  useEffect(() => {
    if (isAddModalOpen || selectedCustomer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddModalOpen, selectedCustomer]);

  // Form State for Add Customer
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    totalPurchase: '',
    totalPaid: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Helper for Number Formatting in PKR
  const formatPKR = (num) => {
    return `Rs. ${Number(num || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filter Customers List based on search query (Name, Phone, Address)
  const filteredCustomers = customers.filter((cust) => {
    const q = searchQuery.toLowerCase();
    return (
      cust.name.toLowerCase().includes(q) ||
      cust.phone.toLowerCase().includes(q) ||
      cust.address.toLowerCase().includes(q) ||
      cust.id.toLowerCase().includes(q)
    );
  });

  // Calculate Overall Summary Stats
  const grandTotalPurchases = customers.reduce((sum, c) => sum + c.totalPurchase, 0);
  const grandTotalPaid = customers.reduce((sum, c) => sum + c.totalPaid, 0);
  const grandTotalRemaining = grandTotalPurchases - grandTotalPaid;

  // Handle Add Customer Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Customer name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (formData.totalPurchase === '' || isNaN(formData.totalPurchase) || Number(formData.totalPurchase) < 0) {
      errors.totalPurchase = 'Valid total purchase amount is required';
    }
    if (formData.totalPaid === '' || isNaN(formData.totalPaid) || Number(formData.totalPaid) < 0) {
      errors.totalPaid = 'Valid total paid amount is required';
    } else if (Number(formData.totalPaid) > Number(formData.totalPurchase)) {
      errors.totalPaid = 'Total paid cannot exceed total purchase amount';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Add Customer Form Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const purchase = Number(formData.totalPurchase);
    const paid = Number(formData.totalPaid);
    const remaining = purchase - paid;

    const newCust = {
      id: `CUST-${1000 + customers.length + 1}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      totalPurchase: purchase,
      totalPaid: paid,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: remaining <= 0 ? 'Paid' : 'Pending'
    };

    setCustomers([newCust, ...customers]);
    setIsAddModalOpen(false);
    setFormData({ name: '', phone: '', address: '', totalPurchase: '', totalPaid: '' });
  };

  // Calculated Remaining for live form preview
  const formPurchaseNum = Number(formData.totalPurchase) || 0;
  const formPaidNum = Number(formData.totalPaid) || 0;
  const formRemainingNum = Math.max(0, formPurchaseNum - formPaidNum);

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Customers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage client profiles, purchase records, and outstanding installment balances
          </p>
        </div>

        {/* Add Customer Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Quick Financial Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Customer Purchases</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{formatPKR(grandTotalPurchases)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Amount Collected</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{formatPKR(grandTotalPaid)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Outstanding Balance</span>
            <p className="text-xl font-extrabold text-amber-600 mt-0.5">{formatPKR(grandTotalRemaining)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Customers List Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Customer Directory
            </h3>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
              {filteredCustomers.length} Total
            </span>
          </div>

          {/* Search Customer Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Name, Phone, Address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Customer Name</th>
                <th className="py-3.5 px-6">Phone Number</th>
                <th className="py-3.5 px-6">Address</th>
                <th className="py-3.5 px-6">Total Purchase</th>
                <th className="py-3.5 px-6">Total Paid</th>
                <th className="py-3.5 px-6">Remaining Amount</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => {
                  const remaining = cust.totalPurchase - cust.totalPaid;
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition group">
                      
                      {/* Name & ID */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {cust.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {cust.id}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-6 font-medium text-slate-700">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cust.phone}</span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-4 px-6 text-slate-600 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{cust.address}</span>
                        </div>
                      </td>

                      {/* Total Purchase */}
                      <td className="py-4 px-6 font-extrabold text-slate-900 whitespace-nowrap">
                        {formatPKR(cust.totalPurchase)}
                      </td>

                      {/* Total Paid */}
                      <td className="py-4 px-6 font-extrabold text-emerald-600 whitespace-nowrap">
                        {formatPKR(cust.totalPaid)}
                      </td>

                      {/* Remaining Amount */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className={`font-extrabold ${remaining > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {formatPKR(remaining)}
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                          remaining <= 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {remaining <= 0 ? 'Fully Paid' : 'Pending'}
                        </span>
                      </td>

                      {/* View Details Action */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs rounded-lg transition border border-slate-200 hover:border-blue-200 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No customer records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* =========================================
          ADD CUSTOMER MODAL FORM (React Portal)
         ========================================= */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Add New Customer</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Acme Enterprises or Muhammad Ali"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    formErrors.name ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.name}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +92 300 1234567"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    formErrors.phone ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. Plot 12, Main Boulevard, Gulberg III, Lahore"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    formErrors.address ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {formErrors.address && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.address}</p>
                )}
              </div>

              {/* Financial Inputs: Total Purchase & Total Paid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Total Purchase (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalPurchase"
                    value={formData.totalPurchase}
                    onChange={handleInputChange}
                    placeholder="e.g. 150000"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      formErrors.totalPurchase ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.totalPurchase && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.totalPurchase}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Total Paid (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalPaid"
                    value={formData.totalPaid}
                    onChange={handleInputChange}
                    placeholder="e.g. 100000"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      formErrors.totalPaid ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.totalPaid && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.totalPaid}</p>
                  )}
                </div>
              </div>

              {/* Remaining Amount Live Preview */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Calculated Remaining Amount:</span>
                <span className="text-sm font-extrabold text-blue-700">
                  {formatPKR(formRemainingNum)}
                </span>
              </div>

              {/* Modal Actions */}
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
                  Save Customer
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

      {/* =========================================
          VIEW CUSTOMER DETAILS MODAL (React Portal)
         ========================================= */}
      {selectedCustomer && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            
            {/* Customer Details Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center border border-blue-400/30 shadow-md">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-blue-200 font-mono mt-0.5">{selectedCustomer.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-6">
              
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Purchase</span>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">{formatPKR(selectedCustomer.totalPurchase)}</p>
                </div>
                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Total Paid</span>
                  <p className="text-sm font-extrabold text-emerald-700 mt-1">{formatPKR(selectedCustomer.totalPaid)}</p>
                </div>
                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Remaining</span>
                  <p className="text-sm font-extrabold text-amber-700 mt-1">{formatPKR(selectedCustomer.totalPurchase - selectedCustomer.totalPaid)}</p>
                </div>
              </div>

              {/* Contact Information Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Contact Information</h4>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-semibold">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{selectedCustomer.address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Customer Since: {selectedCustomer.joinedDate}</span>
                </div>
              </div>

              {/* Account Status Indicator */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Current Payment Status:</span>
                <span className={`px-3 py-1 rounded-full font-bold border ${
                  selectedCustomer.totalPurchase - selectedCustomer.totalPaid <= 0
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}>
                  {selectedCustomer.totalPurchase - selectedCustomer.totalPaid <= 0 ? 'Clear / Fully Paid' : 'Outstanding Balance'}
                </span>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedCustomer(null)}
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
