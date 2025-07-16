import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Gem } from '../types/gem';
import { FileText, Handshake, Calendar, User, DollarSign, Package } from 'lucide-react';

interface GemTransactionHistoryProps {
  gem: Gem | null;
  open: boolean;
  onClose: () => void;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  date_created: string;
  total: number;
  status: string;
  customer_name: string;
  quantity: number;
  unit_price: number;
}

interface ConsignmentData {
  id: string;
  consignment_number: string;
  date_created: string;
  return_date: string;
  status: string;
  customer_name: string;
  quantity: number;
  unit_price: number;
}

export const GemTransactionHistory = ({ gem, open, onClose }: GemTransactionHistoryProps) => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [consignments, setConsignments] = useState<ConsignmentData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gem && open) {
      fetchTransactionHistory();
    }
  }, [gem, open]);

  const fetchTransactionHistory = async () => {
    if (!gem) return;
    
    setLoading(true);
    try {
      // Fetch invoices for this gem
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoice_items')
        .select(`
          quantity,
          unit_price,
          invoices (
            id,
            invoice_number,
            date_created,
            total,
            status,
            customers (name)
          )
        `)
        .eq('gem_id', gem.id);

      if (invoiceError) throw invoiceError;

      const invoiceList: InvoiceData[] = invoiceData?.map(item => ({
        id: item.invoices.id,
        invoice_number: item.invoices.invoice_number,
        date_created: item.invoices.date_created,
        total: item.invoices.total,
        status: item.invoices.status,
        customer_name: item.invoices.customers.name,
        quantity: item.quantity,
        unit_price: item.unit_price
      })) || [];

      // Fetch consignments for this gem
      const { data: consignmentData, error: consignmentError } = await supabase
        .from('consignment_items')
        .select(`
          quantity,
          unit_price,
          consignments (
            id,
            consignment_number,
            date_created,
            return_date,
            status,
            customers (name)
          )
        `)
        .eq('gem_id', gem.id);

      if (consignmentError) throw consignmentError;

      const consignmentList: ConsignmentData[] = consignmentData?.map(item => ({
        id: item.consignments.id,
        consignment_number: item.consignments.consignment_number,
        date_created: item.consignments.date_created,
        return_date: item.consignments.return_date,
        status: item.consignments.status,
        customer_name: item.consignments.customers.name,
        quantity: item.quantity,
        unit_price: item.unit_price
      })) || [];

      setInvoices(invoiceList);
      setConsignments(consignmentList);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!gem) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Transaction History for {gem.stockId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Gem Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gem Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {gem.gemType}
                </div>
                <div>
                  <span className="font-medium">Carat:</span> {gem.carat}
                </div>
                <div>
                  <span className="font-medium">Cut:</span> {gem.cut}
                </div>
                <div>
                  <span className="font-medium">Color:</span> {gem.color}
                </div>
                <div>
                  <span className="font-medium">In Stock:</span> {gem.inStock || 0}
                </div>
                <div>
                  <span className="font-medium">Reserved:</span> {gem.reserved || 0}
                </div>
                <div>
                  <span className="font-medium">Sold:</span> {gem.sold || 0}
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge 
                    variant={
                      gem.status === 'In Stock' ? 'secondary' : 
                      gem.status === 'Sold' ? 'destructive' : 'default'
                    }
                    className="ml-2"
                  >
                    {gem.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoices ({invoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No invoices found for this gem
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{invoice.invoice_number}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            {invoice.customer_name}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            invoice.status === 'paid' ? 'default' : 
                            invoice.status === 'partial' ? 'secondary' : 'destructive'
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {invoice.date_created}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          Qty: {invoice.quantity}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Unit: ${invoice.unit_price.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Total: ${invoice.total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consignments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5" />
                Consignments ({consignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : consignments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No consignments found for this gem
                </div>
              ) : (
                <div className="space-y-4">
                  {consignments.map((consignment) => (
                    <div key={consignment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{consignment.consignment_number}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            {consignment.customer_name}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            consignment.status === 'pending' ? 'secondary' : 
                            consignment.status === 'returned' ? 'default' : 
                            consignment.status === 'purchased' ? 'destructive' : 'outline'
                          }
                        >
                          {consignment.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {consignment.date_created}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Return: {consignment.return_date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          Qty: {consignment.quantity}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Unit: ${consignment.unit_price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};