import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Layers, 
  Tag, 
  User, 
  Calendar, 
  CreditCard, 
  Clock, 
  Eye, 
  X, 
  AlertCircle, 
  DollarSign,
  Building,
  CheckCircle2
} from 'lucide-react';

export default function ProductsView({ products: propProducts, setProducts: propSetProducts }) {
  // Products State (Clean empty state)
  const [localProducts, setLocalProducts] = useState([]);

  const products = propProducts || localProducts;
  const setProducts = propSetProducts || setLocalProducts;

  // Search Query State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Add Product Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Software License',
    price: '',
    customer: '',
    saleDate: new Date().toISOString().split('T')[0],
    totalInstallments: '6'
  });

  const [formErrors, setFormErrors] = useState({});

  // Lock body scrolling when modal is open to prevent background movement
  useEffect(() => {
    if (isAddModalOpen || selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddModalOpen, selectedProduct]);

  // Currency Formatter in PKR
  const formatPKR = (num) => {
    return `Rs. ${Number(num || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Predefined Categories Options
  const categoriesList = [
    'Software License',
    'Add-On Module',
    'Infrastructure & Service',
    'Professional Services',
    'Hardware & Equipment'
  ];

  // Predefined Mock Customers for Dropdown Selection
  const customersList = [
    'Acme Corporation',
    'Starlight Tech Ltd.',
    'Apex Global Enterprises',
    'Vanguard Dynamics',
    'Horizon Logistics',
    'Nexus Cloud Systems'
  ];

  // Filter Products List based on search query
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.customer.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  // Calculate High-level Summary Metrics
  const totalSalesValue = products.reduce((sum, p) => sum + p.price, 0);
  const totalInstallmentCount = products.reduce((sum, p) => sum + p.totalInstallments, 0);

  // Form Input Change Handler
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
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.customer.trim()) errors.customer = 'Customer name is required';
    if (!formData.saleDate) errors.saleDate = 'Sale date is required';
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) <= 0) {
      errors.price = 'Valid product price is required';
    }
    if (!formData.totalInstallments || Number(formData.totalInstallments) <= 0) {
      errors.totalInstallments = 'Please select total installments';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit Handler
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const priceNum = Number(formData.price);
    const instCount = Number(formData.totalInstallments);

    // Format sale date nicely e.g. "Sep 07, 2026"
    const dateObj = new Date(formData.saleDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const newProduct = {
      id: `PRD-${1000 + products.length + 1}`,
      name: formData.name.trim(),
      category: formData.category,
      price: priceNum,
      customer: formData.customer.trim(),
      saleDate: formattedDate,
      totalInstallments: instCount,
      installmentPlan: `${instCount} Months Plan`,
      status: 'Active'
    };

    setProducts([newProduct, ...products]);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      category: 'Software License',
      price: '',
      customer: '',
      saleDate: new Date().toISOString().split('T')[0],
      totalInstallments: '6'
    });
  };

  // Live Auto-Calculation of Installment Amount in Form
  const formPriceNum = Number(formData.price) || 0;
  const formInstNum = Number(formData.totalInstallments) || 1;
  const formInstAmount = formPriceNum / formInstNum;

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Products
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage product sales catalog, customer assignments, and installment tenure plans
          </p>
        </div>

        {/* Add Product Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Product Sales</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{formatPKR(totalSalesValue)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Product Records</span>
            <p className="text-xl font-extrabold text-blue-600 mt-0.5">{products.length} Products</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Active Installments</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{totalInstallmentCount} Months</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Products Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Controls Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Product Sales Catalog
            </h3>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
              {filteredProducts.length} Items
            </span>
          </div>

          {/* Search Product Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Product, Category, Customer..."
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
                <th className="py-3.5 px-5">Product Name</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Customer</th>
                <th className="py-3.5 px-5">Product Price</th>
                <th className="py-3.5 px-5">Installment Amount</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const instAmount = p.price / (p.totalInstallments || 1);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition group">
                      
                      {/* Product Name & ID */}
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {p.id}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px]">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {p.category}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-5 font-semibold text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>{p.customer}</span>
                        </div>
                      </td>

                      {/* Product Price */}
                      <td className="py-3.5 px-5 font-extrabold text-slate-900 whitespace-nowrap">
                        {formatPKR(p.price)}
                      </td>

                      {/* Installment Amount & Tenure Badge */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="font-extrabold text-blue-600 text-sm">
                          {formatPKR(instAmount)} <span className="text-[10px] font-medium text-slate-400">/ mo</span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          {p.totalInstallments} Months Plan
                        </div>
                      </td>

                      {/* View Details Action */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedProduct(p)}
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
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* =========================================
          ADD PRODUCT MODAL FORM (React Portal)
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
                <h3 className="text-base font-bold text-slate-900">Add New Product Sale</h3>
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
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Enterprise ERP Core Suite"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                    formErrors.name ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.name}</p>
                )}
              </div>

              {/* Category & Customer Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  >
                    {categoriesList.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Assigned Customer <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer"
                    list="customers-options"
                    value={formData.customer}
                    onChange={handleInputChange}
                    placeholder="Type or select customer"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      formErrors.customer ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  <datalist id="customers-options">
                    {customersList.map((c, i) => (
                      <option key={i} value={c} />
                    ))}
                  </datalist>
                  {formErrors.customer && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.customer}</p>
                  )}
                </div>
              </div>

              {/* Price, Sale Date & Installments Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Product Price (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g. 300000"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      formErrors.price ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.price && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Sale Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="saleDate"
                    value={formData.saleDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Total Installments <span className="text-red-500">*</span>
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
              </div>

              {/* Calculated Monthly Installment Preview */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700">Calculated Installment Amount:</span>
                  <p className="text-[11px] text-slate-500">Monthly payment over {formInstNum} months</p>
                </div>
                <span className="text-sm font-extrabold text-blue-700">
                  {formatPKR(formInstAmount)} / mo
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
                  Save Product
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

      {/* =========================================
          VIEW PRODUCT DETAILS MODAL (React Portal)
         ========================================= */}
      {selectedProduct && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center border border-blue-400/30 shadow-md">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">{selectedProduct.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-blue-200 font-mono">{selectedProduct.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded border border-white/20 text-blue-100">
                      {selectedProduct.category}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-6">
              
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Price</span>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">{formatPKR(selectedProduct.price)}</p>
                </div>
                <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Installments</span>
                  <p className="text-sm font-extrabold text-blue-700 mt-1">{selectedProduct.totalInstallments} Months</p>
                </div>
                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Monthly Amount</span>
                  <p className="text-sm font-extrabold text-emerald-700 mt-1">{formatPKR(selectedProduct.price / selectedProduct.totalInstallments)}</p>
                </div>
              </div>

              {/* Assignment Information Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sale & Customer Details</h4>
                
                <div className="flex items-center justify-between text-xs text-slate-700 pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Assigned Customer:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" /> {selectedProduct.customer}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700 pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Sale Date:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {selectedProduct.saleDate}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="text-slate-500 font-medium">Tenure Plan:</span>
                  <span className="font-semibold text-blue-700">{selectedProduct.installmentPlan}</span>
                </div>
              </div>

              {/* Installment Plan Notice */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Product Plan Status:</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-full border border-blue-200">
                  {selectedProduct.status || 'Active Plan'}
                </span>
              </div>

              {/* Footer Close */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedProduct(null)}
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
