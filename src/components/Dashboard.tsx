
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Diamond, Package, AlertTriangle, Plus, Edit, Eye, Users, FileText } from 'lucide-react';
import { DiamondForm } from './DiamondForm';
import { DiamondTable } from './DiamondTable';
import { CustomerDashboard } from './CustomerDashboard';
import { InvoiceCreation } from './InvoiceCreation';
import { Diamond as DiamondType } from '../types/diamond';
import { Invoice } from '../types/customer';
import { sampleDiamonds } from '../data/sampleData';

export const Dashboard = () => {
  const [diamonds, setDiamonds] = useState<DiamondType[]>(sampleDiamonds);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDiamond, setEditingDiamond] = useState<DiamondType | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'inventory' | 'customers' | 'create-invoice'>('dashboard');

  // Calculate metrics
  const totalDiamonds = diamonds.length;
  const totalValue = diamonds.reduce((sum, diamond) => sum + diamond.price, 0);
  const inStockCount = diamonds.filter(d => d.status === 'In Stock').length;
  const lowStockCount = diamonds.filter(d => d.status === 'Reserved').length;

  const handleAddDiamond = (diamond: Omit<DiamondType, 'id' | 'stockId' | 'dateAdded'>) => {
    const newDiamond: DiamondType = {
      ...diamond,
      id: Date.now().toString(),
      stockId: `DM${String(totalDiamonds + 1).padStart(4, '0')}`,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setDiamonds([newDiamond, ...diamonds]);
    setShowForm(false);
  };

  const handleEditDiamond = (diamond: DiamondType) => {
    setDiamonds(diamonds.map(d => d.id === diamond.id ? diamond : d));
    setEditingDiamond(null);
    setShowForm(false);
  };

  const handleDeleteDiamond = (id: string) => {
    setDiamonds(diamonds.filter(d => d.id !== id));
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    setInvoices([invoice, ...invoices]);
    setCurrentView('dashboard');
    console.log('Invoice created:', invoice);
  };

  if (showForm) {
    return (
      <div className="animate-fade-in">
        <DiamondForm
          diamond={editingDiamond}
          onSubmit={editingDiamond ? handleEditDiamond : handleAddDiamond}
          onCancel={() => {
            setShowForm(false);
            setEditingDiamond(null);
          }}
        />
      </div>
    );
  }

  if (currentView === 'customers') {
    return <CustomerDashboard />;
  }

  if (currentView === 'create-invoice') {
    return (
      <InvoiceCreation
        onCancel={() => setCurrentView('dashboard')}
        onSave={handleSaveInvoice}
      />
    );
  }

  if (currentView === 'inventory') {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Diamond Inventory</h2>
            <p className="text-slate-600">Manage your diamond collection</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setCurrentView('dashboard')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-diamond-gradient hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Diamond
            </Button>
          </div>
        </div>
        <DiamondTable
          diamonds={diamonds}
          onEdit={(diamond) => {
            setEditingDiamond(diamond);
            setShowForm(true);
          }}
          onDelete={handleDeleteDiamond}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-600 mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setCurrentView('customers')}
          >
            <Users className="w-4 h-4 mr-2" />
            Customers
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentView('create-invoice')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentView('inventory')}
          >
            <Package className="w-4 h-4 mr-2" />
            View Inventory
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-diamond-gradient hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Diamond
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Diamonds</CardTitle>
            <Diamond className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totalDiamonds}</div>
            <p className="text-xs text-slate-500 mt-1">Active inventory items</p>
          </CardContent>
        </Card>

        <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Current inventory value</p>
          </CardContent>
        </Card>

        <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">In Stock</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{inStockCount}</div>
            <p className="text-xs text-slate-500 mt-1">Available for sale</p>
          </CardContent>
        </Card>

        <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
            <p className="text-xs text-slate-500 mt-1">Reserved items</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('customers')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Customer Management</h3>
                <p className="text-sm text-slate-600">Manage customer information and relationships</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('create-invoice')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Create Invoice</h3>
                <p className="text-sm text-slate-600">Generate invoices for diamond sales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView('inventory')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Diamond className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Diamond Inventory</h3>
                <p className="text-sm text-slate-600">View and manage diamond stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Additions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">Recent Additions</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('inventory')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diamonds.slice(0, 5).map((diamond) => (
              <div key={diamond.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-diamond-gradient rounded-lg flex items-center justify-center">
                    <Diamond className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{diamond.stockId}</div>
                    <div className="text-sm text-slate-500">
                      {diamond.carat}ct {diamond.cut} {diamond.color} {diamond.clarity}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={diamond.status === 'In Stock' ? 'secondary' : diamond.status === 'Sold' ? 'destructive' : 'default'}>
                    {diamond.status}
                  </Badge>
                  <div className="text-right">
                    <div className="font-semibold text-slate-800">${diamond.price.toLocaleString()}</div>
                    <div className="text-sm text-slate-500">{diamond.dateAdded}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingDiamond(diamond);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
