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
import { CustomerCommunications } from './CustomerCommunications';
import { InvoiceCreation } from './InvoiceCreation';
import { ConsignmentCreation } from './ConsignmentCreation';
import { useGems } from '../hooks/useGems';
import { useCustomers } from '../hooks/useCustomers';
import { useInvoices } from '../hooks/useInvoices';
import { useToast } from '@/hooks/use-toast';
import { Gem } from '../types/gem';
import { Customer } from '../types/customer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const Dashboard = () => {
  const { gems, loading, addGem, updateGem, deleteGem } = useGems();
  const { customers } = useCustomers();
  const { invoices } = useInvoices();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('analytics');
  const [showGemForm, setShowGemForm] = useState(false);
  const [editingGem, setEditingGem] = useState<Gem | null>(null);
  const [selectedCustomerForComms, setSelectedCustomerForComms] = useState<Customer | null>(null);
  const [invoiceGem, setInvoiceGem] = useState<Gem | null>(null);
  const [consignmentGem, setConsignmentGem] = useState<Gem | null>(null);

  const handleAddGem = async (gemData: any) => {
    const result = await addGem(gemData);
    if (result.success) {
      toast({
        title: "Success",
        description: "Gem added successfully",
      });
      setShowGemForm(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add gem",
        variant: "destructive",
      });
    }
  };

  const handleEditGem = async (gemData: any) => {
    if (!editingGem) return;
    
    const result = await updateGem(editingGem.id, gemData);
    if (result.success) {
      toast({
        title: "Success",
        description: "Gem updated successfully",
      });
      setShowGemForm(false);
      setEditingGem(null);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update gem",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this gem?')) {
      const result = await deleteGem(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Gem deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete gem",
          variant: "destructive",
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
    return (
      <div className="animate-fade-in">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setSelectedCustomerForComms(null)} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <CustomerCommunications customer={selectedCustomerForComms} />
      </div>
    );
  }

  if (showGemForm) {
    return (
      <div className="animate-fade-in">
        <GemForm
          gem={editingGem}
          onSubmit={editingGem ? handleEditGem : handleAddGem}
          onCancel={() => {
            setShowGemForm(false);
            setEditingGem(null);
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Diamond Business Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your diamond inventory and business operations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 lg:w-fit lg:grid-cols-7">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

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
          <GemTable
            gems={gems}
            onEdit={(gem) => {
              setEditingGem(gem);
              setShowGemForm(true);
            }}
            onDelete={handleDeleteGem}
            onAdd={() => setShowGemForm(true)}
            onCreateInvoice={handleCreateInvoice}
            onCreateConsignment={handleCreateConsignment}
          />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerDashboard 
            onCreateInvoice={(customer) => {
              setActiveTab('invoice-creation');
            }}
            onCreateConsignment={(customer) => {
              setActiveTab('consignment-creation');
            }}
          />
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
          <Card>
            <CardHeader>
              <CardTitle>Customer Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">Select a customer from the Customers tab</div>
                <div className="text-slate-500">Choose a customer to view their communication history</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice-creation" className="space-y-6">
          <InvoiceCreation 
            preselectedGem={invoiceGem}
            onCancel={() => {
              setInvoiceGem(null);
              setActiveTab('transactions');
            }}
            onSave={() => {
              setInvoiceGem(null);
              setActiveTab('transactions');
            }}
          />
        </TabsContent>

        <TabsContent value="consignment-creation" className="space-y-6">
          <ConsignmentCreation 
            preselectedGem={consignmentGem}
            onCancel={() => {
              setConsignmentGem(null);
              setActiveTab('transactions');
            }}
            onSave={() => {
              setConsignmentGem(null);
              setActiveTab('transactions');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
