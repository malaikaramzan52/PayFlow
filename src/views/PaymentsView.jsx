import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Package,
  Receipt,
  X,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Building,
  Clock
} from 'lucide-react';

export default function PaymentsView({
  payments = [],
  setPayments,
  installments = [],
  customers = [],
  onAddPayment
}) {
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Add Payment Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customer: '',
    productId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const [formErrors, setFormErrors] = useState({});

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isAddModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddModalOpen]);

  // Currency Formatter in PKR
  const formatPKR = (num) => {
    return `Rs. ${Number(num || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filtered Payments list by search query
  const filteredPayments = payments.filter((tx) => {
    const q = searchQuery.toLowerCase();
    return (
      tx.customer.toLowerCase().includes(q) ||
      tx.product.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q)
    );
  });

  // Calculate Summary Metrics
  const totalPaymentsCount = payments.length;
  const totalRevenueCollected = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const avgPaymentAmount = totalPaymentsCount > 0 ? totalRevenueCollected / totalPaymentsCount : 0;

  // Available Customers from Installments / Master list
  const availableCustomers = Array.from(new Set(installments.map((i) => i.customer)));

  // Available Products for selected Customer
  const customerPlans = installments.filter((i) => i.customer === formData.customer);

  // Handle Customer Select Change
  const handleCustomerChange = (e) => {
    const selectedCust = e.target.value;
    const matchingPlans = installments.filter((i) => i.customer === selectedCust);
    const defaultPlan = matchingPlans.length > 0 ? matchingPlans[0] : null;

    setFormData((prev) => ({
      ...prev,
      customer: selectedCust,
      productId: defaultPlan ? defaultPlan.id : '',
      amount: defaultPlan ? defaultPlan.installmentAmount.toFixed(2) : ''
    }));

    if (formErrors.customer) {
      setFormErrors((prev) => ({ ...prev, customer: null }));
    }
  };

  // Handle Product Select Change
  const handleProductChange = (e) => {
    const selectedPlanId = e.target.value;
    const plan = installments.find((i) => i.id === selectedPlanId);

    setFormData((prev) => ({
      ...prev,
      productId: selectedPlanId,
      amount: plan ? plan.installmentAmount.toFixed(2) : prev.amount
    }));

    if (formErrors.productId) {
      setFormErrors((prev) => ({ ...prev, productId: null }));
    }
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.customer) errors.customer = 'Please select a customer';
    if (!formData.productId) errors.productId = 'Please select a product/installment plan';
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      errors.amount = 'Valid payment amount is required';
    }
    if (!formData.paymentDate) errors.paymentDate = 'Payment date is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedPlan = installments.find((i) => i.id === formData.productId);
    const pAmt = Number(formData.amount);

    const nextSeqNum = selectedPlan ? Math.min(selectedPlan.totalInstallments, selectedPlan.paidInstallments + 1) : 1;
    const postRemAmt = selectedPlan ? Math.max(0, selectedPlan.remainingAmount - pAmt) : 0;

    // Format payment date nice string e.g. "Sep 07, 2026"
    const dateObj = new Date(formData.paymentDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const newPayment = {
      id: `PAY-${8000 + payments.length + 1}`,
      customer: formData.customer,
      product: selectedPlan ? selectedPlan.product : 'General Product',
      planId: selectedPlan ? selectedPlan.id : '',
      amount: pAmt,
      paymentDate: formattedDate,
      installmentSeq: nextSeqNum,
      totalInstallments: selectedPlan ? selectedPlan.totalInstallments : 6,
      remainingAmount: postRemAmt,
      status: 'Completed'
    };

    // Invoke cross-module handler
    if (onAddPayment) {
      onAddPayment(newPayment);
    } else {
      setPayments([newPayment, ...payments]);
    }

    setIsAddModalOpen(false);
    setFormData({
      customer: '',
      productId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0]
    });
  };

  // Preview calculations for modal
  const targetPlan = installments.find((i) => i.id === formData.productId);
  const currentRem = targetPlan ? targetPlan.remainingAmount : 0;
  const payAmt = Number(formData.amount) || 0;
  const previewRem = Math.max(0, currentRem - payAmt);

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Payments
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record customer installment collections, view payment receipts, and monitor revenue flow
          </p>
        </div>

        {/* Add Payment Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Payments Recorded</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalPaymentsCount} Transactions</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Revenue Collected</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{formatPKR(totalRevenueCollected)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Transaction</span>
            <p className="text-xl font-extrabold text-blue-600 mt-0.5">{formatPKR(avgPaymentAmount)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Controls Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Payment Transaction Ledger
            </h3>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
              {filteredPayments.length} Records
            </span>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Customer, Product, Transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Payments Table (Streamlined 6 Columns, No Horizontal Scroll) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Transaction & Customer</th>
                <th className="py-3.5 px-5">Product</th>
                <th className="py-3.5 px-5">Installment #</th>
                <th className="py-3.5 px-5">Payment Amount</th>
                <th className="py-3.5 px-5">Remaining Amount</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition group">
                    
                    {/* Transaction ID & Customer */}
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{tx.customer}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {tx.id}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span>{tx.product}</span>
                      </div>
                    </td>

                    {/* Installment Sequence */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100 text-[11px]">
                        Installment #{tx.installmentSeq} / {tx.totalInstallments}
                      </span>
                    </td>

                    {/* Payment Amount & Date */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-extrabold text-emerald-600 text-sm">
                        {formatPKR(tx.amount)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{tx.paymentDate}</span>
                      </div>
                    </td>

                    {/* Post-Payment Remaining Amount */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        {formatPKR(tx.remainingAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">after payment</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {tx.status || 'Completed'}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No payment records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* =========================================
          ADD PAYMENT MODAL FORM (React Portal)
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
                <h3 className="text-base font-bold text-slate-900">Record New Payment</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Select Customer */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleCustomerChange}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 ${
                    formErrors.customer ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                >
                  <option value="">-- Choose Customer --</option>
                  {availableCustomers.map((cName, idx) => (
                    <option key={idx} value={cName}>{cName}</option>
                  ))}
                </select>
                {formErrors.customer && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.customer}</p>
                )}
              </div>

              {/* Select Product / Installment Plan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Product / Plan <span className="text-red-500">*</span>
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleProductChange}
                  disabled={!formData.customer}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 ${
                    formErrors.productId ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  } ${!formData.customer ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <option value="">-- Choose Plan --</option>
                  {customerPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.product} ({plan.id}) — Rem: {formatPKR(plan.remainingAmount)}
                    </option>
                  ))}
                </select>
                {formErrors.productId && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.productId}</p>
                )}
              </div>

              {/* Payment Amount & Payment Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Payment Amount (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="e.g. 75000"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      formErrors.amount ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.amount && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Post-Payment Preview Summary */}
              {targetPlan && (
                <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Current Outstanding Balance:</span>
                    <span className="font-semibold text-slate-900">{formatPKR(currentRem)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Recording Payment Amount:</span>
                    <span className="font-bold text-emerald-600">{formatPKR(payAmt)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-blue-100 font-bold text-slate-800">
                    <span>New Remaining Balance:</span>
                    <span className="text-blue-700 font-extrabold">{formatPKR(previewRem)}</span>
                  </div>
                </div>
              )}

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
                  Record Payment
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
