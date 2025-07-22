import { useState, useEffect } from 'react';
import { Customer } from '../types/customer';
import { Gem } from '../types/gem';
import { ConsignmentItem } from '../types/customer';

interface UseConsignmentFormProps {
  preselectedCustomer?: Customer | null;
  preselectedGem?: Gem | null;
}

export const useConsignmentForm = ({ preselectedCustomer, preselectedGem }: UseConsignmentFormProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [items, setItems] = useState<ConsignmentItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Gem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [caratAmount, setCaratAmount] = useState(0.01);
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when preselected values change
  useEffect(() => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setItems([]);
    setProductSearch('');
    setSelectedProduct(null);
    setQuantity(1);
    setCaratAmount(0.01);
    setReturnDate('');
    setNotes('');

    if (preselectedCustomer) {
      setSelectedCustomer(preselectedCustomer);
      setCustomerSearch(preselectedCustomer.name);
    }
  }, [preselectedCustomer, preselectedGem]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
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

    const newItem: ConsignmentItem = {
      id: `temp-${Date.now()}`,
      gemId: selectedProduct.id,
      quantity,
      caratConsigned: caratAmount,
      pricePerCarat,
      totalPrice,
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
    returnDate,
    setReturnDate,
    notes,
    setNotes,
    handleCustomerSelect,
    handleProductSelect,
    handleAddItem,
    handleRemoveItem,
  };
};