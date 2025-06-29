
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  FileText, 
  Handshake,
  CreditCard,
  BarChart3
} from 'lucide-react';
import { GemTable } from './GemTable';
import { CustomerTable } from './CustomerTable';
import { InvoiceCreation } from './InvoiceCreation';
import { ConsignmentCreation } from './ConsignmentCreation';
import { TransactionDashboard } from './TransactionDashboard';
import { CustomerCommunications } from './CustomerCommunications';
import { PaymentDashboard } from './PaymentDashboard';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ActivityLog } from './ActivityLog';
import { ReminderDashboard } from './ReminderDashboard';
import { useGems } from '../hooks/useGems';
import { useCustomers } from '../hooks/useCustomers';
import { useInvoices } from '../hooks/useInvoices';
import { toast } from 'sonner';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInvoiceCreation, setShowInvoiceCreation] = useState(false);
  const [showConsignmentCreation, setShowConsignmentCreation] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [preselectedGem, setPreselectedGem] = useState(null);

  // Hooks for data management
  const { gems, updateGem, deleteGem, refetch: refetchGems } = useGems();
  const { customers, refetch: refetchCustomers } = useCustomers();
  const { invoices, refetch: refetchInvoices } = useInvoices();

  // Gem handlers
  const handleEditGem = (gem) => {
    toast.info('Gem editing feature coming soon');
  };

  const handleDeleteGem = async (id) => {
    const result = await deleteGem(id);
    if (result.success) {
      toast.success('Gem deleted successfully');
    } else {
      toast.error('Failed to delete gem');
    }
  };

  const handleCreateInvoiceFromGem = (gem) => {
    setPreselectedGem(gem);
    setShowInvoiceCreation(true);
  };

  const handleCreateConsignmentFromGem = (gem) => {
    setPreselectedGem(gem);
    setShowConsignmentCreation(true);
  };

  // Customer handlers
  const handleEditCustomer = (customer) => {
    toast.info('Customer editing feature coming soon');
  };

  const handleDeleteCustomer = (id) => {
    toast.info('Customer deletion feature coming soon');
  };

  const handleUpdateDiscount = async (customerId, discount) => {
    toast.info('Discount update feature coming soon');
  };

  const handleCommunicateWithCustomer = (customer) => {
    setSelectedCustomer(customer);
    setActiveTab('communications');
  };

  const handleCreateInvoiceFromCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowInvoiceCreation(true);
  };

  const handleCreateConsignmentFromCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowConsignmentCreation(true);
  };

  if (showInvoiceCreation) {
    return (
      <InvoiceCreation
        onCancel={() => {
          setShowInvoiceCreation(false);
          setPreselectedGem(null);
          setSelectedCustomer(null);
        }}
        onSave={() => {
          setShowInvoiceCreation(false);
          setPreselectedGem(null);
          setSelectedCustomer(null);
        }}
        preselectedGem={preselectedGem}
        preselectedCustomer={selectedCustomer}
      />
    );
  }

  if (showConsignmentCreation) {
    return (
      <ConsignmentCreation
        onCancel={() => {
          setShowConsignmentCreation(false);
          setPreselectedGem(null);
          setSelectedCustomer(null);
        }}
        onSave={() => {
          setShowConsignmentCreation(false);
          setPreselectedGem(null);
          setSelectedCustomer(null);
        }}
        preselectedGem={preselectedGem}
        preselectedCustomer={selectedCustomer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Diamond Inventory Management
          </h1>
          <p className="text-slate-600">
            Manage your precious stone inventory with precision and elegance
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 bg-white shadow-sm h-auto p-1 rounded-lg border">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="inventory" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Customers</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger 
              value="communications" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 transition-colors"
            >
              <Handshake className="w-4 h-4" />
              <span className="hidden sm:inline">Communications</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reminders" 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:text-slate-900 transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Reminders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                  <DollarSign className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,450,000</div>
                  <p className="text-xs opacity-80">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs opacity-80">+8% from last month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Items in Stock</CardTitle>
                  <Package className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3,456</div>
                  <p className="text-xs opacity-80">+15% from last month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$156,400</div>
                  <p className="text-xs opacity-80">+23% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setShowInvoiceCreation(true)}
                    className="w-full justify-start bg-diamond-gradient hover:opacity-90"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create New Invoice
                  </Button>
                  <Button 
                    onClick={() => setShowConsignmentCreation(true)}
                    className="w-full justify-start bg-emerald-gradient hover:opacity-90"
                  >
                    <Handshake className="w-4 h-4 mr-2" />
                    Create New Consignment
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('inventory')}
                    className="w-full justify-start" 
                    variant="outline"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Manage Inventory
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('customers')}
                    className="w-full justify-start" 
                    variant="outline"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Customers
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Invoice #INV-2024-156 paid by John Smith</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm">New customer Sarah Johnson added</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Diamond D001 status updated to Reserved</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-sm">Consignment CON-2024-045 created</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <GemTable 
              gems={gems}
              onEdit={handleEditGem}
              onDelete={handleDeleteGem}
              onCreateInvoice={handleCreateInvoiceFromGem}
              onCreateConsignment={handleCreateConsignmentFromGem}
            />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerTable 
              customers={customers}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
              onUpdateDiscount={handleUpdateDiscount}
              onCommunicate={handleCommunicateWithCustomer}
              onCreateInvoice={handleCreateInvoiceFromCustomer}
              onCreateConsignment={handleCreateConsignmentFromCustomer}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionDashboard />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentDashboard />
          </TabsContent>

          <TabsContent value="communications">
            <CustomerCommunications 
              customer={selectedCustomer}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard 
              gems={gems}
              customers={customers}
              invoices={invoices}
            />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLog />
          </TabsContent>

          <TabsContent value="reminders">
            <ReminderDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
