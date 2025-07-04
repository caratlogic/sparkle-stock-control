
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Package, Users, Gem as GemIcon, Calendar, Building2 } from 'lucide-react';
import { Gem } from '../types/gem';
import { Customer, Invoice } from '../types/customer';

interface AnalyticsDashboardProps {
  gems: Gem[];
  customers: Customer[];
  invoices: Invoice[];
}

export const AnalyticsDashboard = ({ gems, customers, invoices }: AnalyticsDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // Color palette for charts
  const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6366F1', '#84CC16'];

  // Filter data based on selected period
  const getFilteredInvoices = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    switch (selectedPeriod) {
      case 'year':
        return invoices.filter(inv => new Date(inv.dateCreated) >= startOfYear);
      case 'month':
        return invoices.filter(inv => new Date(inv.dateCreated) >= startOfMonth);
      case 'week':
        return invoices.filter(inv => new Date(inv.dateCreated) >= startOfWeek);
      case 'day':
        return invoices.filter(inv => new Date(inv.dateCreated) >= thirtyDaysAgo);
      default:
        return invoices;
    }
  };

  const filteredInvoices = getFilteredInvoices();

  // Analytics by Gem Type
  const typeAnalytics = gems.reduce((acc, gem) => {
    if (!acc[gem.gemType]) {
      acc[gem.gemType] = { 
        count: 0, 
        totalValue: 0, 
        soldCount: 0, 
        soldValue: 0,
        inStock: 0,
        reserved: 0,
        totalQuantity: 0
      };
    }
    const totalQuantity = (gem.inStock || 0) + (gem.reserved || 0) + (gem.sold || 0);
    acc[gem.gemType].count++;
    acc[gem.gemType].totalValue += gem.price * totalQuantity;
    acc[gem.gemType].soldCount += (gem.sold || 0);
    acc[gem.gemType].soldValue += gem.price * (gem.sold || 0);
    acc[gem.gemType].inStock += (gem.inStock || 0);
    acc[gem.gemType].reserved += (gem.reserved || 0);
    acc[gem.gemType].totalQuantity += totalQuantity;
    
    return acc;
  }, {} as Record<string, any>);

  const typeChartData = Object.entries(typeAnalytics).map(([type, data]) => ({
    name: type,
    count: data.count,
    value: data.totalValue,
    sold: data.soldValue,
    inStock: data.inStock,
    reserved: data.reserved
  }));

  // Analytics by Color
  const colorAnalytics = gems.reduce((acc, gem) => {
    if (!acc[gem.color]) {
      acc[gem.color] = { 
        count: 0, 
        totalValue: 0, 
        soldCount: 0, 
        soldValue: 0 
      };
    }
    acc[gem.color].count++;
    acc[gem.color].totalValue += gem.price;
    
    if (gem.status === 'Sold') {
      acc[gem.color].soldCount++;
      acc[gem.color].soldValue += gem.price;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const colorChartData = Object.entries(colorAnalytics).map(([color, data]) => ({
    name: color,
    count: data.count,
    value: data.totalValue,
    sold: data.soldValue
  })).slice(0, 8);

  // Analytics by Cut (Shape)
  const cutAnalytics = gems.reduce((acc, gem) => {
    if (!acc[gem.cut]) {
      acc[gem.cut] = { 
        count: 0, 
        totalValue: 0, 
        soldCount: 0, 
        soldValue: 0 
      };
    }
    acc[gem.cut].count++;
    acc[gem.cut].totalValue += gem.price;
    
    if (gem.status === 'Sold') {
      acc[gem.cut].soldCount++;
      acc[gem.cut].soldValue += gem.price;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const cutChartData = Object.entries(cutAnalytics).map(([cut, data]) => ({
    name: cut,
    count: data.count,
    value: data.totalValue,
    sold: data.soldValue
  }));

  // Supplier Analytics
  const supplierAnalytics = gems.reduce((acc, gem) => {
    const supplier = gem.supplier || 'Unknown';
    if (!acc[supplier]) {
      acc[supplier] = {
        name: supplier,
        totalValue: 0,
        soldValue: 0,
        totalQuantity: 0,
        soldQuantity: 0,
        gemCount: 0
      };
    }
    acc[supplier].totalValue += gem.price * ((gem.inStock || 0) + (gem.reserved || 0) + (gem.sold || 0));
    acc[supplier].soldValue += gem.price * (gem.sold || 0);
    acc[supplier].totalQuantity += (gem.inStock || 0) + (gem.reserved || 0) + (gem.sold || 0);
    acc[supplier].soldQuantity += (gem.sold || 0);
    acc[supplier].gemCount++;
    return acc;
  }, {} as Record<string, any>);

  const supplierChartData = Object.values(supplierAnalytics)
    .sort((a: any, b: any) => b.soldValue - a.soldValue)
    .slice(0, 8);

  // Date-based Analytics
  const getDateAnalytics = () => {
    const dateGroups = filteredInvoices.reduce((acc, invoice) => {
      let dateKey = '';
      const date = new Date(invoice.dateCreated);
      
      switch (selectedPeriod) {
        case 'year':
          dateKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          break;
        case 'month':
          dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'week':
          dateKey = date.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case 'day':
          dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        default:
          dateKey = date.getFullYear().toString();
      }
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          sales: 0,
          quantity: 0,
          invoices: 0
        };
      }
      
      acc[dateKey].sales += invoice.total;
      acc[dateKey].quantity += invoice.items.reduce((sum, item) => sum + item.quantity, 0);
      acc[dateKey].invoices += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(dateGroups).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const dateAnalyticsData = getDateAnalytics();

  // Customer Analytics
  const customerAnalytics = customers.map(customer => {
    const customerInvoices = filteredInvoices.filter(inv => inv.customerId === customer.id);
    const totalSales = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalQuantity = customerInvoices.reduce((sum, inv) => 
      sum + inv.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    
    return {
      ...customer,
      totalSalesAmount: totalSales,
      totalQuantitySold: totalQuantity,
      invoiceCount: customerInvoices.length
    };
  }).sort((a, b) => b.totalSalesAmount - a.totalSalesAmount);

  // Overall Stats
  const totalInventoryValue = gems.reduce((sum, gem) => {
    const totalQuantity = (gem.inStock || 0) + (gem.reserved || 0) + (gem.sold || 0);
    return sum + (gem.price * totalQuantity);
  }, 0);
  const totalSoldValue = gems.reduce((sum, gem) => sum + (gem.price * (gem.sold || 0)), 0);
  const totalRevenueFromInvoices = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalInStockQuantity = gems.reduce((sum, gem) => sum + (gem.inStock || 0), 0);
  const totalReservedQuantity = gems.reduce((sum, gem) => sum + (gem.reserved || 0), 0);
  const totalSoldQuantity = gems.reduce((sum, gem) => sum + (gem.sold || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Analytics Dashboard</h2>
          <p className="text-slate-600 mt-1">Comprehensive insights into your gems inventory and sales.</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40 bg-white border-slate-200">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="day">Daily (Last 30 Days)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quantity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="gem-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">In Stock Quantity</CardTitle>
            <Package className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{totalInStockQuantity.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Available pieces</p>
          </CardContent>
        </Card>

        <Card className="gem-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Reserved Quantity</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{totalReservedQuantity.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">On consignment</p>
          </CardContent>
        </Card>

        <Card className="gem-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Sold Quantity</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{totalSoldQuantity.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Sold pieces</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Quantity Dashboard */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GemIcon className="w-5 h-5 text-slate-600" />
            <span>Quantity Distribution by Gem Type</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={typeChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [value.toLocaleString(), name]} />
              <Bar dataKey="inStock" fill="#10B981" name="In Stock" />
              <Bar dataKey="reserved" fill="#F59E0B" name="Reserved" />
              <Bar dataKey="sold" fill="#EF4444" name="Sold" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="gem-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">${totalInventoryValue.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">{gems.length} gems in inventory</p>
          </CardContent>
        </Card>

        <Card className="gem-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">${totalRevenueFromInvoices.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">{filteredInvoices.length} invoices</p>
          </CardContent>
        </Card>

        <Card className="gem-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{customers.length}</div>
            <p className="text-xs text-slate-500 mt-1">Total customers</p>
          </CardContent>
        </Card>

        <Card className="gem-sparkle hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Avg. Sale Value</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              ${filteredInvoices.length ? Math.round(totalRevenueFromInvoices / filteredInvoices.length).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Per invoice</p>
          </CardContent>
        </Card>
      </div>

      {/* Gem Type Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GemIcon className="w-5 h-5 text-slate-600" />
              <span>Sales by Gem Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name]} />
                <Bar dataKey="sold" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Distribution by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Consignment and Invoice Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Consignment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Consignments</span>
                <Badge variant="secondary">{gems.filter(g => g.reserved > 0).length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Reserved Quantity</span>
                <span className="font-semibold">{totalReservedQuantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Reserved Value</span>
                <span className="font-semibold">${gems.reduce((sum, gem) => sum + (gem.price * (gem.reserved || 0)), 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Invoices</span>
                <Badge variant="secondary">{filteredInvoices.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Sold Quantity</span>
                <span className="font-semibold">{totalSoldQuantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Order Value</span>
                <span className="font-semibold">${filteredInvoices.length ? Math.round(totalRevenueFromInvoices / filteredInvoices.length).toLocaleString() : '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Color and Shape Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Colors by Value</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={colorChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name]} />
                <Bar dataKey="value" fill="#EC4899" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Cuts/Shapes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cutChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name]} />
                <Bar dataKey="sold" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales Analytics by Supplier and Date */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-slate-600" />
              <span>Sales by Supplier</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name]} />
                <Bar dataKey="soldValue" fill="#8B5CF6" name="Sales Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              <span>Sales Over Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dateAnalyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'sales' ? `$${value.toLocaleString()}` : value.toLocaleString(), 
                  name === 'sales' ? 'Sales' : 'Quantity'
                ]} />
                <Line type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={2} name="sales" />
                <Line type="monotone" dataKey="quantity" stroke="#10B981" strokeWidth={2} name="quantity" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Customer Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerAnalytics.slice(0, 10).map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{customer.name}</div>
                    <div className="text-sm text-slate-500">{customer.company || customer.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">${customer.totalSalesAmount.toLocaleString()}</div>
                  <div className="text-sm text-slate-500">{customer.totalQuantitySold} items • {customer.invoiceCount} orders</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
