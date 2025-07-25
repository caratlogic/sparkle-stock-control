import React from 'react';
import { ArrowLeft, Receipt, FileText, DollarSign, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useAssociatedEntities, useAssociatedEntityTransactions } from '../hooks/useAssociatedEntities';
import { useInvoices } from '../hooks/useInvoices';
import { useCustomers } from '../hooks/useCustomers';

interface AssociatedEntityDetailViewProps {
  entityId: string;
  onBack: () => void;
}

export const AssociatedEntityDetailView: React.FC<AssociatedEntityDetailViewProps> = ({
  entityId,
  onBack
}) => {
  const { associatedEntities } = useAssociatedEntities();
  const { transactions } = useAssociatedEntityTransactions();
  const { invoices } = useInvoices();
  const { customers } = useCustomers();

  const entity = associatedEntities.find(e => e.id === entityId);
  const entityTransactions = transactions.filter(t => t.associated_entity_id === entityId);
  
  // Get all invoices related to this entity
  const relatedInvoices = invoices.filter(invoice => 
    entityTransactions.some(transaction => transaction.transaction_id === invoice.id)
  );

  // Calculate stats
  const totalRevenue = entityTransactions.reduce((sum, t) => sum + Number(t.revenue_amount), 0);
  const totalTransactions = entityTransactions.length;

  if (!entity) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <p>Entity not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Associated Entities
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{entity.name}</h1>
        <p className="text-slate-600">{entity.company || 'No company specified'}</p>
        <div className="flex items-center space-x-4 mt-2">
          <Badge variant={entity.status === 'active' ? 'default' : 'secondary'}>
            {entity.status}
          </Badge>
          {entity.email && (
            <span className="text-sm text-slate-600">{entity.email}</span>
          )}
          {entity.phone && (
            <span className="text-sm text-slate-600">{entity.phone}</span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-800">{totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Invoices</p>
                <p className="text-2xl font-bold text-slate-800">{relatedInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Related Invoices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relatedInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Entity Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedInvoices.map((invoice) => {
                  const customer = customers.find(c => c.id === invoice.customerId);
                  const entityTransaction = entityTransactions.find(t => t.transaction_id === invoice.id);
                  
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{customer?.name || 'Unknown Customer'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(invoice.dateCreated).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          invoice.status === 'paid' ? 'default' : 
                          invoice.status === 'sent' ? 'secondary' : 
                          invoice.status === 'overdue' ? 'destructive' : 'outline'
                        }>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${Number(invoice.total).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        ${Number(entityTransaction?.revenue_amount || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No invoices found for this entity</p>
              <p className="text-sm text-slate-500">Invoices will appear here when gems with memo ownership status are sold</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="w-5 h-5" />
            <span>Transaction History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entityTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ownership Status</TableHead>
                  <TableHead>Revenue Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entityTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(transaction.transaction_date).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {transaction.ownership_status === 'M' ? 'Memo' : transaction.ownership_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      ${Number(transaction.revenue_amount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};