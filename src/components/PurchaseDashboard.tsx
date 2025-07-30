import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, FileText, Calendar, DollarSign, Package } from 'lucide-react';
import { usePurchases } from '@/hooks/usePurchases';
import { Purchase } from '@/types/supplier';
import { PurchaseForm } from './PurchaseForm';
import { PurchaseDetailView } from './PurchaseDetailView';
import { format } from 'date-fns';

export const PurchaseDashboard = () => {
  const { purchases, loading, deletePurchase } = usePurchases();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'partial' | 'paid' | 'overdue'>('all');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.purchase_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPurchases = purchases.length;
  const totalAmount = purchases.reduce((sum, p) => sum + p.total_amount, 0);
  const totalBalance = purchases.reduce((sum, p) => sum + p.balance, 0);
  const overduePurchases = purchases.filter(p => 
    p.status === 'overdue' || (p.status !== 'paid' && new Date(p.due_date) < new Date())
  ).length;

  const handleEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsFormOpen(true);
  };

  const handleView = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailOpen(true);
  };

  const handleAdd = () => {
    setSelectedPurchase(null);
    setIsFormOpen(true);
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'paid') return 'default';
    if (status === 'overdue' || new Date(dueDate) < new Date()) return 'destructive';
    if (status === 'partial') return 'secondary';
    return 'outline';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading purchases...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground">
              Purchase orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total purchase value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Amount due
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overduePurchases}</div>
            <p className="text-xs text-muted-foreground">
              Overdue purchases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Purchase Management</CardTitle>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Purchase
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search purchases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'partial' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('partial')}
                size="sm"
              >
                Partial
              </Button>
              <Button
                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('paid')}
                size="sm"
              >
                Paid
              </Button>
              <Button
                variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('overdue')}
                size="sm"
              >
                Overdue
              </Button>
            </div>
          </div>

          {/* Purchases Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purchase ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Settled</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.purchase_id}</TableCell>
                    <TableCell>{purchase.supplier?.name}</TableCell>
                    <TableCell>{purchase.invoice_number}</TableCell>
                    <TableCell>{format(new Date(purchase.purchase_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <span className={new Date(purchase.due_date) < new Date() && purchase.status !== 'paid' ? 'text-red-600' : ''}>
                        {format(new Date(purchase.due_date), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>${purchase.total_amount.toLocaleString()}</TableCell>
                    <TableCell>${purchase.settled_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={purchase.balance > 0 ? 'text-red-600 font-medium' : ''}>
                        ${purchase.balance.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(purchase.status, purchase.due_date)}>
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(purchase)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(purchase)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePurchase(purchase.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPurchase ? 'Edit Purchase' : 'New Purchase'}
            </DialogTitle>
          </DialogHeader>
          <PurchaseForm
            purchase={selectedPurchase}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Purchase Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Purchase Details - {selectedPurchase?.purchase_id}
            </DialogTitle>
          </DialogHeader>
          <PurchaseDetailView
            purchase={selectedPurchase}
            onClose={() => setIsDetailOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};