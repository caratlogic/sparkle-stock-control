
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, FileText, Receipt, MessageCircle, Percent, Eye, ArrowUpDown, ArrowUp, ArrowDown, Settings } from 'lucide-react';
import { Customer } from '../types/customer';
import { CustomerStatusDialog } from './CustomerStatusDialog';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onCreateInvoice?: (customer: Customer) => void;
  onCreateConsignment?: (customer: Customer) => void;
  onUpdateDiscount: (customerId: string, discount: number) => void;
  onCommunicate?: (customer: Customer) => void;
  onView?: (customer: Customer) => void;
  onRefresh?: () => void;
}

export const CustomerTable = ({ 
  customers, 
  onEdit, 
  onDelete, 
  onCreateInvoice, 
  onCreateConsignment, 
  onUpdateDiscount,
  onCommunicate,
  onView,
  onRefresh
}: CustomerTableProps) => {
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);
  const [tempDiscount, setTempDiscount] = useState<number>(0);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusDialogCustomer, setStatusDialogCustomer] = useState<Customer | null>(null);

  const handleDiscountEdit = (customer: Customer) => {
    setEditingDiscount(customer.id);
    setTempDiscount(customer.discount || 0);
  };

  const handleDiscountSave = async (customerId: string) => {
    await onUpdateDiscount(customerId, tempDiscount);
    setEditingDiscount(null);
  };

  const handleDiscountCancel = () => {
    setEditingDiscount(null);
    setTempDiscount(0);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const handleSort = (column: string) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const getActivityStatus = (lastPurchaseDate: string | undefined) => {
    if (!lastPurchaseDate) return 'inactive';
    const lastPurchase = new Date(lastPurchaseDate);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    if (lastPurchase > thirtyDaysAgo) return 'active';
    if (lastPurchase > ninetyDaysAgo) return 'recent';
    return 'inactive';
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aValue: any, bValue: any;
    
    switch (sortColumn) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'email':
        aValue = a.email;
        bValue = b.email;
        break;
      case 'totalPurchases':
        aValue = a.totalPurchases || 0;
        bValue = b.totalPurchases || 0;
        break;
      case 'discount':
        aValue = a.discount || 0;
        bValue = b.discount || 0;
        break;
      case 'lastPurchaseDate':
        aValue = a.lastPurchaseDate ? new Date(a.lastPurchaseDate) : new Date(0);
        bValue = b.lastPurchaseDate ? new Date(b.lastPurchaseDate) : new Date(0);
        break;
      case 'status':
        aValue = getActivityStatus(a.lastPurchaseDate);
        bValue = getActivityStatus(b.lastPurchaseDate);
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <div className="text-lg font-medium mb-2">No customers found</div>
        <div className="text-sm">Try adjusting your search criteria or add a new customer.</div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th 
                className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Customer
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-2">
                  Contact
                  {getSortIcon('email')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('totalPurchases')}
              >
                <div className="flex items-center gap-2">
                  Total Purchases
                  {getSortIcon('totalPurchases')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('discount')}
              >
                <div className="flex items-center gap-2">
                  Discount
                  {getSortIcon('discount')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('lastPurchaseDate')}
              >
                <div className="flex items-center gap-2">
                  Last Purchase
                  {getSortIcon('lastPurchaseDate')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="text-right py-3 px-4 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.map((customer) => {
              const activityStatus = getActivityStatus(customer.lastPurchaseDate);
              
              return (
                <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-slate-900">{customer.name}</div>
                      <div className="text-sm text-slate-500">
                        {customer.customerId}
                        {customer.company && ` • ${customer.company}`}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <div>{customer.email}</div>
                      <div className="text-slate-500">{customer.phone}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium">${customer.totalPurchases.toLocaleString()}</div>
                  </td>
                  <td className="py-4 px-4">
                    {editingDiscount === customer.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={tempDiscount}
                          onChange={(e) => setTempDiscount(Number(e.target.value))}
                          className="w-20 h-8"
                          min="0"
                          max="100"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleDiscountSave(customer.id)}
                          className="h-8 px-2"
                        >
                          ✓
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleDiscountCancel}
                          className="h-8 px-2"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 rounded px-2 py-1"
                        onClick={() => handleDiscountEdit(customer)}
                      >
                        <span className="font-medium">{customer.discount || 0}%</span>
                        <Percent className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-slate-600">
                      {formatDate(customer.lastPurchaseDate)}
                    </div>
                  </td>
                   <td className="py-4 px-4">
                     <div className="flex items-center gap-2">
                       <Badge 
                         variant={customer.status === 'active' ? 'default' : 'secondary'}
                         className={
                           customer.status === 'active' 
                             ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                             : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                         }
                       >
                         {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                       </Badge>
                       <Button
                         size="sm"
                         variant="ghost"
                         onClick={() => setStatusDialogCustomer(customer)}
                         className="h-6 w-6 p-0"
                       >
                         <Settings className="w-3 h-3" />
                       </Button>
                     </div>
                   </td>
                   <td className="py-4 px-4">
                     <Badge 
                       variant={customer.kycStatus ? 'default' : 'secondary'}
                       className={
                         customer.kycStatus 
                           ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                           : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                       }
                     >
                       {customer.kycStatus ? 'Complete' : 'Pending'}
                     </Badge>
                   </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(customer)}
                          className="h-8 px-2"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onCommunicate && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCommunicate(customer)}
                          className="h-8 px-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(customer)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {onCreateInvoice && (
                            <DropdownMenuItem onClick={() => onCreateInvoice(customer)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Create Invoice
                            </DropdownMenuItem>
                          )}
                          {onCreateConsignment && (
                            <DropdownMenuItem onClick={() => onCreateConsignment(customer)}>
                              <Receipt className="mr-2 h-4 w-4" />
                              Create Consignment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteCustomerId(customer.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AlertDialog open={deleteCustomerId !== null} onOpenChange={() => setDeleteCustomerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteCustomerId) {
                  onDelete(deleteCustomerId);
                  setDeleteCustomerId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CustomerStatusDialog
        customer={statusDialogCustomer}
        open={statusDialogCustomer !== null}
        onClose={() => setStatusDialogCustomer(null)}
        onStatusUpdated={() => {
          onRefresh?.();
          setStatusDialogCustomer(null);
        }}
      />
    </>
  );
};
