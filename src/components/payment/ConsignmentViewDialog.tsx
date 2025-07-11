import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, User, Printer } from 'lucide-react';

interface ConsignmentItem {
  id: string;
  gemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productDetails?: {
    stockId: string;
    carat: number;
    cut: string;
    color: string;
    description: string;
    measurements: string;
    certificateNumber: string;
    gemType?: string;
  };
}

interface Consignment {
  id: string;
  consignmentNumber: string;
  customerId: string;
  customerDetails: {
    id: string;
    customerId: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    taxId?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country?: string;
    };
    dateAdded: string;
    totalPurchases: number;
    lastPurchaseDate?: string;
    notes?: string;
  };
  status: 'pending' | 'returned' | 'purchased' | 'inactive';
  dateCreated: string;
  returnDate: string;
  notes?: string;
  items: ConsignmentItem[];
}

interface ConsignmentViewDialogProps {
  consignment: Consignment | null;
  open: boolean;
  onClose: () => void;
}

export const ConsignmentViewDialog = ({ consignment, open, onClose }: ConsignmentViewDialogProps) => {
  if (!consignment) return null;

  const totalValue = consignment.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Consignment Details - {consignment.consignmentNumber}
            </DialogTitle>
            <Button onClick={handlePrint} size="sm" variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consignment Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Package className="w-5 h-5" />
                Consignment Information
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Consignment Number</label>
                  <p className="text-lg font-semibold">{consignment.consignmentNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <div className="mt-1">
                    <Badge variant={consignment.status === 'purchased' ? 'default' : 'secondary'}>
                      {consignment.status.charAt(0).toUpperCase() + consignment.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Date Created</label>
                  <p className="text-lg">{new Date(consignment.dateCreated).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Return Date</label>
                  <p className="text-lg">{new Date(consignment.returnDate).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-600">Total Value</label>
                  <p className="text-xl font-bold text-slate-800">${totalValue.toLocaleString()}</p>
                </div>
              </div>
              {consignment.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Notes</label>
                  <p className="text-lg">{consignment.notes}</p>
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
                <p className="text-lg font-semibold">{consignment.customerDetails.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="text-lg">{consignment.customerDetails.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Phone</label>
                <p className="text-lg">{consignment.customerDetails.phone}</p>
              </div>
              {consignment.customerDetails.company && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Company</label>
                  <p className="text-lg">{consignment.customerDetails.company}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-600">Address</label>
                <p className="text-lg">
                  {consignment.customerDetails.address.street}, {consignment.customerDetails.address.city}, {consignment.customerDetails.address.state} {consignment.customerDetails.address.zipCode}
                </p>
              </div>
            </div>
          </div>

          {/* Consignment Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Consignment Items</h3>
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
                  {consignment.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-4 px-4">
                        <div className="font-medium">{item.productDetails?.stockId || 'N/A'}</div>
                        <div className="text-sm text-slate-600">{item.productDetails?.gemType || 'Unknown'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {item.productDetails && (
                            <>
                              <div><strong>Total:</strong> {item.productDetails.carat}ct {item.productDetails.cut}</div>
                              <div><strong>Consigned:</strong> {(item as any).caratConsigned || 0}ct</div>
                              <div>{item.productDetails.color}</div>
                              <div>Cert: {item.productDetails.certificateNumber}</div>
                              {item.productDetails.measurements && (
                                <div>Size: {item.productDetails.measurements}</div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">{item.quantity}</td>
                      <td className="py-4 px-4">${item.unitPrice.toLocaleString()}</td>
                      <td className="py-4 px-4 font-semibold">${item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};