import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar, DollarSign, Package, MapPin, Star } from 'lucide-react';
import { usePurchases } from '@/hooks/usePurchases';
import { Purchase, PurchaseItem } from '@/types/supplier';
import { format } from 'date-fns';

interface PurchaseDetailViewProps {
  purchase: Purchase | null;
  onClose: () => void;
}

export const PurchaseDetailView: React.FC<PurchaseDetailViewProps> = ({ purchase, onClose }) => {
  const { fetchPurchaseItems } = usePurchases();
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (purchase) {
      loadPurchaseItems();
    }
  }, [purchase]);

  const loadPurchaseItems = async () => {
    if (!purchase) return;
    
    setLoading(true);
    try {
      const purchaseItems = await fetchPurchaseItems(purchase.id);
      setItems(purchaseItems);
    } catch (error) {
      console.error('Error loading purchase items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!purchase) {
    return <div>No purchase selected</div>;
  }

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'paid') return 'default';
    if (status === 'overdue' || new Date(dueDate) < new Date()) return 'destructive';
    if (status === 'partial') return 'secondary';
    return 'outline';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Purchase Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{purchase.purchase_id}</CardTitle>
              <p className="text-muted-foreground">Invoice: {purchase.invoice_number}</p>
            </div>
            <Badge variant={getStatusColor(purchase.status, purchase.due_date)} className="text-sm">
              {purchase.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Purchase Date</p>
                <p className="font-medium">{format(new Date(purchase.purchase_date), 'MMM d, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className={`font-medium ${new Date(purchase.due_date) < new Date() && purchase.status !== 'paid' ? 'text-red-600' : ''}`}>
                  {format(new Date(purchase.due_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium text-lg">${purchase.total_amount.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className={`font-medium text-lg ${purchase.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${purchase.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Information */}
      {purchase.supplier && (
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-lg">{purchase.supplier.name}</h4>
                <p className="text-muted-foreground">ID: {purchase.supplier.supplier_id}</p>
                
                {purchase.supplier.email && (
                  <p className="text-sm mt-2">📧 {purchase.supplier.email}</p>
                )}
                
                {purchase.supplier.phone && (
                  <p className="text-sm">📞 {purchase.supplier.phone}</p>
                )}
                
                {purchase.supplier.address && (
                  <div className="flex items-start gap-1 mt-2">
                    <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground" />
                    <p className="text-sm">{purchase.supplier.address}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Payment Terms:</span>
                  <span className="ml-2 font-medium">{purchase.supplier.payment_terms}</span>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Credit Limit:</span>
                  <span className="ml-2 font-medium">${purchase.supplier.credit_limit.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Reliability:</span>
                  <div className="flex items-center gap-1">
                    {renderStars(purchase.supplier.reliability_rating)}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={purchase.supplier.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                    {purchase.supplier.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Financial Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">${purchase.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({purchase.tax_rate}%):</span>
              <span className="font-medium">${purchase.tax_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total:</span>
              <span>${purchase.total_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Settled Amount:</span>
              <span className="font-medium text-green-600">${purchase.settled_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Outstanding Balance:</span>
              <span className={purchase.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                ${purchase.balance.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Carats:</span>
              <span className="font-medium">{items.reduce((sum, item) => sum + (item.carat * item.quantity), 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Currency:</span>
              <span className="font-medium">{purchase.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span className="font-medium">{format(new Date(purchase.created_at), 'MMM d, yyyy')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Items */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading items...</div>
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gem Type</TableHead>
                    <TableHead>Shape</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Carat</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price/Unit</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.gem_type || '-'}</TableCell>
                      <TableCell>{item.shape || '-'}</TableCell>
                      <TableCell>{item.color || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.treatment}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.origin || '-'}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{item.certificate_type}</div>
                          {item.certificate_number && (
                            <div className="text-muted-foreground">{item.certificate_number}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.carat.toFixed(2)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price_per_unit.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">${item.total_price.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">No items found</div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {purchase.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{purchase.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Close Button */}
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};