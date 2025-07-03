
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Download, FileText } from 'lucide-react';
import { Customer } from '../types/customer';
import { Invoice } from '../types/customer';
import { Gem } from '../types/gem';
import { sampleGems } from '../data/sampleGems';
import { useConsignments } from '../hooks/useConsignments';
import { useCustomers } from '../hooks/useCustomers';
import { useGems } from '../hooks/useGems';
import { useInvoiceForm } from '../hooks/useInvoiceForm';
import { useInvoiceActions } from '../hooks/useInvoiceActions';
import { CustomerSelection } from './invoice/CustomerSelection';
import { InvoiceSummary } from './invoice/InvoiceSummary';
import { ProductSelection } from './invoice/ProductSelection';
import { InvoiceNotes } from './invoice/InvoiceNotes';

interface InvoiceCreationProps {
  onCancel: () => void;
  onSave: (invoice: Invoice) => void;
  preselectedGem?: Gem | null;
  preselectedCustomer?: Customer | null;
}

export const InvoiceCreation = ({ onCancel, onSave, preselectedGem, preselectedCustomer }: InvoiceCreationProps) => {
  const { getConsignmentByGemId } = useConsignments();
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
    quantity,
    setQuantity,
    taxRate,
    setTaxRate,
    discount,
    setDiscount,
    notes,
    setNotes,
    relatedConsignmentId,
    setRelatedConsignmentId,
    handleCustomerSelect,
    handleProductSelect,
    handleAddItem,
    handleRemoveItem,
  } = useInvoiceForm({ preselectedCustomer, preselectedGem });

  const { handleSaveInvoice, downloadInvoice, isSaving } = useInvoiceActions();

  // Auto-add preselected gem to items and check for existing consignment
  useEffect(() => {
    if (preselectedGem && items.length === 0) {
      const newItem = {
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

      // If gem is reserved, check for existing consignment
      if (preselectedGem.reserved > 0) {
        getConsignmentByGemId(preselectedGem.id).then(consignment => {
          if (consignment) {
            setRelatedConsignmentId(consignment.id);
            // Auto-select customer from consignment using database customers
            const consignmentCustomer = customers.find(c => c.id === consignment.customerId);
            if (consignmentCustomer && !selectedCustomer) {
              setSelectedCustomer(consignmentCustomer);
              setCustomerSearch(consignmentCustomer.name);
            }
          }
        });
      }
    }
  }, [preselectedGem, selectedCustomer, customers, getConsignmentByGemId, items.length, setItems, setRelatedConsignmentId, setSelectedCustomer, setCustomerSearch]);

  // Customer search results - use database customers
  const customerResults = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.customerId.toLowerCase().includes(customerSearch.toLowerCase())
  ).slice(0, 5);

  // Product search results - use both database gems and sample gems, but prioritize database gems
  const databaseGems = gems.filter(gem =>
    (gem.inStock > 0 || gem.reserved > 0) &&
    (gem.stockId.toLowerCase().includes(productSearch.toLowerCase()) ||
    gem.certificateNumber.toLowerCase().includes(productSearch.toLowerCase()) ||
    gem.gemType.toLowerCase().includes(productSearch.toLowerCase()) ||
    (gem.description && gem.description.toLowerCase().includes(productSearch.toLowerCase())))
  );

  const sampleGemsFiltered = sampleGems.filter(gem =>
    gem.inStock > 0 &&
    (gem.stockId.toLowerCase().includes(productSearch.toLowerCase()) ||
    gem.certificateNumber.toLowerCase().includes(productSearch.toLowerCase()) ||
    gem.gemType.toLowerCase().includes(productSearch.toLowerCase()) ||
    gem.description.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Combine and prioritize database gems
  const productResults = [...databaseGems, ...sampleGemsFiltered].slice(0, 5);

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const total = afterDiscount + taxAmount;

  const onSaveInvoice = () => {
    handleSaveInvoice(
      selectedCustomer,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      notes,
      relatedConsignmentId,
      onSave
    );
  };

  const onDownloadInvoice = () => {
    downloadInvoice(selectedCustomer, items, subtotal, taxRate, taxAmount, total, notes);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onCancel} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Create Invoice</h2>
          <p className="text-slate-600">Generate a new invoice for gem sales</p>
          {relatedConsignmentId && (
            <p className="text-amber-600 text-sm mt-1">
              Note: This invoice is for a reserved item from an active consignment
            </p>
          )}
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

        <InvoiceSummary
          subtotal={subtotal}
          discount={discount}
          setDiscount={setDiscount}
          taxRate={taxRate}
          setTaxRate={setTaxRate}
          selectedCustomer={selectedCustomer}
        />

        <ProductSelection
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          selectedProduct={selectedProduct}
          productResults={productResults}
          quantity={quantity}
          setQuantity={setQuantity}
          items={items}
          onProductSelect={handleProductSelect}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
        />

        <InvoiceNotes notes={notes} setNotes={setNotes} />
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onDownloadInvoice}
          disabled={!selectedCustomer || items.length === 0}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button
          onClick={onSaveInvoice}
          disabled={!selectedCustomer || items.length === 0 || isSaving}
          className="bg-diamond-gradient hover:opacity-90"
        >
          <FileText className="w-4 h-4 mr-2" />
          {isSaving ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>
    </div>
  );
};
