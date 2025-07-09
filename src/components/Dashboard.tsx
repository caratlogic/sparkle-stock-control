import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { GemTable } from './GemTable';
import { GemForm } from './GemForm';
import { CustomerDashboard } from './CustomerDashboard';
import { TransactionDashboard } from './TransactionDashboard';
import { PaymentDashboard } from './PaymentDashboard';
import { ReminderDashboard } from './ReminderDashboard';
import { CommunicationsDashboard } from './CommunicationsDashboard';
import { CreditNotesDashboard } from './CreditNotesDashboard';
import { InvoiceCreation } from './InvoiceCreation';
import { ConsignmentCreation } from './ConsignmentCreation';
import { useGems } from '../hooks/useGems';
import { useCustomers } from '../hooks/useCustomers';
import { useInvoices } from '../hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { Gem } from '../types/gem';
import { Customer } from '../types/customer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
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
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('analytics');
  const [showGemForm, setShowGemForm] = useState(false);
  const [editingGem, setEditingGem] = useState<Gem | null>(null);
  const [selectedCustomerForComms, setSelectedCustomerForComms] = useState<Customer | null>(null);
  const [invoiceGem, setInvoiceGem] = useState<Gem | null>(null);
  const [consignmentGem, setConsignmentGem] = useState<Gem | null>(null);
  const [invoiceCustomer, setInvoiceCustomer] = useState<Customer | null>(null);
  const [consignmentCustomer, setConsignmentCustomer] = useState<Customer | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchGems(), refetchCustomers(), refetchInvoices()]);
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
  return <div className="w-full min-h-screen space-y-6 animate-fade-in px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gems Business Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your diamond inventory and business operations</p>
        </div>
        <Button onClick={handleRefreshAll} disabled={isRefreshing} className="bg-blue-600 hover:bg-blue-700 text-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh All'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-slate-100 p-1 text-slate-600 min-w-max">
            <TabsTrigger value="analytics" className="whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm hover:bg-slate-50">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="inventory" className="whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm hover:bg-slate-50">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="customers" className="whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm hover:bg-slate-50">
              Customers
            </TabsTrigger>
            <TabsTrigger value="transactions" className="whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm hover:bg-slate-50">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="payments" className="whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm hover:bg-slate-50">
              Payments
            </TabsTrigger>
            <TabsTrigger value="reminders" className="whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm hover:bg-slate-50">
              Reminders
            </TabsTrigger>
            <TabsTrigger value="communications" className="whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm hover:bg-slate-50">
              Communications
            </TabsTrigger>
            <TabsTrigger value="credit-notes" className="whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm hover:bg-slate-50">
              Credit Notes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard gems={gems} customers={customers} invoices={invoices} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <GemTable gems={gems} onEdit={gem => {
          setEditingGem(gem);
          setShowGemForm(true);
        }} onDelete={handleDeleteGem} onAdd={() => setShowGemForm(true)} onCreateInvoice={handleCreateInvoice} onCreateConsignment={handleCreateConsignment} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerDashboard onCreateInvoice={customer => {
          setInvoiceCustomer(customer);
          setActiveTab('invoice-creation');
        }} onCreateConsignment={customer => {
          setConsignmentCustomer(customer);
          setActiveTab('consignment-creation');
        }} />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionDashboard />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentDashboard />
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <ReminderDashboard />
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <CommunicationsDashboard />
        </TabsContent>

        <TabsContent value="invoice-creation" className="space-y-6">
          <InvoiceCreation preselectedGem={invoiceGem} preselectedCustomer={invoiceCustomer} onCancel={() => {
          setInvoiceGem(null);
          setInvoiceCustomer(null);
          setActiveTab('transactions');
        }} onSave={() => {
          setInvoiceGem(null);
          setInvoiceCustomer(null);
          setActiveTab('transactions');
        }} />
        </TabsContent>

        <TabsContent value="consignment-creation" className="space-y-6">
          <ConsignmentCreation preselectedGem={consignmentGem} preselectedCustomer={consignmentCustomer} onCancel={() => {
          setConsignmentGem(null);
          setConsignmentCustomer(null);
          setActiveTab('transactions');
        }} onSave={() => {
          setConsignmentGem(null);
          setConsignmentCustomer(null);
          setActiveTab('transactions');
        }} />
        </TabsContent>

        <TabsContent value="credit-notes" className="space-y-6">
          <CreditNotesDashboard />
        </TabsContent>
      </Tabs>
    </div>;
};