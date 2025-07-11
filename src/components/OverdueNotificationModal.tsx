import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Calendar, DollarSign, Package, X } from 'lucide-react';
import { useInvoices } from '../hooks/useInvoices';
import { useConsignments } from '../hooks/useConsignments';

interface OverdueNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OverdueNotificationModal = ({ isOpen, onClose }: OverdueNotificationModalProps) => {
  const { invoices } = useInvoices();
  const { consignments } = useConsignments();
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);
  const [overdueConsignments, setOverdueConsignments] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Find overdue invoices (more than 1 month old)
    const overdue = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.dateCreated);
      return (
        (invoice.status === 'sent' || invoice.status === 'overdue') &&
        invoiceDate < oneMonthAgo
      );
    });

    // Find overdue consignments (past return date by more than 1 month)
    const overdueConsigns = consignments.filter(consignment => {
      const returnDate = new Date(consignment.returnDate);
      return (
        consignment.status === 'pending' &&
        returnDate < oneMonthAgo
      );
    });

    setOverdueInvoices(overdue);
    setOverdueConsignments(overdueConsigns);
  }, [isOpen, invoices, consignments]);

  const hasOverdueItems = overdueInvoices.length > 0 || overdueConsignments.length > 0;

  if (!hasOverdueItems && isOpen) {
    onClose();
    return null;
  }

  const calculateDaysOverdue = (date: string) => {
    const targetDate = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - targetDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            Urgent: Overdue Items Requiring Attention
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have {overdueInvoices.length + overdueConsignments.length} overdue items requiring immediate attention.
              These items are more than 1 month overdue.
            </AlertDescription>
          </Alert>

          {/* Overdue Invoices */}
          {overdueInvoices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <DollarSign className="w-5 h-5" />
                  Overdue Payments ({overdueInvoices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-slate-600">{invoice.customerDetails.name}</div>
                        <div className="text-sm text-red-600">
                          {calculateDaysOverdue(invoice.dateCreated)} days overdue
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">${invoice.total.toLocaleString()}</div>
                        <Badge variant="destructive">Overdue</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overdue Consignments */}
          {overdueConsignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Package className="w-5 h-5" />
                  Overdue Consignments ({overdueConsignments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueConsignments.map((consignment) => (
                    <div key={consignment.id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                      <div>
                        <div className="font-medium">{consignment.consignmentNumber}</div>
                        <div className="text-sm text-slate-600">{consignment.customerDetails.name}</div>
                        <div className="text-sm text-orange-600">
                          {calculateDaysOverdue(consignment.returnDate)} days past return date
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-orange-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">Return due: {new Date(consignment.returnDate).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">Overdue</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-3">
            <Button onClick={onClose} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Acknowledge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};