
import { useState } from 'react';
import { GemTable } from './GemTable';
import { GemForm } from './GemForm';
import { ConsignmentCreation } from './ConsignmentCreation';
import { InvoiceCreation } from './InvoiceCreation';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CustomerDashboard } from './CustomerDashboard';
import { TransactionDashboard } from './TransactionDashboard';
import { useGems } from '@/hooks/useGems';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { useConsignments } from '@/hooks/useConsignments';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, BarChart3, Users, Receipt, Package } from 'lucide-react';

type View = 'inventory' | 'analytics' | 'customers' | 'transactions' | 'gemCreation' | 'gemEdit' | 'invoiceCreation' | 'consignmentCreation';

export const Dashboard = () => {
  const { gems, loading, error, addGem, updateGem, deleteGem } = useGems();
  const { customers } = useCustomers();
  const { invoices } = useInvoices();
  const { consignments } = useConsignments();
  const [activeView, setActiveView] = useState<View>('inventory');
  const [selectedGem, setSelectedGem] = useState(null);
  const [selectedGemForInvoice, setSelectedGemForInvoice] = useState(null);
  const [selectedGemForConsignment, setSelectedGemForConsignment] = useState(null);

  // Navigation handlers
  const handleViewChange = (view: View) => {
    setActiveView(view);
    setSelectedGem(null);
    setSelectedGemForInvoice(null);
    setSelectedGemForConsignment(null);
  };

  const handleCreateGem = () => {
    setSelectedGem(null);
    setActiveView('gemCreation');
  };

  const handleEditGem = (gem) => {
    setSelectedGem(gem);
    setActiveView('gemEdit');
  };

  const handleDeleteGem = async (id) => {
    if (window.confirm('Are you sure you want to delete this gem?')) {
      const result = await deleteGem(id);
      if (result.success) {
        console.log('Gem deleted successfully');
      } else {
        alert(result.error || 'Failed to delete gem');
      }
    }
  };

  const handleCreateInvoice = (gem) => {
    setSelectedGemForInvoice(gem);
    setActiveView('invoiceCreation');
  };

  const handleCreateConsignment = (gem) => {
    setSelectedGemForConsignment(gem);
    setActiveView('consignmentCreation');
  };

  const handleGemSubmit = async (gemData) => {
    let result;
    if (selectedGem) {
      result = await updateGem(selectedGem.id, gemData);
    } else {
      result = await addGem(gemData);
    }

    if (result.success) {
      setActiveView('inventory');
      setSelectedGem(null);
    } else {
      alert(result.error || 'Failed to save gem');
    }
  };

  const handleCancel = () => {
    setActiveView('inventory');
    setSelectedGem(null);
    setSelectedGemForInvoice(null);
    setSelectedGemForConsignment(null);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'inventory':
        return 'Gem Inventory Dashboard';
      case 'analytics':
        return 'Analytics Dashboard';
      case 'customers':
        return 'Customer Management';
      case 'transactions':
        return 'Transaction History';
      case 'gemCreation':
        return 'Add New Gem';
      case 'gemEdit':
        return `Edit Gem - ${selectedGem?.stockId}`;
      case 'invoiceCreation':
        return 'Create Invoice';
      case 'consignmentCreation':
        return 'Create Consignment';
      default:
        return 'Dashboard';
    }
  };

  const navigationButtons = [
    { key: 'inventory', label: 'Inventory', icon: Package },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'transactions', label: 'Transactions', icon: Receipt },
  ];

  const isMainView = ['inventory', 'analytics', 'customers', 'transactions'].includes(activeView);

  return (
    <div className="container py-12">
      {/* Navigation Tabs */}
      {isMainView && (
        <div className="flex space-x-2 mb-6 border-b border-slate-200">
          {navigationButtons.map((nav) => (
            <Button
              key={nav.key}
              variant={activeView === nav.key ? "default" : "ghost"}
              onClick={() => handleViewChange(nav.key as View)}
              className="flex items-center space-x-2 rounded-b-none"
            >
              <nav.icon className="w-4 h-4" />
              <span>{nav.label}</span>
            </Button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {!isMainView && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          )}
          <h1 className="text-3xl font-bold text-slate-800">{getViewTitle()}</h1>
        </div>
        {activeView === 'inventory' && (
          <Button onClick={handleCreateGem} className="bg-diamond-gradient hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add New Gem
          </Button>
        )}
      </div>

      {loading && <div className="text-center">Loading gems...</div>}
      {error && <div className="text-red-500 text-center mb-4">Error: {error}</div>}

      {/* Main Dashboard Views */}
      {activeView === 'inventory' && !loading && (
        <GemTable
          gems={gems}
          onEdit={handleEditGem}
          onDelete={handleDeleteGem}
          onCreateInvoice={handleCreateInvoice}
          onCreateConsignment={handleCreateConsignment}
        />
      )}

      {activeView === 'analytics' && (
        <AnalyticsDashboard 
          gems={gems}
          customers={customers}
          invoices={invoices}
        />
      )}

      {activeView === 'customers' && (
        <CustomerDashboard />
      )}

      {activeView === 'transactions' && (
        <TransactionDashboard 
          invoices={invoices}
          consignments={consignments}
        />
      )}

      {/* Form Views */}
      {activeView === 'gemCreation' && (
        <GemForm
          onSubmit={handleGemSubmit}
          onCancel={handleCancel}
        />
      )}

      {activeView === 'gemEdit' && selectedGem && (
        <GemForm
          gem={selectedGem}
          onSubmit={handleGemSubmit}
          onCancel={handleCancel}
        />
      )}

      {activeView === 'invoiceCreation' && selectedGemForInvoice && (
        <InvoiceCreation
          gems={gems}
          onCancel={handleCancel}
          selectedGem={selectedGemForInvoice}
        />
      )}

      {activeView === 'consignmentCreation' && selectedGemForConsignment && (
        <ConsignmentCreation
          gems={gems}
          onCancel={handleCancel}
          selectedGem={selectedGemForConsignment}
        />
      )}
    </div>
  );
};
