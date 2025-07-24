
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
  const [totalSellingPrice, setTotalSellingPrice] = useState(0);
  const [taxRate, setTaxRate] = useState(8.5);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [relatedConsignmentId, setRelatedConsignmentId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState('');

  // Reset form when preselected values change
  useEffect(() => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setItems([]);
    setProductSearch('');
    setSelectedProduct(null);
    setQuantity(1);
    setCaratAmount(0.01);
    setTotalSellingPrice(0);
    setTaxRate(8.5);
    setDiscount(0);
    setNotes('');
    setRelatedConsignmentId(null);
    
    // Set default payment date to 2 weeks from today
    const defaultPaymentDate = new Date();
    defaultPaymentDate.setDate(defaultPaymentDate.getDate() + 14);
    setPaymentDate(defaultPaymentDate.toISOString().split('T')[0]);

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
    // Set to total available quantity and carat
    setQuantity(product.inStock || 1);
    setCaratAmount(product.carat);
    setTotalSellingPrice(product.price);
  };

  const handleCaratAmountChange = (newCarat: number) => {
    setCaratAmount(newCarat);
    if (selectedProduct && selectedProduct.carat > 0) {
      const pricePerCarat = selectedProduct.price / selectedProduct.carat;
      setTotalSellingPrice(newCarat * pricePerCarat);
    }
  };

  const handleTotalSellingPriceChange = (newPrice: number) => {
    setTotalSellingPrice(newPrice);
    if (selectedProduct && selectedProduct.price > 0) {
      const pricePerCarat = selectedProduct.price / selectedProduct.carat;
      setCaratAmount(newPrice / pricePerCarat);
    }
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
        stockType: selectedProduct.stockType,
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
    setTotalSellingPrice(0);
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
    totalSellingPrice,
    setTotalSellingPrice,
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
    paymentDate,
    setPaymentDate,
    handleCustomerSelect,
    handleProductSelect,
    handleCaratAmountChange,
    handleTotalSellingPriceChange,
    handleAddItem,
    handleRemoveItem,
  };
};
