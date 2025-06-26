
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, FileText, Receipt, Check, X } from 'lucide-react';
import { Customer } from '../types/customer';
import { useState } from 'react';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onCreateInvoice?: (customer: Customer) => void;
  onCreateConsignment?: (customer: Customer) => void;
  onUpdateDiscount?: (customerId: string, discount: number) => void;
}

export const CustomerTable = ({ 
  customers, 
  onEdit, 
  onDelete, 
  onCreateInvoice, 
  onCreateConsignment,
  onUpdateDiscount 
}: CustomerTableProps) => {
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);
  const [tempDiscount, setTempDiscount] = useState<number>(0);

  const handleEditDiscount = (customer: Customer) => {
    setEditingDiscount(customer.id);
    setTempDiscount(customer.discount || 0);
  };

  const handleSaveDiscount = (customerId: string) => {
    if (onUpdateDiscount) {
      onUpdateDiscount(customerId, tempDiscount);
    }
    setEditingDiscount(null);
  };

  const handleCancelDiscount = () => {
    setEditingDiscount(null);
    setTempDiscount(0);
  };

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg mb-2">No customers found</div>
        <div className="text-slate-500">Try adjusting your search criteria</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-medium text-slate-600">Customer ID</th>
            <th className="text-left py-3 px-4 font-medium text-slate-600">Name</th>
            <th className="text-left py-3 px-4 font-medium text-slate-600">Email</th>
            <th className="text-left py-3 px-4 font-medium text-slate-600">Phone</th>
            <th className="text-left py-3 px-4 font-medium text-slate-600">Company</th>
            <th className="text-left py-3 px-4 font-medium text-slate-600">Discount (%)</th>
            <th className="text-left py-3 px-4 font-medium text-slate-600">Total Purchases</th>
            <th className="text-left py-3 px-4 font-medium text-slate-600">Last Purchase</th>
            <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-4 px-4">
                <Badge variant="outline" className="font-mono">
                  {customer.customerId}
                </Badge>
              </td>
              <td className="py-4 px-4">
                <div className="font-medium text-slate-800">{customer.name}</div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-slate-600">{customer.email}</div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-slate-600">{customer.phone}</div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-slate-600">{customer.company || '-'}</div>
              </td>
              <td className="py-4 px-4">
                {editingDiscount === customer.id ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={tempDiscount}
                      onChange={(e) => setTempDiscount(parseFloat(e.target.value) || 0)}
                      className="w-20"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveDiscount(customer.id)}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelDiscount}
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="cursor-pointer hover:bg-slate-100 p-1 rounded"
                    onClick={() => handleEditDiscount(customer)}
                  >
                    <span className="font-medium text-blue-600">
                      {customer.discount || 0}%
                    </span>
                  </div>
                )}
              </td>
              <td className="py-4 px-4">
                <div className="font-semibold text-emerald-600">
                  ${customer.totalPurchases.toLocaleString()}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="text-sm text-slate-600">
                  {customer.lastPurchaseDate || 'Never'}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(customer)}
                    title="Edit Customer"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {onCreateInvoice && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCreateInvoice(customer)}
                      title="Create Invoice"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                    </Button>
                  )}
                  {onCreateConsignment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCreateConsignment(customer)}
                      title="Create Consignment"
                    >
                      <Receipt className="w-4 h-4 text-purple-600" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(customer.id)}
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
