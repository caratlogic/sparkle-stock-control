
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useConsignments } from '../hooks/useConsignments';
import { useCustomers } from '../hooks/useCustomers';
import { useInvoiceActions } from '../hooks/useInvoiceActions';
import { InvoiceItem } from '../types/customer';
import { Loader2 } from 'lucide-react';

interface ConsignmentToInvoiceDialogProps {
  consignmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ConsignmentToInvoiceDialog = ({ 
  consignmentId, 
  onClose, 
  onSuccess 
}: ConsignmentToInvoiceDialogProps) => {
  const { consignments, updateConsignmentStatus } = useConsignments();
  const { customers } = useCustomers();
  const { handleSaveInvoice, isSaving } = useInvoiceActions();
  const [isConverting, setIsConverting] = useState(false);

  const consignment = consignments.find(c => c.id === consignmentId);
  const customer = customers.find(c => c.id === consignment?.customerId);

  if (!consignment || !customer) {
    return null;
  }

  const convertToInvoice = async () => {
    setIsConverting(true);
    
    try {
      // Convert consignment items to invoice items
      const invoiceItems: InvoiceItem[] = consignment.items.map(item => ({
        productId: item.gemId,
        productType: (item.productDetails?.gemType?.toLowerCase() || 'diamond') as any,
        productDetails: {
          stockId: item.productDetails?.stockId || '',
          totalCarat: item.productDetails?.totalCarat || 0,
          cut: item.productDetails?.cut || '',
          color: item.productDetails?.color || '',
          description: item.productDetails?.description || '',
          measurements: item.productDetails?.measurements || '',
          certificateNumber: item.productDetails?.certificateNumber || '',
          gemType: item.productDetails?.gemType
        },
        quantity: item.quantity,
        caratPurchased: item.caratConsigned,
        pricePerCarat: item.pricePerCarat,
        totalPrice: item.totalPrice
      }));

      const subtotal = invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxRate = 8.5; // Default tax rate
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      // Create invoice and mark consignment as purchased
      await handleSaveInvoice(
        customer,
        invoiceItems,
        subtotal,
        taxRate,
        taxAmount,
        total,
        `Converted from consignment ${consignment.consignmentNumber}`,
        consignment.id,
        (invoice) => {
          // Update consignment status to purchased
          updateConsignmentStatus(consignment.id, 'purchased');
          onSuccess();
        }
      );
    } catch (error) {
      console.error('Error converting consignment to invoice:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const subtotal = consignment.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 8.5;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Consignment to Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consignment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Consignment Number</p>
                  <p className="font-semibold">{consignment.consignmentNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Customer</p>
                  <p className="font-semibold">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date Created</p>
                  <p className="font-semibold">{new Date(consignment.dateCreated).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge variant="secondary">{consignment.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items to be Invoiced</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consignment.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Stock ID</p>
                        <p className="font-semibold">{item.productDetails?.stockId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Description</p>
                        <p className="font-semibold">
                          {item.caratConsigned}ct from {item.productDetails?.totalCarat}ct total {item.productDetails?.gemType} {item.productDetails?.cut}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Quantity</p>
                        <p className="font-semibold">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Price</p>
                        <p className="font-semibold">${item.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>${taxAmount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isConverting || isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={convertToInvoice} 
              disabled={isConverting || isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {(isConverting || isSaving) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Convert to Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
