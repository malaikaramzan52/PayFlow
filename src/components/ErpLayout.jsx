import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardView from '../views/DashboardView';
import CustomersView from '../views/CustomersView';
import ProductsView from '../views/ProductsView';
import InstallmentsView from '../views/InstallmentsView';
import PaymentsView from '../views/PaymentsView';

export default function ErpLayout({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Master ERP Data State (Starts completely clean with empty lists)
  const [installments, setInstallments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Handler for adding a new payment & updating cross-module state
  const handleAddPayment = (newPayment) => {
    const pAmt = Number(newPayment.amount);
    const pDate = newPayment.paymentDate;

    // 1. Add to payments list
    setPayments((prev) => [newPayment, ...prev]);

    // 2. Update matching installment plan
    setInstallments((prev) =>
      prev.map((plan) => {
        if (plan.customer === newPayment.customer && (plan.product === newPayment.product || plan.id === newPayment.planId)) {
          const newPaidAmt = plan.paidAmount + pAmt;
          const newRemAmt = Math.max(0, plan.totalAmount - newPaidAmt);
          const newPaidInst = Math.min(plan.totalInstallments, plan.paidInstallments + 1);
          const newRemInst = Math.max(0, plan.totalInstallments - newPaidInst);

          // Update Schedule items
          let seqFound = false;
          const updatedSchedule = plan.schedule.map((item) => {
            if (!seqFound && (item.status === 'Pending' || item.status === 'Overdue')) {
              seqFound = true;
              return { ...item, status: 'Paid', paidDate: pDate };
            }
            return item;
          });

          // Calculate Next Payment Date
          const nextPending = updatedSchedule.find((item) => item.status === 'Pending' || item.status === 'Overdue');
          const nextDate = nextPending ? nextPending.dueDate : 'Completed';

          // Status
          let updatedStatus = 'Pending';
          if (newRemInst === 0) {
            updatedStatus = 'Paid';
          } else if (updatedSchedule.some((item) => item.status === 'Overdue')) {
            updatedStatus = 'Overdue';
          }

          return {
            ...plan,
            paidAmount: newPaidAmt,
            remainingAmount: newRemAmt,
            paidInstallments: newPaidInst,
            remainingInstallments: newRemInst,
            nextPaymentDate: nextDate,
            status: updatedStatus,
            schedule: updatedSchedule
          };
        }
        return plan;
      })
    );

    // 3. Update matching Customer
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.name === newPayment.customer) {
          const updatedPaid = c.totalPaid + pAmt;
          const updatedRem = Math.max(0, c.totalPurchase - updatedPaid);
          return {
            ...c,
            totalPaid: updatedPaid,
            remainingAmount: updatedRem,
            status: updatedRem === 0 ? 'Completed' : c.status
          };
        }
        return c;
      })
    );
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView installments={installments} payments={payments} customers={customers} />;
      case 'customers':
        return <CustomersView customers={customers} setCustomers={setCustomers} />;
      case 'products':
        return <ProductsView products={products} setProducts={setProducts} installments={installments} setInstallments={setInstallments} />;
      case 'installments':
        return <InstallmentsView installments={installments} setInstallments={setInstallments} />;
      case 'payments':
        return (
          <PaymentsView
            payments={payments}
            setPayments={setPayments}
            installments={installments}
            customers={customers}
            onAddPayment={handleAddPayment}
          />
        );
      default:
        return <DashboardView installments={installments} payments={payments} customers={customers} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none">
      
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen transition-all duration-300">
        
        {/* Top Sticky Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          user={user}
          onLogout={onLogout}
        />

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

    </div>
  );
}
