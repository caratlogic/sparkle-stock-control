
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

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInvoiceCreation, setShowInvoiceCreation] = useState(false);
  const [showConsignmentCreation, setShowConsignmentCreation] = useState(false);

  if (showInvoiceCreation) {
    return (
      <InvoiceCreation
        onCancel={() => setShowInvoiceCreation(false)}
        onSave={() => setShowInvoiceCreation(false)}
      />
    );
  }

  if (showConsignmentCreation) {
    return (
      <ConsignmentCreation
        onCancel={() => setShowConsignmentCreation(false)}
        onSave={() => setShowConsignmentCreation(false)}
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
          <TabsList className="grid w-full grid-cols-9 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="communications" className="flex items-center gap-2">
              <Handshake className="w-4 h-4" />
              Communications
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Reminders
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
            <GemTable />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerTable />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionDashboard />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentDashboard />
          </TabsContent>

          <TabsContent value="communications">
            <CustomerCommunications />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
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
