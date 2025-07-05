import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, Download, FileText, DollarSign } from 'lucide-react';
import { CustomerFilter } from './ui/customer-filter';
import { useCustomers } from '../hooks/useCustomers';
import { useCreditNotes } from '../hooks/useCreditNotes';
import { useToast } from '@/hooks/use-toast';

export const CreditNotesDashboard = () => {
  const { creditNotes, loading } = useCreditNotes();
  const { customers } = useCustomers();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const filteredCreditNotes = creditNotes.filter(creditNote => {
    const matchesSearch = 
      creditNote.creditNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerName(creditNote.customerId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      creditNote.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCustomer = customerFilter === 'all' || creditNote.customerId === customerFilter;
    
    return matchesSearch && matchesCustomer;
  });

  const totalCreditNotes = creditNotes.length;
  const totalCreditAmount = creditNotes.reduce((sum, note) => sum + note.amount, 0);
  const activeCreditNotes = creditNotes.filter(note => note.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Credit Notes Dashboard</h2>
          <p className="text-slate-600">View and manage customer credit notes</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Credit Notes</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totalCreditNotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Credit Notes</CardTitle>
            <Badge className="h-4 w-4 bg-green-100 text-green-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCreditNotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Credit Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalCreditAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by credit note number, customer, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <CustomerFilter
          customers={customers}
          value={customerFilter}
          onValueChange={setCustomerFilter}
          placeholder="Filter by Customer"
        />
      </div>

      {/* Credit Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b-2 border-slate-200">
                  <TableHead className="font-semibold text-slate-800 py-4">Credit Note #</TableHead>
                  <TableHead className="font-semibold text-slate-800 py-4">Customer</TableHead>
                  <TableHead className="font-semibold text-slate-800 py-4">Date</TableHead>
                  <TableHead className="font-semibold text-slate-800 py-4">Amount</TableHead>
                  <TableHead className="font-semibold text-slate-800 py-4">Reason</TableHead>
                  <TableHead className="font-semibold text-slate-800 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-slate-800 py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading credit notes...
                    </TableCell>
                  </TableRow>
                ) : filteredCreditNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No credit notes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCreditNotes.map((creditNote) => (
                    <TableRow key={creditNote.id}>
                      <TableCell className="font-medium">
                        {creditNote.creditNoteNumber}
                      </TableCell>
                      <TableCell>{getCustomerName(creditNote.customerId)}</TableCell>
                      <TableCell>
                        {new Date(creditNote.dateCreated).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">
                        ${creditNote.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={creditNote.reason}>
                          {creditNote.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={creditNote.status === 'active' ? 'default' : 'secondary'}
                          className={creditNote.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {creditNote.status.charAt(0).toUpperCase() + creditNote.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Download Credit Note"
                            onClick={() => {
                              toast({
                                title: "Download",
                                description: "Credit note download functionality will be implemented",
                              });
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};