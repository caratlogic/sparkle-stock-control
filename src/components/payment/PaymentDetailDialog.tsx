import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Payment } from '../../types/payment';
import { Calendar, DollarSign, User, FileText, CreditCard, MessageSquare, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentDetailDialogProps {
  payment: Payment | null;
  open: boolean;
  onClose: () => void;
}

interface InvoiceItem {
  id: string;
  gem_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  gem: {
    stock_id: string;
    gem_type: string;
    carat: number;
    color: string;
    description: string;
    certificate_number: string;
  };
}

export const PaymentDetailDialog = ({ payment, open, onClose }: PaymentDetailDialogProps) => {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!payment?.invoiceId) return;
      
      setLoading(true);
      try {
        const { data: items, error } = await supabase
          .from('invoice_items')
          .select(`
            id,
            gem_id,
            quantity,
            unit_price,
            total_price,
            gem:gems (
              stock_id,
              gem_type,
              carat,
              color,
              description,
              certificate_number
            )
          `)
          .eq('invoice_id', payment.invoiceId);

        if (error) throw error;
        setInvoiceItems(items || []);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchInvoiceDetails();
    }
  }, [payment?.invoiceId, open]);

  if (!payment) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      partial: 'bg-blue-100 text-blue-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      cash: 'bg-emerald-100 text-emerald-800',
      bank: 'bg-blue-100 text-blue-800',
      upi: 'bg-purple-100 text-purple-800',
      credit: 'bg-orange-100 text-orange-800',
      debit: 'bg-pink-100 text-pink-800',
      cheque: 'bg-indigo-100 text-indigo-800',
      online: 'bg-cyan-100 text-cyan-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Payment Details - {payment.referenceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Reference:</span>
                  <span className="text-sm">{payment.referenceNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-sm font-semibold">${payment.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Date Received:</span>
                  <span className="text-sm">{new Date(payment.dateReceived).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Customer:</span>
                  <span className="text-sm">{payment.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Payment Method:</span>
                  <Badge className={getPaymentMethodBadge(payment.paymentMethod)}>
                    {payment.paymentMethod.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getStatusBadge(payment.paymentStatus)}>
                    {payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Linked Documents */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Linked Documents</h3>
            <div className="space-y-2">
              {payment.invoiceId && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Invoice:</span>
                  <span className="text-sm text-blue-600">#{payment.invoiceId.slice(-6)}</span>
                </div>
              )}
              {payment.consignmentId && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Consignment:</span>
                  <span className="text-sm text-purple-600">#{payment.consignmentId.slice(-6)}</span>
                </div>
              )}
              {!payment.invoiceId && !payment.consignmentId && (
                <div className="text-sm text-muted-foreground">No linked documents</div>
              )}
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Notes
                </h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{payment.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* Invoice Items Details */}
          {payment.invoiceId && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Invoice Items
                </h3>
                {loading ? (
                  <div className="text-center py-4">Loading invoice details...</div>
                ) : invoiceItems.length > 0 ? (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stock ID</TableHead>
                          <TableHead>Gem Type</TableHead>
                          <TableHead>Carat</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead>Certificate</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.gem.stock_id}</TableCell>
                            <TableCell>{item.gem.gem_type}</TableCell>
                            <TableCell>{item.gem.carat} ct</TableCell>
                            <TableCell>{item.gem.color}</TableCell>
                            <TableCell className="text-xs">{item.gem.certificate_number}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unit_price.toLocaleString()}</TableCell>
                            <TableCell className="font-medium">${item.total_price.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No invoice items found</div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Created:</span> {new Date(payment.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {new Date(payment.updatedAt).toLocaleString()}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};