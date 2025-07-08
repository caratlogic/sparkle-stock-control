
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, User, Calendar, Printer } from 'lucide-react';

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

interface ConsignmentDetailViewProps {
  consignment: Consignment;
  onBack: () => void;
}

export const ConsignmentDetailView = ({ consignment, onBack }: ConsignmentDetailViewProps) => {
  const totalValue = consignment.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Transactions
          </Button>
          <h1 className="text-2xl font-bold text-slate-800">
            Consignment Details - {consignment.consignmentNumber}
          </h1>
        </div>
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="w-4 h-4 mr-2" />
          Print Consignment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consignment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Consignment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>

      {/* Consignment Items */}
      <Card>
        <CardHeader>
          <CardTitle>Consignment Items</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};
