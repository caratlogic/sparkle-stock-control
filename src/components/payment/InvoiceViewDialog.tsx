import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, User, DollarSign, Printer } from 'lucide-react';
import { Invoice } from '../../types/customer';

interface InvoiceViewDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}

export const InvoiceViewDialog = ({ invoice, open, onClose }: InvoiceViewDialogProps) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Invoice Details - {invoice.invoiceNumber}
            </DialogTitle>
            <Button onClick={handlePrint} size="sm" variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoice Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="w-5 h-5" />
                Invoice Information
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Invoice Number</label>
                  <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <div className="mt-1">
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Date Created</label>
                  <p className="text-lg">{new Date(invoice.dateCreated).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Date Due</label>
                  <p className="text-lg">{new Date(invoice.dateDue).toLocaleDateString()}</p>
                </div>
              </div>
              {invoice.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Notes</label>
                  <p className="text-lg">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="w-5 h-5" />
                Customer Information
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Name</label>
                <p className="text-lg font-semibold">{invoice.customerDetails.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="text-lg">{invoice.customerDetails.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Phone</label>
                <p className="text-lg">{invoice.customerDetails.phone}</p>
              </div>
              {invoice.customerDetails.company && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Company</label>
                  <p className="text-lg">{invoice.customerDetails.company}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-600">Address</label>
                <p className="text-lg">
                  {invoice.customerDetails.address.street}, {invoice.customerDetails.address.city}, {invoice.customerDetails.address.state} {invoice.customerDetails.address.zipCode}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Unit Price</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-4 px-4">
                        <div className="font-medium">{item.productDetails.stockId}</div>
                        <div className="text-sm text-slate-600">{item.productDetails.gemType}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div>{item.caratPurchased}ct from {item.productDetails.totalCarat}ct total {item.productDetails.cut}</div>
                          <div>{item.productDetails.color}</div>
                          <div>Cert: {item.productDetails.certificateNumber}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">{item.quantity}</td>
                      <td className="py-4 px-4">${item.pricePerCarat.toFixed(2)}/ct</td>
                      <td className="py-4 px-4 font-semibold">${item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="w-5 h-5" />
              Invoice Summary
            </div>
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold">${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax Rate:</span>
                <span>{invoice.taxRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax Amount:</span>
                <span className="font-semibold">${invoice.taxAmount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${invoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};