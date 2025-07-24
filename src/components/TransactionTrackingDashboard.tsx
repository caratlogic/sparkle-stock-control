import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { FileText, Package, Receipt, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useConsignments } from '@/hooks/useConsignments';
import { useQuotations } from '@/hooks/useQuotations';
import { useGems } from '@/hooks/useGems';
import { format } from 'date-fns';

export const TransactionTrackingDashboard = () => {
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { consignments, loading: consignmentsLoading } = useConsignments();
  const { quotations, loading: quotationsLoading } = useQuotations();
  const { gems } = useGems();

  const [ownershipFilter, setOwnershipFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Combine all transactions
  const allTransactions = useMemo(() => {
    const transactions: Array<{
      id: string;
      type: 'invoice' | 'consignment' | 'quotation';
      number: string;
      customer: string;
      date: string;
      amount: number;
      status: string;
      ownershipStatus: string;
      associatedEntity: string;
      items: Array<{ gemId: string; stockId?: string; ownership_status?: string; associated_entity?: string }>;
      currency?: string;
    }> = [];

    // Add invoices
    invoices.forEach(invoice => {
      const invoiceItems = invoice.items?.map(item => {
        const gem = gems.find(g => g.id === item.productId);
        return {
          gemId: item.productId,
          stockId: gem?.stockId,
          ownership_status: gem?.ownershipStatus || 'O',
          associated_entity: gem?.associatedEntity || 'Self'
        };
      }) || [];

      // Determine ownership status and entity from gems
      const ownershipStatuses = [...new Set(invoiceItems.map(item => item.ownership_status))];
      const entities = [...new Set(invoiceItems.map(item => item.associated_entity))];

      transactions.push({
        id: invoice.id,
        type: 'invoice',
        number: invoice.invoiceNumber,
        customer: invoice.customerDetails?.name || 'Unknown',
        date: invoice.dateCreated,
        amount: invoice.total,
        status: invoice.status,
        ownershipStatus: ownershipStatuses.join(', '),
        associatedEntity: entities.join(', '),
        items: invoiceItems,
        currency: invoice.currency || invoice.customerDetails?.currency || 'USD'
      });
    });

    // Add consignments
    consignments.forEach(consignment => {
      const consignmentItems = consignment.items?.map(item => {
        const gem = gems.find(g => g.id === item.gemId);
        return {
          gemId: item.gemId,
          stockId: gem?.stockId,
          ownership_status: gem?.ownershipStatus || 'O',
          associated_entity: gem?.associatedEntity || 'Self'
        };
      }) || [];

      const ownershipStatuses = [...new Set(consignmentItems.map(item => item.ownership_status))];
      const entities = [...new Set(consignmentItems.map(item => item.associated_entity))];

      transactions.push({
        id: consignment.id,
        type: 'consignment',
        number: consignment.consignmentNumber,
        customer: consignment.customerDetails?.name || 'Unknown',
        date: consignment.dateCreated,
        amount: consignmentItems.reduce((sum, item) => {
          const consignmentItem = consignment.items?.find(ci => ci.gemId === item.gemId);
          return sum + (consignmentItem?.totalPrice || 0);
        }, 0),
        status: consignment.status,
        ownershipStatus: ownershipStatuses.join(', '),
        associatedEntity: entities.join(', '),
        items: consignmentItems,
        currency: consignment.currency || 'USD'
      });
    });

    // Add quotations
    quotations.forEach(quotation => {
      // For quotations, we'll use a simpler approach since we don't have detailed gem info
      transactions.push({
        id: quotation.id,
        type: 'quotation',
        number: quotation.quotationNumber,
        customer: 'Unknown', // Quotations don't have customer details in this structure
        date: quotation.dateCreated,
        amount: quotation.total,
        status: quotation.status,
        ownershipStatus: 'Mixed', // Since we don't have detailed gem data for quotations
        associatedEntity: 'Mixed',
        items: [],
        currency: quotation.currency || 'USD'
      });
    });

    return transactions;
  }, [invoices, consignments, quotations, gems]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;
      if (ownershipFilter !== 'all' && !transaction.ownershipStatus.includes(ownershipFilter)) return false;
      if (entityFilter !== 'all' && !transaction.associatedEntity.includes(entityFilter)) return false;
      if (searchTerm && !transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !transaction.number.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [allTransactions, typeFilter, ownershipFilter, entityFilter, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    
    const invoiceCount = filteredTransactions.filter(t => t.type === 'invoice').length;
    const consignmentCount = filteredTransactions.filter(t => t.type === 'consignment').length;
    const quotationCount = filteredTransactions.filter(t => t.type === 'quotation').length;

    // Calculate totals by currency and ownership
    const currencyBreakdown = filteredTransactions.reduce((acc, t) => {
      const currency = t.currency || 'USD';
      if (!acc[currency]) {
        acc[currency] = { total: 0, owned: 0, consigned: 0, partner: 0 };
      }
      
      acc[currency].total += t.amount;
      
      if (t.ownershipStatus.includes('O')) acc[currency].owned += t.amount;
      if (t.ownershipStatus.includes('C')) acc[currency].consigned += t.amount;
      if (t.ownershipStatus.includes('P')) acc[currency].partner += t.amount;
      
      return acc;
    }, {} as Record<string, { total: number; owned: number; consigned: number; partner: number }>);

    // Legacy totals (USD equivalent for compatibility)
    const totalValue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const ownershipBreakdown = filteredTransactions.reduce((acc, t) => {
      if (t.ownershipStatus.includes('O')) acc.owned += t.amount;
      if (t.ownershipStatus.includes('C')) acc.consigned += t.amount;
      if (t.ownershipStatus.includes('P')) acc.partner += t.amount;
      return acc;
    }, { owned: 0, consigned: 0, partner: 0 });

    return {
      totalTransactions,
      totalValue,
      invoiceCount,
      consignmentCount,
      quotationCount,
      ownershipBreakdown,
      currencyBreakdown
    };
  }, [filteredTransactions]);

  const isLoading = invoicesLoading || consignmentsLoading || quotationsLoading;

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Get unique ownership statuses and entities for filters
  const ownershipStatuses = [...new Set(allTransactions.flatMap(t => t.ownershipStatus.split(', ')))]
    .filter(status => status && status.trim() !== '');
  const entities = [...new Set(allTransactions.flatMap(t => t.associatedEntity.split(', ')))]
    .filter(entity => entity && entity.trim() !== '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Transaction Tracking</h1>
        <p className="text-muted-foreground">
          Track invoices, consignments, and quotations by ownership status and associated entity
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Transaction Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="consignment">Consignments</SelectItem>
                  <SelectItem value="quotation">Quotations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ownership Status</Label>
              <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {ownershipStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Associated Entity</Label>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entities.map(entity => (
                    <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Search</Label>
              <Input
                placeholder="Search by customer or transaction number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.invoiceCount} invoices, {stats.consignmentCount} consignments, {stats.quotationCount} quotations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All transactions combined
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Own Revenue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.ownershipBreakdown.owned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Self-owned gems
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.ownershipBreakdown.partner.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Partner gems
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consigned Revenue</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.ownershipBreakdown.consigned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Consigned gems
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Own vs Partner</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {stats.totalValue > 0 ? ((stats.ownershipBreakdown.owned / stats.totalValue) * 100).toFixed(1) : 0}% / {stats.totalValue > 0 ? ((stats.ownershipBreakdown.partner / stats.totalValue) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Own / Partner split
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Section */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown by Currency</CardTitle>
          <CardDescription>
            Detailed breakdown of revenue by currency and ownership type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(stats.currencyBreakdown).map(([currency, breakdown]) => (
              <div key={currency} className="space-y-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  {currency === 'EUR' ? '€' : '$'} {currency}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({currency === 'EUR' ? '€' : '$'}{breakdown.total.toLocaleString()})
                  </span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Own Revenue</span>
                      <span className="text-lg font-bold text-green-600">
                        {currency === 'EUR' ? '€' : '$'}{breakdown.owned.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${breakdown.total > 0 ? (breakdown.owned / breakdown.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {breakdown.total > 0 ? ((breakdown.owned / breakdown.total) * 100).toFixed(1) : 0}% of {currency} revenue
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Partner Revenue</span>
                      <span className="text-lg font-bold text-blue-600">
                        {currency === 'EUR' ? '€' : '$'}{breakdown.partner.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${breakdown.total > 0 ? (breakdown.partner / breakdown.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {breakdown.total > 0 ? ((breakdown.partner / breakdown.total) * 100).toFixed(1) : 0}% of {currency} revenue
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Consigned Revenue</span>
                      <span className="text-lg font-bold text-purple-600">
                        {currency === 'EUR' ? '€' : '$'}{breakdown.consigned.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ 
                          width: `${breakdown.total > 0 ? (breakdown.consigned / breakdown.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {breakdown.total > 0 ? ((breakdown.consigned / breakdown.total) * 100).toFixed(1) : 0}% of {currency} revenue
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Detailed view of all transactions with ownership and entity information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ownership Status</TableHead>
                <TableHead>Associated Entity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={`${transaction.type}-${transaction.id}`}>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {transaction.type === 'invoice' && <Receipt className="w-3 h-3 mr-1" />}
                      {transaction.type === 'consignment' && <Package className="w-3 h-3 mr-1" />}
                      {transaction.type === 'quotation' && <FileText className="w-3 h-3 mr-1" />}
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.number}</TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    {transaction.currency === 'EUR' ? '€' : '$'}{transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {transaction.currency || 'USD'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        transaction.status === 'paid' ? 'default' :
                        transaction.status === 'sent' ? 'secondary' :
                        transaction.status === 'pending' ? 'destructive' :
                        'outline'
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {transaction.ownershipStatus.split(', ').map((status, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {status}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {transaction.associatedEntity.split(', ').map((entity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};