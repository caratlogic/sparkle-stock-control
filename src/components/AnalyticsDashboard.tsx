
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Package, Users, Gem as GemIcon } from 'lucide-react';
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

  // Analytics by Gem Type
  const typeAnalytics = gems.reduce((acc, gem) => {
    if (!acc[gem.gemType]) {
      acc[gem.gemType] = { 
        count: 0, 
        totalValue: 0, 
        soldCount: 0, 
        soldValue: 0,
        inStock: 0,
        reserved: 0
      };
    }
    acc[gem.gemType].count++;
    acc[gem.gemType].totalValue += gem.price;
    
    if (gem.status === 'Sold') {
      acc[gem.gemType].soldCount++;
      acc[gem.gemType].soldValue += gem.price;
    } else if (gem.status === 'In Stock') {
      acc[gem.gemType].inStock++;
    } else if (gem.status === 'Reserved') {
      acc[gem.gemType].reserved++;
    }
    
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

  // Analytics by Shape/Description (replacing cut analytics)
  const shapeAnalytics = gems.reduce((acc, gem) => {
    const shape = gem.shapeDetail || gem.stoneDescription || 'Unknown';
    if (!acc[shape]) {
      acc[shape] = { 
        count: 0, 
        totalValue: 0, 
        soldCount: 0, 
        soldValue: 0 
      };
    }
    acc[shape].count++;
    acc[shape].totalValue += gem.price;
    
    if (gem.status === 'Sold') {
      acc[shape].soldCount++;
      acc[shape].soldValue += gem.price;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const shapeChartData = Object.entries(shapeAnalytics).map(([shape, data]) => ({
    name: shape,
    count: data.count,
    value: data.totalValue,
    sold: data.soldValue
  }));

  // Customer Analytics
  const customerAnalytics = customers.map(customer => {
    const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
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
  const totalInventoryValue = gems.reduce((sum, gem) => sum + gem.price, 0);
  const totalSoldValue = gems.filter(g => g.status === 'Sold').reduce((sum, gem) => sum + gem.price, 0);
  const totalRevenueFromInvoices = invoices.reduce((sum, inv) => sum + inv.total, 0);

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
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
            <p className="text-xs text-slate-500 mt-1">{invoices.length} invoices</p>
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
              ${invoices.length ? Math.round(totalRevenueFromInvoices / invoices.length).toLocaleString() : '0'}
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
            <CardTitle>Popular Shapes/Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={shapeChartData}>
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
