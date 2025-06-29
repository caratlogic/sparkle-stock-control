import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Gem, 
  FileText, 
  Receipt, 
  TrendingUp, 
  DollarSign,
  Package,
  Activity,
  Bell,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { CustomerDashboard } from './CustomerDashboard';
import { DiamondTable } from './DiamondTable';
import { GemTable } from './GemTable';
import { InvoiceCreation } from './InvoiceCreation';
import { ConsignmentCreation } from './ConsignmentCreation';
import { TransactionDashboard } from './TransactionDashboard';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ActivityLog } from './ActivityLog';
import { ReminderDashboard } from './ReminderDashboard';
import { Customer } from '../types/customer';
import { Gem as GemType } from '../types/gem';
import { useAuth } from '../contexts/AuthContext';
import { useGems } from '../hooks/useGems';
import { useCustomers } from '../hooks/useCustomers';
import { useInvoices } from '../hooks/useInvoices';
import { sampleGems } from '../data/sampleGems';

export const Dashboard = () => {
  const [activeView, setActiveView] = useState<'overview' | 'customers' | 'diamonds' | 'gems' | 'invoices' | 'consignments' | 'transactions' | 'analytics' | 'activity' | 'reminders'>('overview');
  const [preselectedCustomer, setPreselectedCustomer] = useState<Customer | null>(null);
  const [preselectedGem, setPreselectedGem] = useState<GemType | null>(null);
  const { logout } = useAuth();
  const { gems } = useGems();
  const { customers } = useCustomers();
  const { invoices } = useInvoices();

  // Get only sample diamonds for the diamond view (since they have the proper Diamond type with clarity)
  const sampleDiamonds = sampleGems.filter(g => g.gemType === 'Diamond' && 'clarity' in g);

  const handleEditGem = (gem: any) => {
    // Handle gem editing logic
    console.log('Edit gem:', gem);
  };

  const handleDeleteGem = (id: string) => {
    // Handle gem deletion logic
    console.log('Delete gem:', id);
  };

  const handleCreateInvoiceFromGem = (gem: GemType) => {
    setPreselectedGem(gem);
    setPreselectedCustomer(null);
    setActiveView('invoices');
  };

  const handleCreateConsignmentFromGem = (gem: GemType) => {
    setPreselectedGem(gem);
    setPreselectedCustomer(null);
    setActiveView('consignments');
  };

  const handleCreateInvoiceFromCustomer = (customer: Customer) => {
    setPreselectedCustomer(customer);
    setPreselectedGem(null);
    setActiveView('invoices');
  };

  const handleCreateConsignmentFromCustomer = (customer: Customer) => {
    setPreselectedCustomer(customer);
    setPreselectedGem(null);
    setActiveView('consignments');
  };

  const handleCancelInvoice = () => {
    setPreselectedCustomer(null);
    setPreselectedGem(null);
    setActiveView('overview');
  };

  const handleCancelConsignment = () => {
    setPreselectedCustomer(null);
    setPreselectedGem(null);
    setActiveView('overview');
  };

  const handleSaveInvoice = (invoice: any) => {
    console.log('Invoice saved:', invoice);
    setPreselectedCustomer(null);
    setPreselectedGem(null);
    setActiveView('overview');
  };

  const handleSaveConsignment = (consignment: any) => {
    console.log('Consignment saved:', consignment);
    setPreselectedCustomer(null);
    setPreselectedGem(null);
    setActiveView('overview');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-2xl font-bold">Dashboard Overview</div>
            <Card>
              <CardHeader>
                <CardTitle>Welcome!</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is your dashboard overview. Navigate using the sidebar.</p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{customers.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Registered customers</p>
                </CardContent>
              </Card>

              <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    ${invoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">From all sales</p>
                </CardContent>
              </Card>

              <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Gems</CardTitle>
                  <Package className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{gems.length}</div>
                  <p className="text-xs text-slate-500 mt-1">In inventory</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'customers':
        return <CustomerDashboard 
          onCreateInvoice={handleCreateInvoiceFromCustomer}
          onCreateConsignment={handleCreateConsignmentFromCustomer}
        />;
      case 'diamonds':
        return <DiamondTable 
          diamonds={sampleDiamonds as any[]} 
          onEdit={handleEditGem} 
          onDelete={handleDeleteGem} 
        />;
      case 'gems':
        return <GemTable 
          gems={gems} 
          onEdit={handleEditGem} 
          onDelete={handleDeleteGem}
          onCreateInvoice={handleCreateInvoiceFromGem}
          onCreateConsignment={handleCreateConsignmentFromGem}
        />;
      case 'invoices':
        return <InvoiceCreation 
          onCancel={handleCancelInvoice}
          onSave={handleSaveInvoice}
          preselectedGem={preselectedGem}
          preselectedCustomer={preselectedCustomer}
        />;
      case 'consignments':
        return <ConsignmentCreation 
          onCancel={handleCancelConsignment}
          onSave={handleSaveConsignment}
          preselectedGem={preselectedGem}
          preselectedCustomer={preselectedCustomer}
        />;
      case 'transactions':
        return <TransactionDashboard />;
      case 'analytics':
        return <AnalyticsDashboard 
          gems={gems}
          customers={customers}
          invoices={invoices}
        />;
      case 'activity':
        return <ActivityLog />;
      case 'reminders':
        return <ReminderDashboard />;
      default:
        return (
          <div className="space-y-6">
            <div className="text-2xl font-bold">Dashboard Overview</div>
            <Card>
              <CardHeader>
                <CardTitle>Welcome!</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is your dashboard overview. Navigate using the sidebar.</p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">124</div>
                  <p className="text-xs text-slate-500 mt-1">Registered customers</p>
                </CardContent>
              </Card>

              <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">$45,231.89</div>
                  <p className="text-xs text-slate-500 mt-1">From all sales</p>
                </CardContent>
              </Card>

              <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">New Orders</CardTitle>
                  <Package className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">+201</div>
                  <p className="text-xs text-slate-500 mt-1">Since last month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-800">Diamond Inventory</div>
          <div className="flex items-center gap-4">
            <Button variant="ghost">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-6">
            <div className="space-y-2">
              <button
                onClick={() => setActiveView('overview')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === 'overview' ? 'bg-diamond-gradient text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-5 h-5 mr-3" />
                Overview
              </button>

              <button
                onClick={() => setActiveView('customers')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === 'customers' ? 'bg-diamond-gradient text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-5 h-5 mr-3" />
                Customers
              </button>

              <button
                onClick={() => setActiveView('diamonds')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === 'diamonds' ? 'bg-diamond-gradient text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Gem className="w-5 h-5 mr-3" />
                Diamonds
              </button>

              <button
                onClick={() => setActiveView('gems')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === 'gems' ? 'bg-diamond-gradient text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Gem className="w-5 h-5 mr-3" />
                Gems
              </button>

              <button
                onClick={() => setActiveView('invoices')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === 'invoices' ? 'bg-diamond-gradient text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-5 h-5 mr-3" />
                Invoices
              </button>

              <button
                onClick={() => setActiveView('consignments')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === 'consignments' ? 'bg-diamond-gradient text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Receipt className="w-5 h-5 mr-3" />
                Consignments
              </button>

              <button
                onClick={() => setActiveView('transactions')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === 'transactions' ? 'bg-diamond-gradient text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <DollarSign className="w-5 h-5 mr-3" />
                Transactions
              </button>

              <button
                onClick={() => setActiveView('analytics')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === 'analytics' ? 'bg-diamond-gradient text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Analytics
              </button>
              
              <button
                onClick={() => setActiveView('activity')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === 'activity' ? 'bg-diamond-gradient text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-5 h-5 mr-3" />
                Activity Log
              </button>
              
              <button
                onClick={() => setActiveView('reminders')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === 'reminders' ? 'bg-diamond-gradient text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Bell className="w-5 h-5 mr-3" />
                Reminders
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
