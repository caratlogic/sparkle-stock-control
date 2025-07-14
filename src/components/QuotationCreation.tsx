import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Send, Plus, Trash2 } from 'lucide-react';
import { Gem } from '../types/gem';
import { Customer } from '../types/customer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuotationItem {
  gem: Gem;
  quantity: number;
  unitPrice: number;
  discount: number;
}

interface QuotationCreationProps {
  gems: Gem[];
  customers: Customer[];
  isOpen: boolean;
  onClose: () => void;
  preSelectedGems?: Gem[];
}

export const QuotationCreation = ({ gems, customers, isOpen, onClose, preSelectedGems = [] }: QuotationCreationProps) => {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);

  // Auto-populate with pre-selected gems on open
  useEffect(() => {
    if (isOpen && preSelectedGems.length > 0) {
      const newItems = preSelectedGems.map(gem => ({
        gem,
        quantity: 1,
        unitPrice: gem.price,
        discount: 0
      }));
      setQuotationItems(newItems);
    }
  }, [isOpen, preSelectedGems]);
  const [quotationDetails, setQuotationDetails] = useState({
    validUntil: '',
    terms: 'Payment due within 30 days. Prices quoted are subject to availability and may change without notice.',
    notes: '',
    discount: 0
  });
  const [sending, setSending] = useState(false);

  const availableGems = gems.filter(gem => 
    gem.status === 'In Stock' && 
    !quotationItems.some(item => item.gem.id === gem.id)
  );

  const addGemToQuotation = (gemId: string) => {
    const gem = gems.find(g => g.id === gemId);
    if (gem) {
      setQuotationItems(prev => [...prev, {
        gem,
        quantity: 1,
        unitPrice: gem.price,
        discount: 0
      }]);
    }
  };

  const removeGemFromQuotation = (index: number) => {
    setQuotationItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuotationItem = (index: number, field: keyof Omit<QuotationItem, 'gem'>, value: number) => {
    setQuotationItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return quotationItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discountAmount = itemTotal * (item.discount / 100);
      return sum + (itemTotal - discountAmount);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const overallDiscountAmount = subtotal * (quotationDetails.discount / 100);
    return subtotal - overallDiscountAmount;
  };

  const generateQuotationHTML = () => {
    const customerData = customers.find(c => c.id === selectedCustomer);
    const quotationNumber = `QUO-${Date.now()}`;
    const currentDate = new Date().toLocaleDateString();

    const itemRows = quotationItems.map((item, index) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discountAmount = itemTotal * (item.discount / 100);
      const netAmount = itemTotal - discountAmount;

      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; text-align: left;">${index + 1}</td>
          <td style="padding: 12px; text-align: left;">
            <strong>${item.gem.stockId}</strong><br>
            ${item.gem.gemType} - ${item.gem.carat}ct<br>
            ${item.gem.cut} ${item.gem.color}<br>
            ${item.gem.measurements}
          </td>
          <td style="padding: 12px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; text-align: right;">$${item.unitPrice.toLocaleString()}</td>
          <td style="padding: 12px; text-align: right;">${item.discount}%</td>
          <td style="padding: 12px; text-align: right;">$${netAmount.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    const subtotal = calculateSubtotal();
    const overallDiscountAmount = subtotal * (quotationDetails.discount / 100);
    const total = calculateTotal();

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin-bottom: 10px;">QUOTATION</h1>
          <p style="color: #6b7280; margin: 0;">Quotation #: ${quotationNumber}</p>
          <p style="color: #6b7280; margin: 0;">Date: ${currentDate}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h3 style="color: #1f2937; margin-bottom: 10px;">Bill To:</h3>
            <p style="margin: 0; line-height: 1.5;">
              <strong>${customerData?.name}</strong><br>
              ${customerData?.company ? customerData.company + '<br>' : ''}
              ${customerData?.email}<br>
              ${customerData?.phone}<br>
              ${customerData?.address.street}<br>
              ${customerData?.address.city}, ${customerData?.address.state} ${customerData?.address.zipCode}<br>
              ${customerData?.address.country}
            </p>
          </div>
          <div>
            <h3 style="color: #1f2937; margin-bottom: 10px;">Quotation Details:</h3>
            <p style="margin: 0; line-height: 1.5;">
              Valid Until: ${quotationDetails.validUntil}<br>
              Total Items: ${quotationItems.length}
            </p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">#</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item Description</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Discount</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 20px;">
          <table style="margin-left: auto; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 12px; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 8px 12px; text-align: right; width: 120px;">$${subtotal.toLocaleString()}</td>
            </tr>
            ${quotationDetails.discount > 0 ? `
            <tr>
              <td style="padding: 8px 12px; text-align: right; font-weight: bold;">Overall Discount (${quotationDetails.discount}%):</td>
              <td style="padding: 8px 12px; text-align: right;">-$${overallDiscountAmount.toLocaleString()}</td>
            </tr>
            ` : ''}
            <tr style="border-top: 2px solid #e5e7eb;">
              <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">$${total.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-bottom: 10px;">Terms & Conditions:</h3>
          <p style="margin: 0; line-height: 1.5; color: #4b5563;">${quotationDetails.terms}</p>
        </div>

        ${quotationDetails.notes ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin-bottom: 10px;">Notes:</h3>
          <p style="margin: 0; line-height: 1.5; color: #4b5563;">${quotationDetails.notes}</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Thank you for your interest in our gem collection. Please contact us if you have any questions.
          </p>
        </div>
      </div>
    `;
  };

  const handleSendQuotation = async () => {
    if (!selectedCustomer || quotationItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a customer and add at least one gem",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const customerData = customers.find(c => c.id === selectedCustomer);
      const quotationHTML = generateQuotationHTML();

      const response = await supabase.functions.invoke('send-quotation-email', {
        body: {
          to: customerData?.email,
          customerName: customerData?.name,
          subject: `Quotation for Selected Gems - ${new Date().toLocaleDateString()}`,
          quotationHTML,
          items: quotationItems,
          total: calculateTotal()
        }
      });

      if (response.error) throw response.error;

      // Log communication
      // Save quotation to database
      const quotationNumber = `QUO-${Date.now()}`;
      const { data: quotationData, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          quotation_number: quotationNumber,
          customer_id: selectedCustomer,
          subtotal: calculateSubtotal(),
          discount_percentage: quotationDetails.discount,
          total: calculateTotal(),
          terms: quotationDetails.terms,
          notes: quotationDetails.notes,
          valid_until: quotationDetails.validUntil || null,
          status: 'sent'
        })
        .select()
        .single();

      if (quotationError) throw quotationError;

      // Save quotation items
      const quotationItemsData = quotationItems.map(item => ({
        quotation_id: quotationData.id,
        gem_id: item.gem.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount,
        total_price: (item.quantity * item.unitPrice) * (1 - item.discount / 100)
      }));

      await supabase.from('quotation_items').insert(quotationItemsData);

      // Log communication
      await supabase.from('customer_communications').insert({
        customer_id: selectedCustomer,
        communication_type: 'email',
        sender_type: 'staff',
        subject: `Quotation sent for ${quotationItems.length} gems`,
        message: `Quotation sent with total value: $${calculateTotal().toLocaleString()}`,
        response_status: 'sent'
      });

      toast({
        title: "Quotation Sent Successfully",
        description: `Quotation sent to ${customerData?.name}`,
      });

      onClose();
    } catch (error) {
      console.error('Error sending quotation:', error);
      toast({
        title: "Error",
        description: "Failed to send quotation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create Quotation
          </DialogTitle>
          <DialogDescription>
            Create and send a professional quotation to customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Customer</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={quotationDetails.validUntil}
                onChange={(e) => setQuotationDetails(prev => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
          </div>

          {/* Add Gems */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Add Gems to Quotation</Label>
              <Select onValueChange={addGemToQuotation}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select gem to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availableGems.map(gem => (
                    <SelectItem key={gem.id} value={gem.id}>
                      {gem.stockId} - {gem.gemType} {gem.carat}ct - ${gem.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quotation Items */}
            {quotationItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quotation Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quotationItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-6 gap-4 items-center p-4 border rounded">
                        <div className="col-span-2">
                          <div className="text-sm font-medium">{item.gem.stockId}</div>
                          <div className="text-xs text-gray-500">
                            {item.gem.gemType} - {item.gem.carat}ct {item.gem.color}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuotationItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Unit Price</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateQuotationItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Discount %</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => updateQuotationItem(index, 'discount', parseFloat(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeGemFromQuotation(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Terms and Total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={quotationDetails.terms}
                  onChange={(e) => setQuotationDetails(prev => ({ ...prev, terms: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={quotationDetails.notes}
                  onChange={(e) => setQuotationDetails(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Overall Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={quotationDetails.discount}
                  onChange={(e) => setQuotationDetails(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {quotationItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quotation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span>{quotationItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal().toLocaleString()}</span>
                    </div>
                    {quotationDetails.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Overall Discount ({quotationDetails.discount}%):</span>
                        <span>-${(calculateSubtotal() * quotationDetails.discount / 100).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSendQuotation}
              disabled={!selectedCustomer || quotationItems.length === 0 || sending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Quotation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};