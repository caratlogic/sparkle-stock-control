import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  ArrowLeft, 
  FileText, 
  Receipt, 
  MessageCircle, 
  DollarSign, 
  ShoppingBag,
  Calendar,
  Mail,
  Phone,
  Building,
  MapPin,
  CreditCard
} from 'lucide-react';
import { Customer, Invoice, Consignment, CustomerCommunication } from '../types/customer';
import { Payment } from '../types/payment';
import { useInvoices } from '../hooks/useInvoices';
import { useConsignments } from '../hooks/useConsignments';
import { useCustomerCommunications } from '../hooks/useCustomerCommunications';
import { usePayments } from '../hooks/usePayments';
import { CustomerCommunications } from './CustomerCommunications';

interface CustomerDetailPageProps {
  customer: Customer;
  onBack: () => void;
  onCreateInvoice: (customer: Customer) => void;
  onCreateConsignment: (customer: Customer) => void;
}

export const CustomerDetailPage = ({
  customer,
  onBack,
  onCreateInvoice,
  onCreateConsignment
}: CustomerDetailPageProps) => {
  const { invoices } = useInvoices();
  const { consignments } = useConsignments();
  const { communications } = useCustomerCommunications(customer.id);
  const { payments } = usePayments();
  const [activeTab, setActiveTab] = useState('overview');

  // Filter data for this customer
  const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
  const customerConsignments = consignments.filter(cons => cons.customerId === customer.id);
  const customerCommunications = communications.filter(comm => comm.customerId === customer.id);
  const customerPayments = payments.filter(payment => 
    payment.customerId === customer.id || 
    payment.customerName.toLowerCase() === customer.name.toLowerCase()
  );

  // Calculate summary metrics
  const totalInvoices = customerInvoices.length;
  const totalConsignments = customerConsignments.length;
  const totalPayments = customerPayments.length;
  const totalRevenue = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaymentsAmount = customerPayments
    .filter(payment => payment.paymentStatus === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = customerInvoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);
  const recentCommunications = customerCommunications.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      case 'purchased': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getActivityDate = (activity: Invoice | Consignment | CustomerCommunication | Payment): string => {
    if ('dateCreated' in activity && activity.dateCreated) {
      return activity.dateCreated;
    } else if ('createdAt' in activity && activity.createdAt) {
      return activity.createdAt;
    } else if ('dateReceived' in activity && activity.dateReceived) {
      return activity.dateReceived;
    }
    return new Date().toISOString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{customer.name}</h1>
            <p className="text-slate-600">Customer ID: {customer.customerId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onCreateInvoice(customer)}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Create Invoice
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onCreateConsignment(customer)}
            className="flex items-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            Create Consignment
          </Button>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </div>
              <p className="font-medium">{customer.email}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                <span>Phone</span>
              </div>
              <p className="font-medium">{customer.phone}</p>
            </div>
            {customer.company && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Building className="w-4 h-4" />
                  <span>Company</span>
                </div>
                <p className="font-medium">{customer.company}</p>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>Address</span>
              </div>
              <p className="font-medium">
                {customer.address.street}, {customer.address.city}, {customer.address.state} {customer.address.zipCode}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>Customer Since</span>
              </div>
              <p className="font-medium">{formatDate(customer.dateAdded)}</p>
            </div>
            {customer.discount && customer.discount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>Discount</span>
                </div>
                <p className="font-medium">{customer.discount}%</p>
              </div>
            )}
          </div>
          {customer.notes && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-slate-700 mb-2">Notes</h4>
              <p className="text-slate-600">{customer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Invoices</p>
                <p className="text-xl font-bold text-slate-800">{totalInvoices}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Consignments</p>
                <p className="text-xl font-bold text-slate-800">{totalConsignments}</p>
              </div>
              <Receipt className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Payments</p>
                <p className="text-xl font-bold text-slate-800">${totalPaymentsAmount.toLocaleString()}</p>
              </div>
              <CreditCard className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Payments</p>
                <p className="text-xl font-bold text-slate-800">${pendingPayments.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({totalInvoices})</TabsTrigger>
          <TabsTrigger value="consignments">Consignments ({totalConsignments})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({totalPayments})</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Invoices</span>
                  <FileText className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customerInvoices.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No invoices yet</p>
                ) : (
                  <div className="space-y-3">
                    {customerInvoices.slice(0, 3).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-slate-600">{formatDate(invoice.dateCreated)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${invoice.total.toLocaleString()}</p>
                          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Payments</span>
                  <CreditCard className="w-5 h-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customerPayments.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No payments yet</p>
                ) : (
                  <div className="space-y-3">
                    {customerPayments.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{payment.referenceNumber}</p>
                          <p className="text-sm text-slate-600">{formatDate(payment.dateReceived)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${payment.amount.toLocaleString()}</p>
                          <Badge className={getStatusColor(payment.paymentStatus)}>{payment.paymentStatus}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {customerInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No invoices found for this customer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerInvoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                          <p className="text-sm text-slate-600">
                            Created: {formatDate(invoice.dateCreated)} | Due: {formatDate(invoice.dateDue)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${invoice.total.toLocaleString()}</p>
                          <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p>Items: {invoice.items.length}</p>
                        <p>Subtotal: ${invoice.subtotal.toLocaleString()}</p>
                        <p>Tax: ${invoice.taxAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consignments">
          <Card>
            <CardHeader>
              <CardTitle>All Consignments</CardTitle>
            </CardHeader>
            <CardContent>
              {customerConsignments.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No consignments found for this customer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerConsignments.map((consignment) => (
                    <div key={consignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{consignment.consignmentNumber}</h4>
                          <p className="text-sm text-slate-600">
                            Created: {formatDate(consignment.dateCreated)} | Return: {formatDate(consignment.returnDate)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(consignment.status)}>{consignment.status}</Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p>Items: {consignment.items.length}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>All Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {customerPayments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No payments found for this customer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerPayments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{payment.referenceNumber}</h4>
                          <p className="text-sm text-slate-600">
                            Date: {formatDate(payment.dateReceived)} | Method: {payment.paymentMethod}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${payment.amount.toLocaleString()}</p>
                          <Badge className={getStatusColor(payment.paymentStatus)}>{payment.paymentStatus}</Badge>
                        </div>
                      </div>
                      {payment.notes && (
                        <div className="text-sm text-slate-600">
                          <p>Notes: {payment.notes}</p>
                        </div>
                      )}
                      {payment.invoiceId && (
                        <div className="text-xs text-slate-500 mt-2">
                          <Badge variant="outline">Invoice Related</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <CustomerCommunications customer={customer} />
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Combined activity timeline */}
                {[...customerInvoices, ...customerConsignments, ...customerCommunications, ...customerPayments]
                  .sort((a, b) => new Date(getActivityDate(b)).getTime() - new Date(getActivityDate(a)).getTime())
                  .slice(0, 15)
                  .map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {'invoiceNumber' in activity ? (
                          <FileText className="w-5 h-5 text-blue-500" />
                        ) : 'consignmentNumber' in activity ? (
                          <Receipt className="w-5 h-5 text-purple-500" />
                        ) : 'referenceNumber' in activity ? (
                          <CreditCard className="w-5 h-5 text-indigo-500" />
                        ) : (
                          <MessageCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">
                            {'invoiceNumber' in activity ? `Invoice ${activity.invoiceNumber}` :
                             'consignmentNumber' in activity ? `Consignment ${activity.consignmentNumber}` :
                             'referenceNumber' in activity ? `Payment ${activity.referenceNumber}` :
                             `${activity.communicationType} Communication`}
                          </p>
                          <span className="text-xs text-slate-500">
                            {formatDate(getActivityDate(activity))}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {'total' in activity ? `Total: $${activity.total.toLocaleString()}` :
                           'amount' in activity ? `Amount: $${activity.amount.toLocaleString()}` :
                           'message' in activity ? activity.message.substring(0, 100) + '...' :
                           'Activity updated'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
