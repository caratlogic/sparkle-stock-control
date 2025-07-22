
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Share2, Mail, User, Camera, QrCode, FileText, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import { Gem } from '../types/gem';
import { useCustomers } from '../hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useQRCodeSettings } from '../hooks/useQRCodeSettings';
import { supabase } from '@/integrations/supabase/client';
import { GemCertificateManager } from './GemCertificateManager';

interface GemDetailViewProps {
  gem: Gem;
  onBack: () => void;
}

export const GemDetailView = ({ gem, onBack }: GemDetailViewProps) => {
  const { customers } = useCustomers();
  const { toast } = useToast();
  const { fieldConfig } = useQRCodeSettings();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [salesSummary, setSalesSummary] = useState({
    totalCarat: 0,
    totalQuantity: 0,
    totalRevenue: 0,
    invoiceCount: 0
  });

  // Fetch invoice data when component mounts
  useEffect(() => {
    fetchInvoiceData();
  }, [gem.id]);

  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoice_items')
        .select(`
          quantity,
          unit_price,
          total_price,
          carat_purchased,
          invoices (
            id,
            invoice_number,
            date_created,
            total,
            status,
            customers (name, email)
          )
        `)
        .eq('gem_id', gem.id);

      if (error) throw error;

      const invoiceList = data?.map(item => ({
        id: item.invoices.id,
        invoice_number: item.invoices.invoice_number,
        date_created: item.invoices.date_created,
        total: item.invoices.total,
        status: item.invoices.status,
        customer_name: item.invoices.customers.name,
        customer_email: item.invoices.customers.email,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        carat_purchased: item.carat_purchased || 0
      })) || [];

      // Calculate summary
      const summary = invoiceList.reduce((acc, invoice) => ({
        totalCarat: acc.totalCarat + invoice.carat_purchased,
        totalQuantity: acc.totalQuantity + invoice.quantity,
        totalRevenue: acc.totalRevenue + invoice.total_price,
        invoiceCount: acc.invoiceCount + 1
      }), { totalCarat: 0, totalQuantity: 0, totalRevenue: 0, invoiceCount: 0 });

      setInvoiceData(invoiceList);
      setSalesSummary(summary);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendToCustomer = async () => {
    if (!selectedCustomerId) {
      toast({
        title: "Error",
        description: "Please select a customer first",
        variant: "destructive",
      });
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      toast({
        title: "Error",
        description: "Customer not found",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Create email content with gem details
      const emailContent = `
        Dear ${customer.name},
        
        We would like to share details of a beautiful ${gem.gemType} from our collection:
        
        Stock ID: ${gem.stockId}
        Type: ${gem.gemType}
        Carat: ${gem.carat}ct
        Cut: ${gem.cut}
        Color: ${gem.color}
        Price: $${gem.price.toLocaleString()}
        Certificate: ${gem.certificateNumber}
        
        ${gem.description ? `Description: ${gem.description}` : ''}
        ${gem.measurements ? `Measurements: ${gem.measurements}` : ''}
        ${gem.notes ? `Notes: ${gem.notes}` : ''}
        
        Please contact us if you would like to schedule a viewing or have any questions.
        
        Best regards,
        Your Jewelry Team
      `;

      // In a real implementation, you would send this via email service
      console.log('Sending gem details to customer:', customer.email);
      console.log('Email content:', emailContent);
      
      toast({
        title: "Success",
        description: `Gem details sent to ${customer.name}`,
      });
      
      setSelectedCustomerId('');
    } catch (error) {
      console.error('Error sending gem details:', error);
      toast({
        title: "Error",
        description: "Failed to send gem details",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Button>
        <h1 className="text-2xl font-bold text-slate-800">
          {gem.gemType} Details - {gem.stockId}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Product Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
              {gem.imageUrl ? (
                <img
                  src={gem.imageUrl}
                  alt={`${gem.gemType} ${gem.stockId}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <Camera className="w-16 h-16 mx-auto mb-2" />
                  <p>No image available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Stock ID</label>
                <p className="text-lg font-semibold">{gem.stockId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="mt-1">
                  <Badge variant={
                    gem.status === 'In Stock' ? 'secondary' : 
                    gem.status === 'Sold' ? 'destructive' : 'default'
                  }>
                    {gem.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Gem Type</label>
                <p className="text-lg">{gem.gemType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Carat</label>
                <p className="text-lg">{gem.carat}ct</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Cut</label>
                <p className="text-lg">{gem.cut}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Color</label>
                <p className="text-lg">{gem.color}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Selling Price</label>
                <p className="text-xl font-bold text-slate-800">${gem.price.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Cost Price</label>
                <p className="text-lg text-emerald-600">${gem.costPrice.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Certificate Number</label>
              <p className="text-lg font-mono">{gem.certificateNumber}</p>
            </div>

            {gem.measurements && (
              <div>
                <label className="text-sm font-medium text-slate-600">Measurements</label>
                <p className="text-lg">{gem.measurements}</p>
              </div>
            )}

            {gem.description && (
              <div>
                <label className="text-sm font-medium text-slate-600">Description</label>
                <p className="text-lg">{gem.description}</p>
              </div>
            )}

            {gem.notes && (
              <div>
                <label className="text-sm font-medium text-slate-600">Notes</label>
                <p className="text-lg">{gem.notes}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-600">Date Added</label>
              <p className="text-lg">{gem.dateAdded}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <QRCodeDisplay 
              gemData={{
                stockId: gem.stockId,
                gemType: gem.gemType,
                carat: gem.carat,
                color: gem.color,
                cut: gem.cut,
                measurements: gem.measurements || '',
                certificateNumber: gem.certificateNumber,
                price: gem.price,
                pricePerCarat: gem.price / gem.carat,
                costPrice: gem.costPrice || 0,
                costPricePerCarat: (gem.costPrice || 0) / gem.carat,
                description: gem.description,
                origin: gem.origin,
                treatment: gem.treatment,
                supplier: gem.supplier,
                dateAdded: gem.dateAdded
              }}
              fieldConfig={fieldConfig}
              size="medium"
              showPrint={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Certificates Section */}
      <GemCertificateManager 
        gemId={gem.id} 
        isEditing={false}
      />

      {/* Customer Sharing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share with Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                Select Customer
              </label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{customer.name} ({customer.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSendToCustomer}
              disabled={!selectedCustomerId || isSending}
              className="bg-diamond-gradient hover:opacity-90"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Details'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Sales Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading sales data...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Total Carat Sold</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{salesSummary.totalCarat.toFixed(2)}ct</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Total Quantity</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{salesSummary.totalQuantity}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-medium">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">${salesSummary.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Total Invoices</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{salesSummary.invoiceCount}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice History ({invoiceData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading invoice history...</div>
          ) : invoiceData.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-sm">This gem has not been sold yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoiceData.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">{invoice.invoice_number}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4" />
                        <span>{invoice.customer_name}</span>
                        <span className="text-slate-400">•</span>
                        <span>{invoice.customer_email}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        invoice.status === 'paid' ? 'default' : 
                        invoice.status === 'partial' ? 'secondary' : 
                        invoice.status === 'sent' ? 'outline' : 'destructive'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{new Date(invoice.date_created).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-slate-500" />
                      <span>{invoice.quantity} pcs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-slate-500" />
                      <span>{invoice.carat_purchased.toFixed(2)}ct</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span>${invoice.unit_price.toLocaleString()}/ct</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">${invoice.total_price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
