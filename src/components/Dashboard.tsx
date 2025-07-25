import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { GemTable } from './GemTable';
import { WeeklyStatsBox } from './WeeklyStatsBox';
import { GemForm } from './GemForm';
import { CustomerDashboard } from './CustomerDashboard';
import { TransactionDashboard } from './TransactionDashboard';
import { PaymentDashboard } from './PaymentDashboard';
import { ReminderDashboard } from './ReminderDashboard';
import { CommunicationsDashboard } from './CommunicationsDashboard';
import { CreditNotesDashboard } from './CreditNotesDashboard';
import { QRCodeManagement } from './QRCodeManagement';
import { PartnerDashboard } from './PartnerDashboard';
import { AssociatedEntitiesDashboard } from './AssociatedEntitiesDashboard';
import { TransactionTrackingDashboard } from './TransactionTrackingDashboard';
import { InvoiceCreation } from './InvoiceCreation';
import { ConsignmentCreation } from './ConsignmentCreation';
import { HelpSection } from './HelpSection';
import { ThemeSwitcher } from './ThemeSwitcher';
import { CaratLogicHomepage } from './CaratLogicHomepage';
import GemSettingsManagement from './GemSettingsManagement';
import { useGems } from '../hooks/useGems';
import { useCustomers } from '../hooks/useCustomers';
import { useInvoices } from '../hooks/useInvoices';
import { useConsignments } from '../hooks/useConsignments';
import { useCreditNotes } from '../hooks/useCreditNotes';
import { useInvoicePayments } from '../hooks/useInvoicePayments';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { useToast } from '@/hooks/use-toast';
import { Gem } from '../types/gem';
import { Customer } from '../types/customer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
export const Dashboard = () => {
  const {
    gems,
    loading,
    addGem,
    updateGem,
    deleteGem,
    refetch: refetchGems
  } = useGems();
  const {
    customers,
    refetch: refetchCustomers
  } = useCustomers();
  const {
    invoices,
    refetch: refetchInvoices
  } = useInvoices();
  const {
    consignments,
    refetch: refetchConsignments
  } = useConsignments();
  const {
    creditNotes,
    refetch: refetchCreditNotes
  } = useCreditNotes();
  const {
    payments,
    fetchPayments
  } = useInvoicePayments();

  // Auto-refresh when any data changes
  const handleAutoRefresh = () => {
    refetchGems();
    refetchCustomers();
    refetchInvoices();
    refetchConsignments();
    refetchCreditNotes();
    fetchPayments();
  };
  useAutoRefresh({
    onRefresh: handleAutoRefresh,
    tables: ['gems', 'customers', 'invoices', 'consignments', 'credit_notes', 'invoice_payments'],
    enabled: true
  });
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [showGemForm, setShowGemForm] = useState(false);
  const [editingGem, setEditingGem] = useState<Gem | null>(null);
  const [selectedCustomerForComms, setSelectedCustomerForComms] = useState<Customer | null>(null);
  const [invoiceGem, setInvoiceGem] = useState<Gem | null>(null);
  const [consignmentGem, setConsignmentGem] = useState<Gem | null>(null);
  const [invoiceCustomer, setInvoiceCustomer] = useState<Customer | null>(null);
  const [consignmentCustomer, setConsignmentCustomer] = useState<Customer | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchGems(), refetchCustomers(), refetchInvoices(), refetchConsignments(), refetchCreditNotes(), fetchPayments()]);
      toast({
        title: "Success",
        description: "All data refreshed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  const handleAddGem = async (gemData: any) => {
    const result = await addGem(gemData);
    if (result.success) {
      toast({
        title: "Success",
        description: "Gem added successfully"
      });
      setShowGemForm(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add gem",
        variant: "destructive"
      });
    }
  };
  const handleEditGem = async (gemData: any) => {
    if (!editingGem) return;
    const result = await updateGem(editingGem.id, gemData);
    if (result.success) {
      toast({
        title: "Success",
        description: "Gem updated successfully"
      });
      setShowGemForm(false);
      setEditingGem(null);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update gem",
        variant: "destructive"
      });
    }
  };
  const handleDeleteGem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this gem?')) {
      const result = await deleteGem(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Gem deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete gem",
          variant: "destructive"
        });
      }
    }
  };
  const handleCreateInvoice = (gem: Gem) => {
    setInvoiceGem(gem);
    setActiveTab('invoice-creation');
  };
  const handleCreateConsignment = (gem: Gem) => {
    setConsignmentGem(gem);
    setActiveTab('consignment-creation');
  };
  if (selectedCustomerForComms) {
    return <div className="animate-fade-in">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setSelectedCustomerForComms(null)} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div>Customer Communication View</div>
      </div>;
  }
  if (showGemForm) {
    return <div className="animate-fade-in">
        <GemForm gem={editingGem} onSubmit={editingGem ? handleEditGem : handleAddGem} onCancel={() => {
        setShowGemForm(false);
        setEditingGem(null);
      }} />
      </div>;
  }
  if (loading) {
    return <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>;
  }
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Mobile Sidebar Trigger */}
              <MobileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
              
              <div>
                <h1 className="text-2xl font-bold carat-heading">CaratLogic Dashboard</h1>
                <p className="text-muted-foreground text-sm">Professional Gem & Diamond Inventory Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Button onClick={() => setShowHelp(true)} variant="outline" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Help</span>
              </Button>
              <Button onClick={handleRefreshAll} disabled={isRefreshing} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh All'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className={`${activeTab === 'home' ? '' : 'p-6'} space-y-6 animate-fade-in`}>
            {activeTab === 'home' && (
              <CaratLogicHomepage />
            )}

            {activeTab === 'analytics' && (
              <Card className="carat-card">
                <CardHeader>
                  <CardTitle className="carat-heading">Business Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsDashboard gems={gems} customers={customers} invoices={invoices} />
                </CardContent>
              </Card>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <WeeklyStatsBox gems={gems} />
                <GemTable 
                  gems={gems} 
                  onEdit={gem => {
                    setEditingGem(gem);
                    setShowGemForm(true);
                  }} 
                  onDelete={handleDeleteGem} 
                  onAdd={() => setShowGemForm(true)} 
                  onCreateInvoice={handleCreateInvoice} 
                  onCreateConsignment={handleCreateConsignment} 
                />
              </div>
            )}

            {activeTab === 'customers' && (
              <CustomerDashboard 
                onCreateInvoice={customer => {
                  setInvoiceCustomer(customer);
                  setActiveTab('invoice-creation');
                }} 
                onCreateConsignment={customer => {
                  setConsignmentCustomer(customer);
                  setActiveTab('consignment-creation');
                }} 
              />
            )}

            {activeTab === 'transactions' && <TransactionDashboard />}

            {activeTab === 'payments' && <PaymentDashboard />}

            {activeTab === 'reminders' && <ReminderDashboard />}

            {activeTab === 'communications' && <CommunicationsDashboard />}

            {activeTab === 'partners' && <PartnerDashboard />}

            {activeTab === 'associated-entities' && <AssociatedEntitiesDashboard />}

            {activeTab === 'transaction-tracking' && <TransactionTrackingDashboard />}

            {activeTab === 'invoice-creation' && (
              <InvoiceCreation 
                preselectedGem={invoiceGem} 
                preselectedCustomer={invoiceCustomer} 
                onCancel={() => {
                  setInvoiceGem(null);
                  setInvoiceCustomer(null);
                  setActiveTab('transactions');
                }} 
                onSave={() => {
                  setInvoiceGem(null);
                  setInvoiceCustomer(null);
                  setActiveTab('transactions');
                }} 
              />
            )}

            {activeTab === 'consignment-creation' && (
              <ConsignmentCreation 
                preselectedGem={consignmentGem} 
                preselectedCustomer={consignmentCustomer} 
                onCancel={() => {
                  setConsignmentGem(null);
                  setConsignmentCustomer(null);
                  setActiveTab('transactions');
                }} 
                onSave={() => {
                  setConsignmentGem(null);
                  setConsignmentCustomer(null);
                  setActiveTab('transactions');
                }} 
              />
            )}

            {activeTab === 'credit-notes' && <CreditNotesDashboard />}

            {activeTab === 'qr-codes' && <QRCodeManagement gems={gems} />}

            {activeTab === 'gem-settings' && <GemSettingsManagement />}
          </div>
        </div>
      </div>

      {showHelp && (
        <HelpSection onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
};