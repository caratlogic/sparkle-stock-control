import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, User, Calendar, Printer } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '@/lib/utils';
import { useExchangeRate } from '@/hooks/useExchangeRate';

interface QuotationItem {
  id: string;
  gemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
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

interface Quotation {
  id: string;
  quotationNumber: string;
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
    currency?: string;
  };
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  dateCreated: string;
  validUntil?: string;
  notes?: string;
  terms?: string;
  items: QuotationItem[];
  subtotal: number;
  discountPercentage: number;
  total: number;
  currency?: string;
}

interface QuotationDetailViewProps {
  quotation: Quotation;
  onBack: () => void;
}

export const QuotationDetailView = ({ quotation, onBack }: QuotationDetailViewProps) => {
  const quotationCurrency = quotation.currency || quotation.customerDetails?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(quotationCurrency);
  const { exchangeRate } = useExchangeRate();
  
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
            Quotation Details - {quotation.quotationNumber}
          </h1>
        </div>
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="w-4 h-4 mr-2" />
          Print Quotation
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quotation Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quotation Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Quotation Number</label>
                <p className="text-lg font-semibold">{quotation.quotationNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="mt-1">
                  <Badge variant={quotation.status === 'accepted' ? 'default' : 'secondary'}>
                    {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Date Created</label>
                <p className="text-lg">{new Date(quotation.dateCreated).toLocaleDateString()}</p>
              </div>
              {quotation.validUntil && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Valid Until</label>
                  <p className="text-lg">{new Date(quotation.validUntil).toLocaleDateString()}</p>
                </div>
              )}
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-600">Total Value</label>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(quotation.total, quotationCurrency)}</p>
                {quotationCurrency === 'EUR' && (
                  <p className="text-sm text-slate-600">
                    ~${(quotation.total * exchangeRate).toLocaleString()} USD (Rate: {exchangeRate})
                  </p>
                )}
              </div>
            </div>
            {quotation.notes && (
              <div>
                <label className="text-sm font-medium text-slate-600">Notes</label>
                <p className="text-lg">{quotation.notes}</p>
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
              <p className="text-lg font-semibold">{quotation.customerDetails.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="text-lg">{quotation.customerDetails.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Phone</label>
              <p className="text-lg">{quotation.customerDetails.phone}</p>
            </div>
            {quotation.customerDetails.company && (
              <div>
                <label className="text-sm font-medium text-slate-600">Company</label>
                <p className="text-lg">{quotation.customerDetails.company}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-600">Address</label>
              <p className="text-lg">
                {quotation.customerDetails.address.street}, {quotation.customerDetails.address.city}, {quotation.customerDetails.address.state} {quotation.customerDetails.address.zipCode}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotation Items */}
      <Card>
        <CardHeader>
          <CardTitle>Quotation Items</CardTitle>
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
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Discount</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item) => (
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
                            <div>{item.productDetails.color}</div>
                            <div>Cert: {item.productDetails.certificateNumber}</div>
                            {item.productDetails.measurements && (
                              <div>Size: {item.productDetails.measurements}</div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">{item.quantity || 0}</td>
                    <td className="py-4 px-4">{formatCurrency(item.unitPrice || 0, quotationCurrency)}</td>
                    <td className="py-4 px-4">{item.discount}%</td>
                    <td className="py-4 px-4 font-semibold">{formatCurrency(item.totalPrice || 0, quotationCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 border-t pt-4">
            <div className="text-right space-y-2">
              <div className="flex justify-end gap-8">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(quotation.subtotal, quotationCurrency)}</span>
              </div>
              {quotation.discountPercentage > 0 && (
                <div className="flex justify-end gap-8">
                  <span className="font-medium">Discount ({quotation.discountPercentage}%):</span>
                  <span>-{formatCurrency(quotation.subtotal * (quotation.discountPercentage / 100), quotationCurrency)}</span>
                </div>
              )}
              <div className="flex justify-end gap-8 text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(quotation.total, quotationCurrency)}</span>
              </div>
              {quotationCurrency === 'EUR' && (
                <div className="flex justify-end gap-8 text-sm text-slate-600">
                  <span>USD Equivalent:</span>
                  <span>~${(quotation.total * exchangeRate).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {quotation.terms && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium text-slate-800 mb-2">Terms & Conditions:</h4>
              <p className="text-slate-600">{quotation.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};