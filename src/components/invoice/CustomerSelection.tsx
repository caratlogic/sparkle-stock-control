
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Customer } from '../../types/customer';

interface CustomerSelectionProps {
  customerSearch: string;
  setCustomerSearch: (value: string) => void;
  selectedCustomer: Customer | null;
  customerResults: Customer[];
  onCustomerSelect: (customer: Customer) => void;
}

export const CustomerSelection = ({
  customerSearch,
  setCustomerSearch,
  selectedCustomer,
  customerResults,
  onCustomerSelect,
}: CustomerSelectionProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="customer-search">Search Customer</Label>
          <Input
            id="customer-search"
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Enter customer name or ID..."
          />
          {customerSearch && !selectedCustomer && customerResults.length > 0 && (
            <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
              {customerResults.map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => onCustomerSelect(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-slate-500">
                    {customer.customerId} - {customer.email}
                    {customer.discount && customer.discount > 0 && (
                      <span className="ml-2 text-blue-600">({customer.discount}% discount)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCustomer && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{selectedCustomer.name}</h3>
                <p className="text-sm text-slate-600">{selectedCustomer.email}</p>
                <p className="text-sm text-slate-600">{selectedCustomer.phone}</p>
                {selectedCustomer.company && (
                  <p className="text-sm text-slate-600">{selectedCustomer.company}</p>
                )}
                 {selectedCustomer.vatNumber && (
                   <p className="text-sm text-slate-600">
                     VAT Number: {selectedCustomer.vatNumber}
                   </p>
                 )}
                 {selectedCustomer.discount && selectedCustomer.discount > 0 && (
                   <p className="text-sm text-blue-600 font-medium">
                     Customer Discount: {selectedCustomer.discount}%
                   </p>
                 )}
              </div>
              <Badge variant="secondary">{selectedCustomer.customerId}</Badge>
            </div>
            <div className="mt-2 text-sm text-slate-600">
              {selectedCustomer.address.street}, {selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zipCode}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
