import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Payment } from '../../types/payment';

interface EditPaymentDialogProps {
  payment: Payment | null;
  open: boolean;
  onClose: () => void;
  onSave: (paymentData: Partial<Payment>) => Promise<void>;
}

export const EditPaymentDialog = ({ payment, open, onClose, onSave }: EditPaymentDialogProps) => {
  const [formData, setFormData] = useState({
    amount: payment?.amount || 0,
    paymentMethod: payment?.paymentMethod || 'cash',
    paymentStatus: payment?.paymentStatus || 'pending',
    dateReceived: payment?.dateReceived || '',
    notes: payment?.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    setLoading(true);
    try {
      await onSave({
        ...payment,
        ...formData
      });
      onClose();
    } catch (error) {
      console.error('Failed to update payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="referenceNumber">Reference Number</Label>
            <Input
              id="referenceNumber"
              value={payment.referenceNumber}
              disabled
              className="bg-slate-100"
            />
          </div>

          <div>
            <Label htmlFor="customerName">Customer</Label>
            <Input
              id="customerName"
              value={payment.customerName}
              disabled
              className="bg-slate-100"
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value as Payment['paymentMethod'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="debit">Debit Card</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="paymentStatus">Status</Label>
            <Select
              value={formData.paymentStatus}
              onValueChange={(value) => setFormData(prev => ({ ...prev, paymentStatus: value as Payment['paymentStatus'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dateReceived">Date Received</Label>
            <Input
              id="dateReceived"
              type="date"
              value={formData.dateReceived}
              onChange={(e) => setFormData(prev => ({ ...prev, dateReceived: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes about this payment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};