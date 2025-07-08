
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Gem } from '../../types/gem';
import { InvoiceItem } from '../../types/customer';

interface ProductSelectionProps {
  productSearch: string;
  setProductSearch: (value: string) => void;
  selectedProduct: Gem | null;
  productResults: Gem[];
  quantity: number;
  setQuantity: (value: number) => void;
  caratAmount: number;
  setCaratAmount: (value: number) => void;
  items: InvoiceItem[];
  onProductSelect: (product: Gem) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export const ProductSelection = ({
  productSearch,
  setProductSearch,
  selectedProduct,
  productResults,
  quantity,
  setQuantity,
  caratAmount,
  setCaratAmount,
  items,
  onProductSelect,
  onAddItem,
  onRemoveItem,
}: ProductSelectionProps) => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg">Add Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <div>
            <Label htmlFor="carat-amount">Carat</Label>
            <Input
              id="carat-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={selectedProduct?.carat || 999}
              value={caratAmount}
              onChange={(e) => setCaratAmount(parseFloat(e.target.value) || 0.01)}
            />
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={onAddItem}
              disabled={!selectedProduct || caratAmount > (selectedProduct?.carat || 0)}
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
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
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
                  <div className="text-right mr-4">
                    <div className="font-medium">${item.totalPrice.toLocaleString()}</div>
                    <div className="text-sm text-slate-500">
                      {item.quantity} stones • {item.caratPurchased}ct @ ${item.pricePerCarat.toFixed(2)}/ct
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
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
  );
};
