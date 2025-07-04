import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Customer } from '../types/customer';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CustomerStatusDialogProps {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export const CustomerStatusDialog = ({ customer, open, onClose, onStatusUpdated }: CustomerStatusDialogProps) => {
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>('active');
  const [loading, setLoading] = useState(false);
  const [canChangeStatus, setCanChangeStatus] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');

  const checkCanChangeStatus = async () => {
    if (!customer || newStatus === 'active') {
      setCanChangeStatus(true);
      setValidationMessage('');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('can_customer_be_inactive', { customer_uuid: customer.id });

      if (error) throw error;

      setCanChangeStatus(data);
      if (!data) {
        setValidationMessage('Cannot set customer to inactive: Customer has active consignments or pending payments.');
      } else {
        setValidationMessage('');
      }
    } catch (error) {
      console.error('Error checking customer status:', error);
      setCanChangeStatus(false);
      setValidationMessage('Error validating customer status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: 'active' | 'inactive') => {
    setNewStatus(status);
    if (customer) {
      checkCanChangeStatus();
    }
  };

  const handleUpdateStatus = async () => {
    if (!customer || !canChangeStatus) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({ status: newStatus })
        .eq('id', customer.id);

      if (error) throw error;

      onStatusUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating customer status:', error);
      setValidationMessage('Error updating customer status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Customer Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-slate-800 mb-2">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Name:</span>
                <span className="text-sm font-medium">{customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Current Status:</span>
                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                  {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              New Status
            </label>
            <Select value={newStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newStatus === 'inactive' && canChangeStatus === false && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {validationMessage}
              </AlertDescription>
            </Alert>
          )}

          {newStatus === 'inactive' && canChangeStatus === true && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Customer can be set to inactive.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus}
            disabled={loading || (newStatus === 'inactive' && canChangeStatus === false)}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};