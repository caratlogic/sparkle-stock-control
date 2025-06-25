
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, DollarSign, Calendar, Search, Edit, Eye } from 'lucide-react';
import { Customer } from '../types/customer';
import { sampleCustomers } from '../data/sampleCustomers';
import { CustomerForm } from './CustomerForm';
import { CustomerTable } from './CustomerTable';

interface CustomerDashboardProps {
  onCreateInvoice?: (customer: Customer) => void;
  onCreateConsignment?: (customer: Customer) => void;
}

export const CustomerDashboard = ({ onCreateInvoice, onCreateConsignment }: CustomerDashboardProps) => {
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate metrics
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalPurchases, 0);
  const activeCustomers = customers.filter(c => c.lastPurchaseDate && 
    new Date(c.lastPurchaseDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  ).length;

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCustomer = (customer: Omit<Customer, 'id' | 'customerId' | 'dateAdded' | 'totalPurchases'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      customerId: `CUST${String(totalCustomers + 1).padStart(3, '0')}`,
      dateAdded: new Date().toISOString().split('T')[0],
      totalPurchases: 0,
    };
    setCustomers([newCustomer, ...customers]);
    setShowForm(false);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    setEditingCustomer(null);
    setShowForm(false);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  if (showForm) {
    return (
      <div className="animate-fade-in">
        <CustomerForm
          customer={editingCustomer}
          onSubmit={editingCustomer ? handleEditCustomer : handleAddCustomer}
          onCancel={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Customer Management</h2>
          <p className="text-slate-600 mt-1">Manage your customer relationships and information.</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-diamond-gradient hover:opacity-90"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totalCustomers}</div>
            <p className="text-xs text-slate-500 mt-1">Registered customers</p>
          </CardContent>
        </Card>

        <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">From all customers</p>
          </CardContent>
        </Card>

        <Card className="diamond-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Customers</CardTitle>
            <Calendar className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activeCustomers}</div>
            <p className="text-xs text-slate-500 mt-1">Purchased in last 90 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Customer Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Customer Directory</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CustomerTable
            customers={filteredCustomers}
            onEdit={(customer) => {
              setEditingCustomer(customer);
              setShowForm(true);
            }}
            onDelete={handleDeleteCustomer}
            onCreateInvoice={onCreateInvoice}
            onCreateConsignment={onCreateConsignment}
          />
        </CardContent>
      </Card>
    </div>
  );
};
