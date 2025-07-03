
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '../../types/customer';

interface InvoiceSummaryProps {
  subtotal: number;
  discount: number;
  setDiscount: (value: number) => void;
  taxRate: number;
  setTaxRate: (value: number) => void;
  selectedCustomer: Customer | null;
  currency: 'USD' | 'EUR';
  setCurrency: (value: 'USD' | 'EUR') => void;
}

export const InvoiceSummary = ({
  subtotal,
  discount,
  setDiscount,
  taxRate,
  setTaxRate,
  selectedCustomer,
  currency,
  setCurrency,
}: InvoiceSummaryProps) => {
  const currencySymbol = currency === 'USD' ? '$' : '€';
  const exchangeRate = currency === 'EUR' ? 0.85 : 1; // Example exchange rate
  
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const total = (afterDiscount + taxAmount) * exchangeRate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Invoice Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{currencySymbol}{(subtotal * exchangeRate).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Discount ({discount}%):</span>
            <span>-{currencySymbol}{(discountAmount * exchangeRate).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>After Discount:</span>
            <span>{currencySymbol}{((afterDiscount) * exchangeRate).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax ({taxRate}%):</span>
            <span>{currencySymbol}{(taxAmount * exchangeRate).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total:</span>
            <span>{currencySymbol}{total.toLocaleString()}</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={(value: 'USD' | 'EUR') => setCurrency(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
            </SelectContent>
          </Select>
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
