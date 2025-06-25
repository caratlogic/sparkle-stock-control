
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Eye } from 'lucide-react';
import { Customer } from '../types/customer';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const CustomerTable = ({ customers, onEdit }: CustomerTableProps) => {
  const isRecentCustomer = (dateAdded: string) => {
    const added = new Date(dateAdded);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return added > thirtyDaysAgo;
  };

  const isActiveCustomer = (lastPurchaseDate?: string) => {
    if (!lastPurchaseDate) return false;
    const lastPurchase = new Date(lastPurchaseDate);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return lastPurchase > ninetyDaysAgo;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Total Purchases</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Purchase</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="hover:bg-slate-50">
              <TableCell className="font-medium">{customer.customerId}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-slate-500">{customer.phone}</div>
                </div>
              </TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.company || 'Individual'}</TableCell>
              <TableCell className="font-medium">
                ${customer.totalPurchases.toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {isRecentCustomer(customer.dateAdded) && (
                    <Badge variant="secondary" className="text-xs">New</Badge>
                  )}
                  {isActiveCustomer(customer.lastPurchaseDate) && (
                    <Badge variant="default" className="text-xs bg-emerald-500">Active</Badge>
                  )}
                  {!isActiveCustomer(customer.lastPurchaseDate) && customer.lastPurchaseDate && (
                    <Badge variant="outline" className="text-xs">Inactive</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {customer.lastPurchaseDate ? (
                  <div className="text-sm">
                    {new Date(customer.lastPurchaseDate).toLocaleDateString()}
                  </div>
                ) : (
                  <span className="text-slate-400 text-sm">Never</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(customer)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
