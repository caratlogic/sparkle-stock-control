
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, DollarSign, Calendar, Search, Edit, Eye, MessageCircle } from 'lucide-react';
import { Customer } from '../types/customer';
import { useCustomers } from '../hooks/useCustomers';
import { supabase } from '@/integrations/supabase/client';
import { CustomerForm } from './CustomerForm';
import { CustomerTable } from './CustomerTable';
import { CustomerCommunications } from './CustomerCommunications';
import { CustomerDetailPage } from './CustomerDetailPage';
import { useToast } from '@/hooks/use-toast';

interface CustomerDashboardProps {
  onCreateInvoice?: (customer: Customer) => void;
  onCreateConsignment?: (customer: Customer) => void;
  onViewCustomer?: (customer: Customer) => void;
}

export const CustomerDashboard = ({ onCreateInvoice, onCreateConsignment, onViewCustomer }: CustomerDashboardProps) => {
  const { customers, loading, refetch } = useCustomers();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerForComms, setSelectedCustomerForComms] = useState<Customer | null>(null);
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);

  const handleAddCustomer = async (customer: Omit<Customer, 'id' | 'customerId' | 'dateAdded' | 'totalPurchases'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          company: customer.company,
          tax_id: customer.taxId,
          street: customer.address.street,
          city: customer.address.city,
          state: customer.address.state,
          zip_code: customer.address.zipCode,
          country: customer.address.country || 'USA',
          notes: customer.notes,
          discount: customer.discount || 0,
          kyc_status: customer.kycStatus || false,
          customer_id: `CUST${String(totalCustomers + 1).padStart(3, '0')}`,
          vat_number: customer.vatNumber
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      
      refetch();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    }
  };

  const handleEditCustomer = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          company: customer.company,
          tax_id: customer.taxId,
          vat_number: customer.vatNumber,
          street: customer.address.street,
          city: customer.address.city,
          state: customer.address.state,
          zip_code: customer.address.zipCode,
          country: customer.address.country || 'USA',
          notes: customer.notes,
          discount: customer.discount || 0,
          kyc_status: customer.kycStatus || false
        })
        .eq('id', customer.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      
      refetch();
      setEditingCustomer(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDiscount = async (customerId: string, discount: number) => {
    try {
      console.log('Updating discount for customer:', customerId, 'with discount:', discount);
      
      const { error } = await supabase
        .from('customers')
        .update({ discount })
        .eq('id', customerId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Discount updated to ${discount}%`,
      });
      
      // Refresh the customer data to reflect the changes
      await refetch();
    } catch (error) {
      console.error('Error updating discount:', error);
      toast({
        title: "Error",
        description: "Failed to update discount",
        variant: "destructive",
      });
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading customers...</div>
      </div>
    );
  }

  // Show customer detail page
  if (selectedCustomerForDetail) {
    return (
      <CustomerDetailPage
        customer={selectedCustomerForDetail}
        onBack={() => setSelectedCustomerForDetail(null)}
        onCreateInvoice={(customer) => {
          setSelectedCustomerForDetail(null);
          if (onCreateInvoice) onCreateInvoice(customer);
        }}
        onCreateConsignment={(customer) => {
          setSelectedCustomerForDetail(null);
          if (onCreateConsignment) onCreateConsignment(customer);
        }}
      />
    );
  }

  if (selectedCustomerForComms) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCustomerForComms(null)} 
            className="mr-4"
          >
            ← Back to Customers
          </Button>
        </div>
        <CustomerCommunications customer={selectedCustomerForComms} />
      </div>
    );
  }

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
            onUpdateDiscount={handleUpdateDiscount}
            onCommunicate={(customer) => setSelectedCustomerForComms(customer)}
            onView={(customer) => setSelectedCustomerForDetail(customer)}
            onRefresh={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
};
