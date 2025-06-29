
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, Calendar } from 'lucide-react';
import { Invoice, InvoicePayment } from '../types/customer';

interface InvoicePaymentDialogProps {
  invoice: Invoice;
  onAddPayment: (payment: Omit<InvoicePayment, 'id' | 'createdAt'>) => void;
}

export const InvoicePaymentDialog = ({ invoice, onAddPayment }: InvoicePaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: ''
  });

  const paidAmount = invoice.paidAmount || 0;
  const remainingAmount = invoice.total - paidAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payment = {
      invoiceId: invoice.id,
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod as any,
      notes: formData.notes || undefined
    };

    onAddPayment(payment);
    setFormData({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      notes: ''
    });
    setOpen(false);
  };

  const getPaymentStatus = () => {
    if (paidAmount === 0) return { status: 'Unpaid', variant: 'destructive' as const };
    if (paidAmount >= invoice.total) return { status: 'Paid', variant: 'default' as const };
    return { status: 'Partial', variant: 'secondary' as const };
  };

  const paymentStatus = getPaymentStatus();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="w-4 h-4 mr-2" />
          Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Payment - {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Invoice Total</div>
                <div className="font-semibold">${invoice.total.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-600">Paid Amount</div>
                <div className="font-semibold text-green-600">${paidAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-600">Remaining</div>
                <div className="font-semibold text-red-600">${remainingAmount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-600">Status</div>
                <Badge variant={paymentStatus.variant}>{paymentStatus.status}</Badge>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Payment History</h4>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                    <div>
                      <div className="font-medium">${payment.amount.toLocaleString()}</div>
                      <div className="text-sm text-slate-600">
                        {payment.paymentDate} • {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                      </div>
                      {payment.notes && (
                        <div className="text-xs text-slate-500 mt-1">{payment.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Payment Form */}
          {remainingAmount > 0 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Plus className="w-4 h-4" />
                <h4 className="font-medium">Add Payment</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Payment Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    max={remainingAmount}
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    Max: ${remainingAmount.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="paymentDate">Payment Date *</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Payment notes (optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Payment</Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
