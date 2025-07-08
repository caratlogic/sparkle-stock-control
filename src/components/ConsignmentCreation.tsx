import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Download, FileText } from 'lucide-react';
import { Customer } from '../types/customer';
import { Consignment, ConsignmentItem } from '../types/customer';
import { Gem } from '../types/gem';
import { sampleGems } from '../data/sampleGems';
import { useConsignments } from '../hooks/useConsignments';
import { useCustomers } from '../hooks/useCustomers';
import { useGems } from '../hooks/useGems';
import { useConsignmentForm } from '../hooks/useConsignmentForm';
import { useConsignmentActions } from '../hooks/useConsignmentActions';
import { CustomerSelection } from './invoice/CustomerSelection';
import { ProductSelection } from './invoice/ProductSelection';
import { InvoiceNotes } from './invoice/InvoiceNotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConsignmentCreationProps {
  onCancel: () => void;
  onSave: (consignment: Consignment) => void;
  preselectedGem?: Gem | null;
  preselectedCustomer?: Customer | null;
}

export const ConsignmentCreation = ({ onCancel, onSave, preselectedGem, preselectedCustomer }: ConsignmentCreationProps) => {
  const { customers } = useCustomers();
  const { gems } = useGems();
  
  const {
    selectedCustomer,
    setSelectedCustomer,
    customerSearch,
    setCustomerSearch,
    items,
    setItems,
    productSearch,
    setProductSearch,
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    caratAmount,
    setCaratAmount,
    returnDate,
    setReturnDate,
    notes,
    setNotes,
    handleCustomerSelect,
    handleProductSelect,
    handleAddItem,
    handleRemoveItem,
  } = useConsignmentForm({ preselectedCustomer, preselectedGem });

  const { handleSaveConsignment, isSaving } = useConsignmentActions();

  // Customer search results - use database customers
  const customerResults = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.customerId.toLowerCase().includes(customerSearch.toLowerCase())
  ).slice(0, 5);

  // Product search results - use both database gems and sample gems, but prioritize database gems
  const databaseGems = gems.filter(gem =>
    gem.status === 'In Stock' &&
    (gem.stockId.toLowerCase().includes(productSearch.toLowerCase()) ||
    gem.certificateNumber.toLowerCase().includes(productSearch.toLowerCase()) ||
    gem.gemType.toLowerCase().includes(productSearch.toLowerCase()) ||
    (gem.description && gem.description.toLowerCase().includes(productSearch.toLowerCase())))
  );

  const sampleGemsFiltered = sampleGems.filter(gem =>
    gem.status === 'In Stock' &&
    (gem.stockId.toLowerCase().includes(productSearch.toLowerCase()) ||
    gem.certificateNumber.toLowerCase().includes(productSearch.toLowerCase()) ||
    gem.gemType.toLowerCase().includes(productSearch.toLowerCase()) ||
    gem.description.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Combine and prioritize database gems
  const productResults = [...databaseGems, ...sampleGemsFiltered].slice(0, 5);

  const estimatedValue = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const onSaveConsignment = () => {
    handleSaveConsignment(
      selectedCustomer,
      items,
      returnDate,
      notes,
      onSave
    );
  };

  const onDownloadConsignment = () => {
    // Download functionality will be implemented later
    console.log('Download consignment functionality coming soon');
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onCancel} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Create Consignment</h2>
          <p className="text-slate-600">Create a new consignment agreement for gem evaluation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CustomerSelection
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          selectedCustomer={selectedCustomer}
          customerResults={customerResults}
          onCustomerSelect={handleCustomerSelect}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="return-date">Return Date</Label>
              <Input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Estimated Value:</span>
                <span>${estimatedValue.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <ProductSelection
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          selectedProduct={selectedProduct}
          productResults={productResults}
          quantity={quantity}
          setQuantity={setQuantity}
          caratAmount={caratAmount}
          setCaratAmount={setCaratAmount}
          items={items.map(item => ({
            productId: item.gemId,
            productType: 'diamond' as const,
            productDetails: {
              stockId: item.productDetails?.stockId || '',
              totalCarat: item.productDetails?.totalCarat || 0,
              cut: item.productDetails?.cut || '',
              color: item.productDetails?.color || '',
              description: item.productDetails?.description || '',
              measurements: item.productDetails?.measurements || '',
              certificateNumber: item.productDetails?.certificateNumber || '',
              gemType: item.productDetails?.gemType,
            },
            quantity: item.quantity,
            caratPurchased: item.caratConsigned,
            pricePerCarat: item.pricePerCarat,
            totalPrice: item.totalPrice,
          }))}
          onProductSelect={handleProductSelect}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onUpdateItem={(updatedItems) => {
            const updatedConsignmentItems = updatedItems.map(item => ({
              id: `temp-${Date.now()}-${Math.random()}`,
              gemId: item.productId,
              quantity: item.quantity,
              caratConsigned: item.caratPurchased,
              pricePerCarat: item.pricePerCarat,
              totalPrice: item.totalPrice,
              productDetails: item.productDetails
            }));
            setItems(updatedConsignmentItems);
          }}
        />

        <InvoiceNotes notes={notes} setNotes={setNotes} />
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onDownloadConsignment}
          disabled={!selectedCustomer || items.length === 0}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button
          onClick={onSaveConsignment}
          disabled={!selectedCustomer || items.length === 0 || !returnDate || isSaving}
          className="bg-purple-gradient hover:opacity-90"
        >
          <FileText className="w-4 h-4 mr-2" />
          {isSaving ? 'Creating...' : 'Create Consignment'}
        </Button>
      </div>
    </div>
  );
};