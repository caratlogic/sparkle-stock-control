
import { useState, useEffect } from 'react';
import { Customer } from '../types/customer';
import { Gem } from '../types/gem';
import { InvoiceItem } from '../types/customer';

interface UseInvoiceFormProps {
  preselectedCustomer?: Customer | null;
  preselectedGem?: Gem | null;
}

export const useInvoiceForm = ({ preselectedCustomer, preselectedGem }: UseInvoiceFormProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Gem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [caratAmount, setCaratAmount] = useState(0.01);
  const [taxRate, setTaxRate] = useState(8.5);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [relatedConsignmentId, setRelatedConsignmentId] = useState<string | null>(null);

  // Reset form when preselected values change
  useEffect(() => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setItems([]);
    setProductSearch('');
    setSelectedProduct(null);
    setQuantity(1);
    setCaratAmount(0.01);
    setTaxRate(8.5);
    setDiscount(0);
    setNotes('');
    setRelatedConsignmentId(null);

    if (preselectedCustomer) {
      setSelectedCustomer(preselectedCustomer);
      setCustomerSearch(preselectedCustomer.name);
      setDiscount(preselectedCustomer.discount || 0);
    }
  }, [preselectedCustomer, preselectedGem]);

  // Set discount when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      console.log('Setting discount for customer:', selectedCustomer.name, 'discount:', selectedCustomer.discount);
      setDiscount(selectedCustomer.discount || 0);
    }
  }, [selectedCustomer]);

  const handleCustomerSelect = (customer: Customer) => {
    console.log('Customer selected:', customer.name, 'with discount:', customer.discount);
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setDiscount(customer.discount || 0);
  };

  const handleProductSelect = (product: Gem) => {
    setSelectedProduct(product);
    setProductSearch(`${product.stockId} - ${product.carat}ct total ${product.gemType} ${product.cut}`);
    setQuantity(product.inStock || 1); // Set to total available quantity
    setCaratAmount(product.carat); // Set to total available carat
  };

  const handleAddItem = () => {
    if (!selectedProduct || caratAmount > selectedProduct.carat) return;

    const pricePerCarat = selectedProduct.price / selectedProduct.carat;
    const totalPrice = caratAmount * pricePerCarat;

    const newItem: InvoiceItem = {
      productId: selectedProduct.id,
      productType: selectedProduct.gemType.toLowerCase() as 'diamond',
      productDetails: {
        stockId: selectedProduct.stockId,
        totalCarat: selectedProduct.carat,
        cut: selectedProduct.cut,
        color: selectedProduct.color,
        description: selectedProduct.description,
        measurements: selectedProduct.measurements,
        certificateNumber: selectedProduct.certificateNumber,
        gemType: selectedProduct.gemType,
      },
      quantity,
      caratPurchased: caratAmount,
      pricePerCarat,
      totalPrice,
    };

    setItems([...items, newItem]);
    setSelectedProduct(null);
    setProductSearch('');
    setQuantity(1);
    setCaratAmount(0.01);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return {
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
    taxRate,
    setTaxRate,
    currency,
    setCurrency,
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
  };
};
