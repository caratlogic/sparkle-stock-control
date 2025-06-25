
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gem, GEM_TYPES } from '../types/gem';
import { Invoice, Consignment } from '../types/customer';
import { sampleGems } from '../data/sampleGems';
import { GemForm } from './GemForm';
import { GemTable } from './GemTable';
import { CustomerDashboard } from './CustomerDashboard';
import { InvoiceCreation } from './InvoiceCreation';
import { ConsignmentCreation } from './ConsignmentCreation';
import { TransactionDashboard } from './TransactionDashboard';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Plus, 
  Users, 
  FileText,
  Gem as GemIcon,
  Receipt
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard = () => {
  const { isOwner } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [gems, setGems] = useState<Gem[]>(sampleGems);
  const [editingGem, setEditingGem] = useState<Gem | null>(null);
  const [selectedGemType, setSelectedGemType] = useState<string>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [consignments, setConsignments] = useState<Consignment[]>([]);

  // Filter gems by selected type
  const filteredGems = selectedGemType === 'all' 
    ? gems 
    : gems.filter(gem => gem.gemType === selectedGemType);

  const handleAddGem = (gemData: any) => {
    const newGem: Gem = {
      ...gemData,
      id: Date.now().toString(),
      stockId: `${gemData.gemType.substring(0, 2).toUpperCase()}${String(gems.length + 1).padStart(4, '0')}`,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setGems([...gems, newGem]);
    setActiveTab('inventory');
  };

  const handleEditGem = (gemData: any) => {
    if (!editingGem) return;
    
    const updatedGem = { ...editingGem, ...gemData };
    setGems(gems.map(gem => gem.id === editingGem.id ? updatedGem : gem));
    setEditingGem(null);
    setActiveTab('inventory');
  };

  const handleDeleteGem = (id: string) => {
    setGems(gems.filter(gem => gem.id !== id));
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    setInvoices([...invoices, invoice]);
    setActiveTab('transactions');
  };

  const handleSaveConsignment = (consignment: Consignment) => {
    // Update gem status to Reserved for consigned items
    const updatedGems = gems.map(gem => {
      const isConsigned = consignment.items.some(item => item.productId === gem.id);
      return isConsigned ? { ...gem, status: 'Reserved' as const } : gem;
    });
    setGems(updatedGems);
    setConsignments([...consignments, consignment]);
    setActiveTab('transactions');
  };

  // Calculate statistics
  const totalValue = filteredGems.reduce((sum, gem) => sum + gem.price, 0);
  const totalCostValue = isOwner ? filteredGems.reduce((sum, gem) => sum + gem.costPrice, 0) : 0;
  const inStockCount = filteredGems.filter(gem => gem.status === 'In Stock').length;
  const soldCount = filteredGems.filter(gem => gem.status === 'Sold').length;
  const reservedCount = filteredGems.filter(gem => gem.status === 'Reserved').length;

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
                className="bg-diamond-gradient hover:opacity-90"
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
            />
          </div>
        );
      case 'customers':
        return <CustomerDashboard />;
      case 'create-invoice':
        return (
          <InvoiceCreation
            onCancel={() => setActiveTab('dashboard')}
            onSave={handleSaveInvoice}
          />
        );
      case 'create-consignment':
        return (
          <ConsignmentCreation
            onCancel={() => setActiveTab('dashboard')}
            onSave={handleSaveConsignment}
          />
        );
      case 'transactions':
        return (
          <TransactionDashboard
            invoices={invoices}
            consignments={consignments}
          />
        );
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
                <p className="text-slate-600 mt-2">Welcome to your gem inventory management system</p>
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
              <Card className="diamond-sparkle">
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

              <Card className="diamond-sparkle">
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

              <Card className="diamond-sparkle">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">In Stock</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{inStockCount}</div>
                  <p className="text-xs text-slate-500 mt-1">Available for sale</p>
                </CardContent>
              </Card>

              <Card className="diamond-sparkle">
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
                        <div className="w-10 h-10 bg-diamond-gradient rounded-full flex items-center justify-center">
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
                  ? 'border-blue-500 text-blue-600'
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
                  ? 'border-blue-500 text-blue-600'
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
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Customers
            </button>
            <button
              onClick={() => setActiveTab('create-invoice')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'create-invoice'
                  ? 'border-blue-500 text-blue-600'
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
                  ? 'border-blue-500 text-blue-600'
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
                  ? 'border-blue-500 text-blue-600'
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
