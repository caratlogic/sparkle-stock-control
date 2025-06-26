import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gem, GEM_TYPES } from '../types/gem';
import { Invoice, Consignment, Customer } from '../types/customer';
import { useGems } from '../hooks/useGems';
import { useCustomers } from '../hooks/useCustomers';
import { useInvoices } from '../hooks/useInvoices';
import { GemForm } from './GemForm';
import { GemTable } from './GemTable';
import { CustomerDashboard } from './CustomerDashboard';
import { InvoiceCreation } from './InvoiceCreation';
import { ConsignmentCreation } from './ConsignmentCreation';
import { TransactionDashboard } from './TransactionDashboard';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Plus, 
  Users, 
  FileText,
  Gem as GemIcon,
  Receipt,
  PieChart,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const { isOwner } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { gems, loading: gemsLoading, addGem, updateGem, deleteGem } = useGems();
  const { customers, loading: customersLoading } = useCustomers();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const [editingGem, setEditingGem] = useState<Gem | null>(null);
  const [selectedGemType, setSelectedGemType] = useState<string>('all');
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [preselectedGem, setPreselectedGem] = useState<Gem | null>(null);
  const [preselectedCustomer, setPreselectedCustomer] = useState<Customer | null>(null);

  // Filter gems by selected type
  const filteredGems = selectedGemType === 'all' 
    ? gems 
    : gems.filter(gem => gem.gemType === selectedGemType);

  const handleAddGem = async (gemData: any) => {
    const result = await addGem(gemData);
    if (result.success) {
      toast({
        title: "Success",
        description: "Gem added successfully",
      });
      setActiveTab('inventory');
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
      setEditingGem(null);
      setActiveTab('inventory');
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update gem",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGem = async (id: string) => {
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
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    setActiveTab('transactions');
  };

  const handleSaveConsignment = (consignment: Consignment) => {
    setConsignments([...consignments, consignment]);
    setPreselectedGem(null);
    setPreselectedCustomer(null);
    setActiveTab('transactions');
  };

  const handleCreateInvoiceFromGem = (gem: Gem) => {
    setPreselectedGem(gem);
    setActiveTab('create-invoice');
  };

  const handleCreateConsignmentFromGem = (gem: Gem) => {
    setPreselectedGem(gem);
    setActiveTab('create-consignment');
  };

  const handleCreateInvoiceFromCustomer = (customer: Customer) => {
    setPreselectedCustomer(customer);
    setActiveTab('create-invoice');
  };

  const handleCreateConsignmentFromCustomer = (customer: Customer) => {
    setPreselectedCustomer(customer);
    setActiveTab('create-consignment');
  };

  // Calculate statistics
  const totalValue = filteredGems.reduce((sum, gem) => sum + gem.price, 0);
  const totalCostValue = isOwner ? filteredGems.reduce((sum, gem) => sum + gem.costPrice, 0) : 0;
  const inStockCount = filteredGems.filter(gem => gem.status === 'In Stock').length;
  const soldCount = filteredGems.filter(gem => gem.status === 'Sold').length;
  const reservedCount = filteredGems.filter(gem => gem.status === 'Reserved').length;

  const isLoading = gemsLoading || customersLoading || invoicesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="text-lg font-medium text-slate-700">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'add-gem':
        return (
          <GemForm
            onSubmit={handleAddGem}
            onCancel={() => setActiveTab('inventory')}
          />
        );
      case 'edit-gem':
        return (
          <GemForm
            gem={editingGem}
            onSubmit={handleEditGem}
            onCancel={() => {
              setEditingGem(null);
              setActiveTab('inventory');
            }}
          />
        );
      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-slate-800">Gem Inventory</h2>
                <Select value={selectedGemType} onValueChange={setSelectedGemType}>
                  <SelectTrigger className="w-48 bg-white border-slate-200">
                    <SelectValue placeholder="Filter by gem type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all">All Gems</SelectItem>
                    {GEM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => setActiveTab('add-gem')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Gem
              </Button>
            </div>
            <GemTable
              gems={filteredGems}
              onEdit={(gem) => {
                setEditingGem(gem);
                setActiveTab('edit-gem');
              }}
              onDelete={handleDeleteGem}
              onCreateInvoice={handleCreateInvoiceFromGem}
              onCreateConsignment={handleCreateConsignmentFromGem}
            />
          </div>
        );
      case 'customers':
        return (
          <CustomerDashboard 
            onCreateInvoice={handleCreateInvoiceFromCustomer}
            onCreateConsignment={handleCreateConsignmentFromCustomer}
          />
        );
      case 'create-invoice':
        return (
          <InvoiceCreation
            onCancel={() => {
              setActiveTab('dashboard');
              setPreselectedGem(null);
              setPreselectedCustomer(null);
            }}
            onSave={handleSaveInvoice}
            preselectedGem={preselectedGem}
            preselectedCustomer={preselectedCustomer}
          />
        );
      case 'create-consignment':
        return (
          <ConsignmentCreation
            onCancel={() => {
              setActiveTab('dashboard');
              setPreselectedGem(null);
              setPreselectedCustomer(null);
            }}
            onSave={handleSaveConsignment}
            preselectedGem={preselectedGem}
            preselectedCustomer={preselectedCustomer}
          />
        );
      case 'transactions':
        return (
          <TransactionDashboard
            invoices={invoices}
            consignments={consignments}
          />
        );
      case 'analytics':
        return (
          <AnalyticsDashboard
            gems={gems}
            customers={customers}
            invoices={invoices}
          />
        );
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
                <p className="text-slate-600 mt-2">Welcome to your gems inventory management system</p>
              </div>
              <div className="flex space-x-4">
                <Select value={selectedGemType} onValueChange={setSelectedGemType}>
                  <SelectTrigger className="w-40 bg-white border-slate-200">
                    <SelectValue placeholder="All Gems" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all">All Gems</SelectItem>
                    {GEM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="gem-sparkle">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Inventory Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">${totalValue.toLocaleString()}</div>
                  {isOwner && (
                    <p className="text-xs text-slate-500 mt-1">
                      Cost: ${totalCostValue.toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="gem-sparkle">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Gems</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{filteredGems.length}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedGemType === 'all' ? 'All types' : selectedGemType}
                  </p>
                </CardContent>
              </Card>

              <Card className="gem-sparkle">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">In Stock</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{inStockCount}</div>
                  <p className="text-xs text-slate-500 mt-1">Available for sale</p>
                </CardContent>
              </Card>

              <Card className="gem-sparkle">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Sold</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{soldCount}</div>
                  <p className="text-xs text-slate-500 mt-1">{reservedCount} reserved</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Gems */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GemIcon className="w-5 h-5 text-slate-600" />
                  <span>Recent Gems</span>
                  {selectedGemType !== 'all' && (
                    <Badge variant="outline">{selectedGemType}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredGems.slice(0, 5).map((gem) => (
                    <div key={gem.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <GemIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{gem.stockId}</div>
                          <div className="text-sm text-slate-500">
                            {gem.carat}ct {gem.gemType} {gem.cut} - {gem.color} {gem.clarity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-800">${gem.price.toLocaleString()}</div>
                        <Badge 
                          variant={
                            gem.status === 'In Stock' ? 'secondary' : 
                            gem.status === 'Sold' ? 'destructive' : 'default'
                          }
                          className="text-xs"
                        >
                          {gem.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'inventory' || activeTab === 'add-gem' || activeTab === 'edit-gem'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'customers'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Customers
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <PieChart className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('create-invoice')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create-invoice'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Create Invoice
            </button>
            <button
              onClick={() => setActiveTab('create-consignment')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create-consignment'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Receipt className="w-4 h-4 inline mr-2" />
              Create Consignment
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Transactions
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};
