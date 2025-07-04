import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '../types/customer';

interface CreditNoteFormProps {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
}

export const CreditNoteForm = ({ open, onClose, customers }: CreditNoteFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    reason: '',
    description: '',
    currency: 'USD'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const creditNoteNumber = `CN-${Date.now()}`;
      
      const { error } = await supabase
        .from('credit_notes')
        .insert({
          credit_note_number: creditNoteNumber,
          customer_id: formData.customerId,
          amount: parseFloat(formData.amount),
          reason: formData.reason,
          description: formData.description,
          currency: formData.currency,
          date_created: new Date().toISOString().split('T')[0],
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Credit Note Created",
        description: `Credit note ${creditNoteNumber} has been created successfully.`,
      });

      // Reset form and close dialog
      setFormData({
        customerId: '',
        amount: '',
        reason: '',
        description: '',
        currency: 'USD'
      });
      onClose();
    } catch (error) {
      console.error('Error creating credit note:', error);
      toast({
        title: "Error",
        description: "Failed to create credit note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Credit Note</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.customerId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason for credit note" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product_return">Product Return</SelectItem>
                <SelectItem value="damaged_goods">Damaged Goods</SelectItem>
                <SelectItem value="billing_error">Billing Error</SelectItem>
                <SelectItem value="customer_complaint">Customer Complaint</SelectItem>
                <SelectItem value="discount_adjustment">Discount Adjustment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter detailed description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.customerId || !formData.amount || !formData.reason}>
              {isSubmitting ? 'Creating...' : 'Create Credit Note'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};