
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Mail, MessageCircle, AlertTriangle, Calendar } from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';

interface ReceivablesTrackerProps {
  onClose: () => void;
}

export const ReceivablesTracker = ({ onClose }: ReceivablesTrackerProps) => {
  const { invoices } = useInvoices();
  
  // Filter unpaid invoices
  const unpaidInvoices = invoices.filter(invoice => 
    invoice.status !== 'paid' && invoice.status !== 'cancelled'
  );

  // Group by customer
  const receivablesByCustomer = unpaidInvoices.reduce((acc, invoice) => {
    const customerId = invoice.customerId;
    if (!acc[customerId]) {
      acc[customerId] = {
        customerName: invoice.customerDetails.name,
        customerEmail: invoice.customerDetails.email,
        invoices: [],
        totalAmount: 0,
        overdueCount: 0
      };
    }
    
    acc[customerId].invoices.push(invoice);
    acc[customerId].totalAmount += invoice.total;
    
    // Check if overdue (past due date)
    const dueDate = new Date(invoice.dateDue);
    const today = new Date();
    if (dueDate < today) {
      acc[customerId].overdueCount++;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const sendReminder = (customerEmail: string, type: 'email' | 'whatsapp') => {
    console.log(`Sending ${type} reminder to ${customerEmail}`);
    // Implement reminder logic
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
            Outstanding Receivables
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(receivablesByCustomer).map(([customerId, data]) => (
            <div key={customerId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{data.customerName}</h3>
                  <p className="text-sm text-slate-600">{data.customerEmail}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-2xl font-bold text-red-600">
                      ${data.totalAmount.toLocaleString()}
                    </span>
                    {data.overdueCount > 0 && (
                      <Badge className="bg-red-100 text-red-800">
                        {data.overdueCount} Overdue
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendReminder(data.customerEmail, 'email')}
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendReminder(data.customerEmail, 'whatsapp')}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Days Overdue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.invoices.map((invoice: any) => {
                      const dueDate = new Date(invoice.dateDue);
                      const today = new Date();
                      const daysOverdue = Math.max(0, Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
                      
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {dueDate.toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${invoice.total.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(isOverdue(invoice.dateDue) ? 'overdue' : invoice.status)}>
                              {isOverdue(invoice.dateDue) ? 'Overdue' : invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {daysOverdue > 0 && (
                              <span className="text-red-600 font-semibold">
                                {daysOverdue} days
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}

          {Object.keys(receivablesByCustomer).length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No outstanding receivables found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
