
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Customer } from '../../types/customer';

interface InvoiceSummaryProps {
  subtotal: number;
  discount: number;
  setDiscount: (value: number) => void;
  taxRate: number;
  setTaxRate: (value: number) => void;
  selectedCustomer: Customer | null;
}

export const InvoiceSummary = ({
  subtotal,
  discount,
  setDiscount,
  taxRate,
  setTaxRate,
  selectedCustomer,
}: InvoiceSummaryProps) => {
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const total = afterDiscount + taxAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Invoice Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Discount ({discount}%):</span>
            <span>-${discountAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>After Discount:</span>
            <span>${afterDiscount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax ({taxRate}%):</span>
            <span>${taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total:</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="discount">Discount (%)</Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
          />
          <p className="text-xs text-slate-500 mt-1">
            Adjust discount for this invoice (Customer default: {selectedCustomer?.discount || 0}%)
          </p>
        </div>
        
        <div>
          <Label htmlFor="tax-rate">Tax Rate (%)</Label>
          <Input
            id="tax-rate"
            type="number"
            step="0.1"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
