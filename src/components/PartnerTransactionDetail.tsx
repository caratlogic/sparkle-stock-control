import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ArrowLeft, DollarSign, FileText, Gem, TrendingUp } from 'lucide-react';
import { Partner } from '@/hooks/usePartners';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PartnerTransaction {
  id: string;
  transaction_type: string;
  transaction_id: string;
  ownership_status: string;
  associated_entity: string;
  revenue_amount: number;
  partner_share: number;
  transaction_date: string;
  created_at: string;
  invoice_number?: string;
  gem_stock_id?: string;
  gem_type?: string;
  gem_carat?: number;
  customer_name?: string;
}

interface PartnerTransactionDetailProps {
  partner: Partner;
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerTransactionDetail = ({ partner, isOpen, onClose }: PartnerTransactionDetailProps) => {
  const [transactions, setTransactions] = useState<PartnerTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && partner) {
      fetchPartnerTransactions();
    }
  }, [isOpen, partner]);

  const fetchPartnerTransactions = async () => {
    setLoading(true);
    try {
      // First, fetch partner transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('partner_transactions')
        .select('*')
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      if (!transactionsData || transactionsData.length === 0) {
        setTransactions([]);
        return;
      }

      // Get all unique transaction IDs (invoice IDs)
      const invoiceIds = transactionsData.map(t => t.transaction_id);

      // Fetch invoices with customer data
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          customer_id,
          customers(name)
        `)
        .in('id', invoiceIds);

      if (invoicesError) throw invoicesError;

      // Fetch invoice items with gem data
      const { data: invoiceItemsData, error: invoiceItemsError } = await supabase
        .from('invoice_items')
        .select(`
          invoice_id,
          gem_id,
          carat_purchased,
          gems(
            stock_id,
            gem_type,
            carat
          )
        `)
        .in('invoice_id', invoiceIds);

      if (invoiceItemsError) throw invoiceItemsError;

      // Combine the data
      const formattedTransactions = transactionsData.map((transaction: any) => {
        const invoice = invoicesData?.find(inv => inv.id === transaction.transaction_id);
        const invoiceItems = invoiceItemsData?.filter(item => item.invoice_id === transaction.transaction_id);
        
        // Get the first gem from the invoice items (there might be multiple gems per invoice)
        const firstGem = invoiceItems?.[0];

        return {
          id: transaction.id,
          transaction_type: transaction.transaction_type,
          transaction_id: transaction.transaction_id,
          ownership_status: transaction.ownership_status,
          associated_entity: transaction.associated_entity,
          revenue_amount: transaction.revenue_amount,
          partner_share: transaction.partner_share,
          transaction_date: transaction.transaction_date,
          created_at: transaction.created_at,
          invoice_number: invoice?.invoice_number,
          customer_name: invoice?.customers?.name,
          gem_stock_id: firstGem?.gems?.stock_id,
          gem_type: firstGem?.gems?.gem_type,
          gem_carat: firstGem?.carat_purchased || firstGem?.gems?.carat
        };
      });

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching partner transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch partner transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + t.revenue_amount, 0);
  const totalPartnerShare = transactions.reduce((sum, t) => sum + t.partner_share, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <DialogTitle className="text-xl">
                {partner.name} - Transaction Details
              </DialogTitle>
              <DialogDescription>
                Detailed view of all transactions and revenue sharing for this partner
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Partner Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Percentage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Per Gem</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Partner Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPartnerShare.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              All invoices and revenue generated from {partner.name}'s gems
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-muted-foreground">Loading transactions...</div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-muted-foreground">No transactions found for this partner</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Gem Details</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Partner Share</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.invoice_number}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.customer_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Gem className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{transaction.gem_stock_id}</div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.gem_type} • {transaction.gem_carat}ct
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${transaction.revenue_amount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">
                          ${transaction.partner_share.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          (Variable by gem)
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="capitalize">
                          {transaction.transaction_type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};