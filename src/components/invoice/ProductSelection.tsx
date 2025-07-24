
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Gem } from '../../types/gem';
import { InvoiceItem } from '../../types/customer';
import { useState } from 'react';

interface ProductSelectionProps {
  productSearch: string;
  setProductSearch: (value: string) => void;
  selectedProduct: Gem | null;
  productResults: Gem[];
  quantity: number;
  setQuantity: (value: number) => void;
  caratAmount: number;
  setCaratAmount?: (value: number) => void;
  totalSellingPrice?: number;
  setTotalSellingPrice?: (value: number) => void;
  handleCaratAmountChange?: (value: number) => void;
  handleTotalSellingPriceChange?: (value: number) => void;
  items: InvoiceItem[];
  onProductSelect: (product: Gem) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem?: (items: InvoiceItem[]) => void;
}

const InvoiceItemRow = ({ 
  item, 
  index, 
  onRemoveItem, 
  onUpdateItem 
}: { 
  item: InvoiceItem; 
  index: number; 
  onRemoveItem: (index: number) => void;
  onUpdateItem: (updatedItem: InvoiceItem) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
  const [editCarat, setEditCarat] = useState(item.caratPurchased);
  const [editTotalPrice, setEditTotalPrice] = useState(item.totalPrice);

  // Check if this is a set type item based on stockType in productDetails
  const isSetType = item.productDetails?.stockType === 'set';
  
  // Calculate individual stone carat for set type items
  const getIndividualStoneCarat = () => {
    if (isSetType && item.productDetails?.totalCarat && item.quantity) {
      return item.productDetails.totalCarat / item.quantity;
    }
    return null;
  };

  // Handle quantity change for set type items
  const handleEditQuantityChange = (newQuantity: number) => {
    setEditQuantity(newQuantity);
    
    if (isSetType) {
      const individualCarat = getIndividualStoneCarat();
      if (individualCarat) {
        setEditCarat(newQuantity * individualCarat);
      }
    }
  };

  // Handle carat change for set type items
  const handleEditCaratChange = (newCarat: number) => {
    if (isSetType) {
      const individualCarat = getIndividualStoneCarat();
      if (individualCarat) {
        const calculatedQuantity = Math.round(newCarat / individualCarat);
        if (calculatedQuantity > 0) {
          setEditQuantity(calculatedQuantity);
          setEditCarat(calculatedQuantity * individualCarat);
          // Update total price based on new carat amount
          const pricePerCarat = editTotalPrice / item.caratPurchased;
          setEditTotalPrice(calculatedQuantity * individualCarat * pricePerCarat);
        }
        return;
      }
    }
    setEditCarat(newCarat);
    // Update total price based on new carat amount
    const pricePerCarat = editTotalPrice / item.caratPurchased;
    setEditTotalPrice(newCarat * pricePerCarat);
  };

  // Handle total price change
  const handleEditTotalPriceChange = (newTotalPrice: number) => {
    setEditTotalPrice(newTotalPrice);
  };

  const handleSave = () => {
    const pricePerCarat = editTotalPrice / editCarat;
    const updatedItem = {
      ...item,
      quantity: editQuantity,
      caratPurchased: editCarat,
      pricePerCarat: pricePerCarat,
      totalPrice: editTotalPrice
    };
    onUpdateItem(updatedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditQuantity(item.quantity);
    setEditCarat(item.caratPurchased);
    setEditTotalPrice(item.totalPrice);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
      <div className="flex-1">
        <div className="font-medium">{item.productDetails.stockId}</div>
        <div className="text-sm text-slate-600">
          {item.caratPurchased}ct purchased from {item.productDetails.totalCarat}ct total | {item.productDetails.gemType || 'Diamond'} {item.productDetails.cut} {item.productDetails.color}
        </div>
        <div className="text-sm text-slate-500 truncate max-w-md">
          {item.productDetails.description}
        </div>
        <div className="text-xs text-slate-500">
          Cert: {item.productDetails.certificateNumber} | Size: {item.productDetails.measurements}
        </div>
      </div>
      
      {isEditing ? (
        <div className="flex items-center gap-2 mr-4">
          <div className="text-xs">
            <Input
              type="number"
              min="1"
              value={editQuantity}
              onChange={(e) => handleEditQuantityChange(parseInt(e.target.value) || 1)}
              className="w-16 h-8 text-xs"
              placeholder="Qty"
            />
          </div>
          <div className="text-xs">
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={item.productDetails.totalCarat}
              value={editCarat}
              onChange={(e) => handleEditCaratChange(parseFloat(e.target.value) || 0.01)}
              className="w-20 h-8 text-xs"
              placeholder="Carat"
              disabled={isSetType}
            />
            {isSetType && (
              <div className="text-xs text-amber-600 mt-1">
                Auto: {editQuantity} × {getIndividualStoneCarat()?.toFixed(3)}ct
              </div>
            )}
          </div>
          <div className="text-xs">
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={editTotalPrice}
              onChange={(e) => handleEditTotalPriceChange(parseFloat(e.target.value) || 0.01)}
              className="w-28 h-8 text-xs"
              placeholder="Total Price"
            />
          </div>
          <Button size="sm" onClick={handleSave} className="h-8 px-2 text-xs">
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 px-2 text-xs">
            Cancel
          </Button>
        </div>
      ) : (
        <div className="text-right mr-4">
          <div className="font-medium">${item.totalPrice.toLocaleString()}</div>
          <div className="text-sm text-slate-500">
            {item.quantity} stones • {item.caratPurchased}ct @ ${item.pricePerCarat.toFixed(2)}/ct
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsEditing(true)}
            className="text-xs mt-1 h-6 px-2"
          >
            Edit
          </Button>
        </div>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemoveItem(index)}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const ProductSelection = ({
  productSearch,
  setProductSearch,
  selectedProduct,
  productResults,
  quantity,
  setQuantity,
  caratAmount,
  setCaratAmount,
  totalSellingPrice,
  setTotalSellingPrice,
  handleCaratAmountChange,
  handleTotalSellingPriceChange,
  items,
  onProductSelect,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: ProductSelectionProps) => {
  // Calculate individual stone carat for set type gems
  const getIndividualStoneCarat = (gem: Gem) => {
    if (gem.stockType === 'set' && gem.inStock && gem.inStock > 0) {
      return gem.carat / gem.inStock;
    }
    return null;
  };

  // Validate quantity and carat for set type gems
  const validateSetTypeInput = (gem: Gem, qty: number, carat: number) => {
    if (gem.stockType !== 'set') return true;
    
    const individualCarat = getIndividualStoneCarat(gem);
    if (!individualCarat) return false;
    
    // For set type, carat must be exactly quantity * individual stone carat
    const expectedCarat = qty * individualCarat;
    return Math.abs(carat - expectedCarat) < 0.001; // Allow small floating point differences
  };

  // Handle quantity change for set type gems
  const handleQuantityChange = (newQuantity: number) => {
    if (selectedProduct && selectedProduct.stockType === 'set') {
      const individualCarat = getIndividualStoneCarat(selectedProduct);
      if (individualCarat) {
        const newCaratAmount = newQuantity * individualCarat;
        setCaratAmount(newCaratAmount);
        
        // Update total selling price proportionally for set type gems
        if (totalSellingPrice && quantity > 0) {
          // Calculate price per carat from current total selling price and carat amount
          const pricePerCarat = totalSellingPrice / caratAmount;
          const newTotalPrice = newCaratAmount * pricePerCarat;
          if (setTotalSellingPrice) {
            setTotalSellingPrice(newTotalPrice);
          }
        } else if (selectedProduct.price) {
          // If no current total selling price, calculate based on gem's price per carat
          const pricePerCarat = selectedProduct.price / selectedProduct.carat;
          const newTotalPrice = newCaratAmount * pricePerCarat;
          if (setTotalSellingPrice) {
            setTotalSellingPrice(newTotalPrice);
          }
        }
      }
    }
    
    setQuantity(newQuantity);
  };

  // Handle carat change for set type gems
  const handleCaratChange = (newCarat: number) => {
    if (selectedProduct && selectedProduct.stockType === 'set') {
      const individualCarat = getIndividualStoneCarat(selectedProduct);
      if (individualCarat) {
        // For set type, calculate the quantity that would give this carat amount
        const calculatedQuantity = Math.round(newCarat / individualCarat);
        if (calculatedQuantity > 0 && calculatedQuantity <= (selectedProduct.inStock || 0)) {
          setQuantity(calculatedQuantity);
          if (handleCaratAmountChange) {
            handleCaratAmountChange(calculatedQuantity * individualCarat);
          } else if (setCaratAmount) {
            setCaratAmount(calculatedQuantity * individualCarat);
          }
        }
        return;
      }
    }
    if (handleCaratAmountChange) {
      handleCaratAmountChange(newCarat);
    } else if (setCaratAmount) {
      setCaratAmount(newCarat);
    }
  };

  const isValidForAddition = () => {
    if (!selectedProduct) return false;
    if (selectedProduct.stockType === 'set') {
      return validateSetTypeInput(selectedProduct, quantity, caratAmount);
    }
    return caratAmount <= selectedProduct.carat;
  };
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg">Add Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                    onClick={() => onProductSelect(product)}
                  >
                    <div className="font-medium">{product.stockId}</div>
                     <div className="text-sm text-slate-500">
                       {product.carat}ct total ({product.inStock || 0} stones) {product.gemType} {product.cut} {product.color} - ${(product.price / product.carat).toFixed(2)}/ct
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="quantity">Stones</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedProduct?.inStock || 999}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              placeholder={selectedProduct ? `Total: ${selectedProduct.inStock || 0}` : "1"}
            />
            {selectedProduct?.stockType === 'set' && (
              <div className="text-xs text-slate-500 mt-1">
                Individual stone: {getIndividualStoneCarat(selectedProduct)?.toFixed(3)}ct each
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="carat-amount">Carat</Label>
            <Input
              id="carat-amount"
              type="number"
              step={selectedProduct?.stockType === 'set' ? getIndividualStoneCarat(selectedProduct) || 0.01 : 0.01}
              min="0.01"
              max={selectedProduct?.carat || 999}
              value={caratAmount}
              onChange={(e) => handleCaratChange(parseFloat(e.target.value) || 0.01)}
              placeholder={selectedProduct ? `Available: ${selectedProduct.carat}ct` : "0.01"}
              disabled={selectedProduct?.stockType === 'set'}
            />
            {selectedProduct?.stockType === 'set' && (
              <div className="text-xs text-amber-600 mt-1">
                Auto-calculated: {quantity} × {getIndividualStoneCarat(selectedProduct)?.toFixed(3)}ct
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="total-selling-price">Total Selling Price</Label>
            <Input
              id="total-selling-price"
              type="number"
              step="0.01"
              min="0.01"
              value={totalSellingPrice || 0}
              onChange={(e) => {
                const newPrice = parseFloat(e.target.value) || 0;
                if (handleTotalSellingPriceChange) {
                  handleTotalSellingPriceChange(newPrice);
                } else if (setTotalSellingPrice) {
                  setTotalSellingPrice(newPrice);
                }
              }}
              placeholder="Enter total price"
            />
            {selectedProduct && (
              <div className="text-xs text-slate-500 mt-1">
                Available: ${selectedProduct.price.toLocaleString()}
              </div>
            )}
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={onAddItem}
              disabled={!selectedProduct || !isValidForAddition()}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Invoice Items */}
        {items.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Invoice Items</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <InvoiceItemRow 
                  key={index} 
                  item={item} 
                  index={index} 
                  onRemoveItem={onRemoveItem}
                  onUpdateItem={(updatedItem) => {
                    const newItems = [...items];
                    newItems[index] = updatedItem;
                    if (onUpdateItem) {
                      onUpdateItem(newItems);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
