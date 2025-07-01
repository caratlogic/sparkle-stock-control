
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, User, Calendar, DollarSign } from 'lucide-react';
import { Invoice } from '../types/customer';

interface InvoiceDetailViewProps {
  invoice: Invoice;
  onBack: () => void;
}

export const InvoiceDetailView = ({ invoice, onBack }: InvoiceDetailViewProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Transactions
        </Button>
        <h1 className="text-2xl font-bold text-slate-800">
          Invoice Details - {invoice.invoiceNumber}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Invoice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
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
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-4 px-4">
                      <div className="font-medium">{item.productDetails.stockId}</div>
                      <div className="text-sm text-slate-600">{item.productDetails.gemType}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div>{item.productDetails.carat}ct {item.productDetails.cut}</div>
                        <div>{item.productDetails.color}</div>
                        <div>Cert: {item.productDetails.certificateNumber}</div>
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

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
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
        </CardContent>
      </Card>
    </div>
  );
};
