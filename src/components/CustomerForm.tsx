
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { Customer } from '../types/customer';

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (customer: Customer | Omit<Customer, 'id' | 'customerId' | 'dateAdded' | 'totalPurchases'>) => void;
  onCancel: () => void;
}

export const CustomerForm = ({ customer, onSubmit, onCancel }: CustomerFormProps) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    company: customer?.company || '',
    taxId: customer?.taxId || '',
    vatNumber: customer?.vatNumber || '',
    street: customer?.address.street || '',
    city: customer?.address.city || '',
    state: customer?.address.state || '',
    zipCode: customer?.address.zipCode || '',
    country: customer?.address.country || 'USA',
    currency: customer?.currency || 'USD',
    discount: customer?.discount || 0,
    notes: customer?.notes || '',
    kycStatus: customer?.kycStatus || false,
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData = {
      ...customer,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || undefined,
      taxId: formData.taxId || undefined,
      vatNumber: formData.vatNumber || undefined,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      },
      currency: formData.currency,
      discount: formData.discount,
      notes: formData.notes || undefined,
      kycStatus: formData.kycStatus,
      lastPurchaseDate: customer?.lastPurchaseDate,
    };

    onSubmit(customerData);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onCancel} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <p className="text-slate-600">
            {customer ? 'Update customer information' : 'Enter customer details'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="vatNumber">VAT Number</Label>
                <Input
                  id="vatNumber"
                  value={formData.vatNumber}
                  onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                  placeholder="Enter VAT number"
                />
              </div>

              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Default discount percentage for this customer (0-100%)
                </p>
              </div>

              <div>
                <Label htmlFor="kycStatus">KYC Status</Label>
                <select
                  id="kycStatus"
                  value={formData.kycStatus ? 'complete' : 'pending'}
                  onChange={(e) => handleInputChange('kycStatus', e.target.value === 'complete')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  KYC (Know Your Customer) verification status
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="currency">Currency *</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="USD">$ - US Dollar</option>
                  <option value="EUR">€ - Euro</option>
                  <option value="GBP">£ - British Pound</option>
                  <option value="JPY">¥ - Japanese Yen</option>
                  <option value="CAD">C$ - Canadian Dollar</option>
                  <option value="AUD">A$ - Australian Dollar</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                  <option value="CNY">¥ - Chinese Yuan</option>
                  <option value="INR">₹ - Indian Rupee</option>
                  <option value="SGD">S$ - Singapore Dollar</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-diamond-gradient hover:opacity-90">
            <Save className="w-4 h-4 mr-2" />
            {customer ? 'Update Customer' : 'Add Customer'}
          </Button>
        </div>
      </form>
    </div>
  );
};
