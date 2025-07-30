import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import { usePurchases } from '@/hooks/usePurchases';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useGemSettings } from '@/hooks/useGemSettings';
import { Purchase, PurchaseItem, PURCHASE_STATUS_OPTIONS } from '@/types/supplier';
import { format } from 'date-fns';

interface PurchaseFormProps {
  purchase?: Purchase | null;
  onClose: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({ purchase, onClose }) => {
  const { addPurchase, updatePurchase } = usePurchases();
  const { suppliers } = useSuppliers();
  const { gemSettings } = useGemSettings();
  const gemTypes = gemSettings.filter(s => s.setting_type === 'gem_type');
  const treatments = gemSettings.filter(s => s.setting_type === 'treatment');
  
  const [formData, setFormData] = useState({
    purchase_id: '',
    supplier_id: '',
    invoice_number: '',
    purchase_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    subtotal: 0,
    tax_rate: 0,
    tax_amount: 0,
    total_amount: 0,
    settled_amount: 0,
    balance: 0,
    currency: 'USD',
    status: 'pending',
    notes: '',
    attachment_urls: [] as string[],
  });

  const [items, setItems] = useState<Omit<PurchaseItem, 'id' | 'purchase_id' | 'created_at'>[]>([
    {
      gem_type: '',
      shape: '',
      color: '',
      treatment: 'none',
      origin: '',
      certificate_type: 'none',
      certificate_number: '',
      measurements: '',
      description: '',
      carat: 0,
      quantity: 1,
      price_per_unit: 0,
      total_price: 0,
    }
  ]);

  useEffect(() => {
    if (purchase) {
      setFormData({
        purchase_id: purchase.purchase_id,
        supplier_id: purchase.supplier_id,
        invoice_number: purchase.invoice_number,
        purchase_date: purchase.purchase_date,
        due_date: purchase.due_date,
        subtotal: purchase.subtotal,
        tax_rate: purchase.tax_rate,
        tax_amount: purchase.tax_amount,
        total_amount: purchase.total_amount,
        settled_amount: purchase.settled_amount,
        balance: purchase.balance,
        currency: purchase.currency,
        status: purchase.status,
        notes: purchase.notes || '',
        attachment_urls: purchase.attachment_urls || [],
      });
    } else {
      // Generate new purchase ID
      const newId = `PO${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, purchase_id: newId }));
    }
  }, [purchase]);

  useEffect(() => {
    calculateTotals();
  }, [items, formData.tax_rate]);

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const tax_amount = subtotal * (formData.tax_rate / 100);
    const total_amount = subtotal + tax_amount;
    const balance = total_amount - formData.settled_amount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount,
      total_amount,
      balance,
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total price for this item
    if (field === 'carat' || field === 'quantity' || field === 'price_per_unit') {
      const item = updatedItems[index];
      updatedItems[index].total_price = item.carat * item.quantity * item.price_per_unit;
    }
    
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, {
      gem_type: '',
      shape: '',
      color: '',
      treatment: 'none',
      origin: '',
      certificate_type: 'none',
      certificate_number: '',
      measurements: '',
      description: '',
      carat: 0,
      quantity: 1,
      price_per_unit: 0,
      total_price: 0,
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (purchase) {
        await updatePurchase(purchase.id, formData);
      } else {
        await addPurchase(formData, items);
      }
      onClose();
    } catch (error) {
      console.error('Error saving purchase:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchase Information */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="purchase_id">Purchase ID</Label>
              <Input
                id="purchase_id"
                value={formData.purchase_id}
                onChange={(e) => handleInputChange('purchase_id', e.target.value)}
                disabled={!!purchase}
                required
              />
            </div>

            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={(value) => handleInputChange('supplier_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter(s => s.status === 'active').map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name} ({supplier.supplier_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PURCHASE_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Subtotal</Label>
              <div className="text-2xl font-bold">${formData.subtotal.toLocaleString()}</div>
            </div>

            <div>
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                value={formData.tax_rate}
                onChange={(e) => handleInputChange('tax_rate', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div>
              <Label>Tax Amount</Label>
              <div className="text-lg font-semibold">${formData.tax_amount.toLocaleString()}</div>
            </div>

            <div>
              <Label>Total Amount</Label>
              <div className="text-2xl font-bold text-green-600">${formData.total_amount.toLocaleString()}</div>
            </div>

            <div>
              <Label htmlFor="settled_amount">Settled Amount</Label>
              <Input
                id="settled_amount"
                type="number"
                value={formData.settled_amount}
                onChange={(e) => handleInputChange('settled_amount', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label>Balance</Label>
              <div className={`text-lg font-semibold ${formData.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${formData.balance.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Purchase Items</CardTitle>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gem Type</TableHead>
                  <TableHead>Shape</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Carat</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price/Unit</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={item.gem_type || ''}
                        onValueChange={(value) => handleItemChange(index, 'gem_type', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {gemTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.shape || ''}
                        onChange={(e) => handleItemChange(index, 'shape', e.target.value)}
                        className="w-24"
                        placeholder="Shape"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.color || ''}
                        onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                        className="w-24"
                        placeholder="Color"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.treatment}
                        onValueChange={(value) => handleItemChange(index, 'treatment', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {treatments.map((treatment) => (
                            <SelectItem key={treatment.value} value={treatment.value}>
                              {treatment.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.origin || ''}
                        onChange={(e) => handleItemChange(index, 'origin', e.target.value)}
                        className="w-24"
                        placeholder="Origin"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.carat}
                        onChange={(e) => handleItemChange(index, 'carat', parseFloat(e.target.value) || 0)}
                        className="w-20"
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16"
                        min="1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.price_per_unit}
                        onChange={(e) => handleItemChange(index, 'price_per_unit', parseFloat(e.target.value) || 0)}
                        className="w-24"
                        min="0"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      ${item.total_price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            placeholder="Additional notes about this purchase..."
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {purchase ? 'Update Purchase' : 'Create Purchase'}
        </Button>
      </div>
    </form>
  );
};