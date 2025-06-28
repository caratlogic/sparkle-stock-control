import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Plus, Trash2, FileText, Download } from 'lucide-react';
import { Customer, Consignment, InvoiceItem } from '../types/customer';
import { Gem } from '../types/gem';
import { sampleCustomers } from '../data/sampleCustomers';
import { sampleGems } from '../data/sampleGems';
import { useConsignments } from '../hooks/useConsignments';
import { useCustomers } from '../hooks/useCustomers';
import { useGems } from '../hooks/useGems';

interface ConsignmentCreationProps {
  onCancel: () => void;
  onSave: (consignment: Consignment) => void;
  preselectedGem?: Gem | null;
  preselectedCustomer?: Customer | null;
}

export const ConsignmentCreation = ({ onCancel, onSave, preselectedGem, preselectedCustomer }: ConsignmentCreationProps) => {
  const { addConsignment } = useConsignments();
  const { customers } = useCustomers();
  const { gems } = useGems();
  
  // Initialize state with proper defaults
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Gem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when component mounts or when preselected values change
  useEffect(() => {
    // Reset all form state first
    setSelectedCustomer(null);
    setCustomerSearch('');
    setItems([]);
    setProductSearch('');
    setSelectedProduct(null);
    setQuantity(1);
    setReturnDate('');
    setNotes('');

    // Then set preselected values if they exist
    if (preselectedCustomer) {
      setSelectedCustomer(preselectedCustomer);
      setCustomerSearch(preselectedCustomer.name);
    }
  }, [preselectedCustomer, preselectedGem]);

  // Handle preselected gem
  useEffect(() => {
    if (preselectedGem && items.length === 0) {
      const newItem: InvoiceItem = {
        productId: preselectedGem.id,
        productType: preselectedGem.gemType.toLowerCase() as 'diamond',
        productDetails: {
          stockId: preselectedGem.stockId,
          carat: preselectedGem.carat,
          cut: preselectedGem.cut,
          color: preselectedGem.color,
          description: preselectedGem.description,
          measurements: preselectedGem.measurements,
          certificateNumber: preselectedGem.certificateNumber,
          gemType: preselectedGem.gemType,
        },
        quantity: 1,
        unitPrice: preselectedGem.price,
        totalPrice: preselectedGem.price,
      };
      setItems([newItem]);
    }
  }, [preselectedGem, items.length]);

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

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
  };

  const handleProductSelect = (product: Gem) => {
    setSelectedProduct(product);
    setProductSearch(`${product.stockId} - ${product.carat}ct ${product.gemType} ${product.cut}`);
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const newItem: InvoiceItem = {
      productId: selectedProduct.id,
      productType: selectedProduct.gemType.toLowerCase() as 'diamond',
      productDetails: {
        stockId: selectedProduct.stockId,
        carat: selectedProduct.carat,
        cut: selectedProduct.cut,
        color: selectedProduct.color,
        description: selectedProduct.description,
        measurements: selectedProduct.measurements,
        certificateNumber: selectedProduct.certificateNumber,
        gemType: selectedProduct.gemType,
      },
      quantity,
      unitPrice: selectedProduct.price,
      totalPrice: selectedProduct.price * quantity,
    };

    setItems([...items, newItem]);
    setSelectedProduct(null);
    setProductSearch('');
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveConsignment = async () => {
    if (!selectedCustomer || items.length === 0 || !returnDate) {
      console.log('Validation failed:', {
        hasCustomer: !!selectedCustomer,
        hasItems: items.length > 0,
        hasReturnDate: !!returnDate
      });
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('🔄 ConsignmentCreation: Preparing to save consignment');
      
      const consignmentData = {
        consignmentNumber: `CON-${Date.now()}`,
        customerId: selectedCustomer.id,
        status: 'pending',
        dateCreated: new Date().toISOString().split('T')[0],
        returnDate,
        notes,
        items: items.map(item => {
          // Check if this is a database gem (UUID format) or sample gem (numeric string)
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId);
          
          if (!isUuid) {
            // This is a sample gem, try to find corresponding database gem by stock ID
            const dbGem = gems.find(g => g.stockId === item.productDetails.stockId);
            if (dbGem) {
              console.log(`🔄 ConsignmentCreation: Mapping sample gem ${item.productId} to database gem ${dbGem.id}`);
              return {
                gemId: dbGem.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
              };
            } else {
              console.error(`❌ ConsignmentCreation: No database gem found for stock ID ${item.productDetails.stockId}`);
              throw new Error(`Gem with stock ID ${item.productDetails.stockId} not found in database. Please ensure all gems are properly imported.`);
            }
          }
          
          return {
            gemId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          };
        })
      };

      console.log('🔄 ConsignmentCreation: Saving consignment data:', consignmentData);
      
      const result = await addConsignment(consignmentData);
      
      if (result.success) {
        console.log('✅ ConsignmentCreation: Successfully saved consignment');
        
        // Create the consignment object for the callback
        const consignment: Consignment = {
          id: result.data.id,
          consignmentNumber: consignmentData.consignmentNumber,
          customerId: selectedCustomer.id,
          customerDetails: selectedCustomer,
          items,
          status: 'pending',
          dateCreated: consignmentData.dateCreated,
          returnDate,
          notes,
        };
        
        onSave(consignment);
      } else {
        console.error('❌ ConsignmentCreation: Failed to save consignment:', result.error);
        alert('Failed to save consignment: ' + result.error);
      }
    } catch (error) {
      console.error('❌ ConsignmentCreation: Error saving consignment:', error);
      alert('An error occurred while saving the consignment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Check if form is valid
  const isFormValid = selectedCustomer && items.length > 0 && returnDate.trim() !== '';
  
  console.log('Form validation:', {
    selectedCustomer: !!selectedCustomer,
    itemsLength: items.length,
    returnDate: returnDate,
    returnDateValid: returnDate.trim() !== '',
    isFormValid
  });

  const downloadConsignment = () => {
    if (!selectedCustomer || items.length === 0) return;

    const consignmentHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Consignment Agreement</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .agreement-info { margin-bottom: 20px; }
          .customer-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          th { background-color: #f5f5f5; }
          .terms { margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>CONSIGNMENT AGREEMENT</h1>
          <h2>Diamond Inventory</h2>
        </div>
        
        <div class="agreement-info">
          <p><strong>Consignment Number:</strong> CON-${Date.now()}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Return Date:</strong> ${new Date(returnDate).toLocaleDateString()}</p>
        </div>

        <div class="customer-info">
          <h3>Consignee:</h3>
          <p><strong>${selectedCustomer.name}</strong></p>
          <p>${selectedCustomer.email}</p>
          <p>${selectedCustomer.phone}</p>
          ${selectedCustomer.company ? `<p>${selectedCustomer.company}</p>` : ''}
          <p>${selectedCustomer.address.street}</p>
          <p>${selectedCustomer.address.city}, ${selectedCustomer.address.state} ${selectedCustomer.address.zipCode}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Stock ID</th>
              <th>Description</th>
              <th>Measurements</th>
              <th>Quantity</th>
              <th>Estimated Value</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.productDetails.stockId}</td>
                <td>${item.productDetails.carat}ct ${item.productDetails.gemType || 'Diamond'} ${item.productDetails.cut} ${item.productDetails.color}<br>
                ${item.productDetails.description}<br>
                Cert: ${item.productDetails.certificateNumber}</td>
                <td>${item.productDetails.measurements}</td>
                <td>${item.quantity}</td>
                <td>$${item.totalPrice.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="terms">
          <h3>Terms and Conditions:</h3>
          <p>1. The above items are consigned for review purposes only.</p>
          <p>2. Items must be returned by the specified return date in original condition.</p>
          <p>3. Customer is responsible for the security and care of items during consignment period.</p>
          <p>4. Any damage or loss will be charged at full replacement value.</p>
        </div>

        ${notes ? `<div><h3>Additional Notes:</h3><p>${notes}</p></div>` : ''}
        
        <div style="margin-top: 50px;">
          <p>Customer Signature: _____________________ Date: _____</p>
          <p>Authorized Representative: _____________________ Date: _____</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([consignmentHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consignment-${Date.now()}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <p className="text-slate-600">Generate a new consignment agreement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Selection */}
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
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-slate-500">
                        {customer.customerId} - {customer.email}
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
                  </div>
                  <Badge variant="secondary">{selectedCustomer.customerId}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consignment Details */}
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
                required
              />
            </div>
            <div className="text-sm text-slate-600">
              <p>Items: {items.length}</p>
              <p>Total Value: ${items.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Add Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="product-search">Search Gem</Label>
                <Input
                  id="product-search"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Enter stock ID, certificate number, or gem type..."
                />
                {productSearch && !selectedProduct && productResults.length > 0 && (
                  <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                    {productResults.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="font-medium">{product.stockId}</div>
                        <div className="text-sm text-slate-500">
                          {product.carat}ct {product.gemType} {product.cut} {product.color} - ${product.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {product.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={handleAddItem}
                  disabled={!selectedProduct}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Consignment Items */}
            {items.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Consignment Items</h3>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.productDetails.stockId}</div>
                        <div className="text-sm text-slate-600">
                          {item.productDetails.carat}ct {item.productDetails.gemType || 'Diamond'} {item.productDetails.cut} {item.productDetails.color}
                        </div>
                        <div className="text-sm text-slate-500 truncate max-w-md">
                          {item.productDetails.description}
                        </div>
                        <div className="text-xs text-slate-500">
                          Cert: {item.productDetails.certificateNumber} | Size: {item.productDetails.measurements}
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-medium">${item.totalPrice.toLocaleString()}</div>
                        <div className="text-sm text-slate-500">
                          {item.quantity} × ${item.unitPrice.toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes or special terms..."
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={downloadConsignment}
          disabled={!isFormValid}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Agreement
        </Button>
        <Button
          onClick={handleSaveConsignment}
          disabled={!isFormValid || isSaving}
          className="bg-diamond-gradient hover:opacity-90"
        >
          <FileText className="w-4 h-4 mr-2" />
          {isSaving ? 'Creating...' : 'Create Consignment'}
        </Button>
      </div>
    </div>
  );
};
