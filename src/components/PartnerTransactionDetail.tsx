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
      const { data, error } = await supabase
        .from('partner_transactions')
        .select(`
          *,
          invoices!inner(
            invoice_number,
            customer_id,
            customers(name)
          ),
          invoice_items!inner(
            gem_id,
            carat_purchased,
            gems(
              stock_id,
              gem_type,
              carat
            )
          )
        `)
        .eq('partner_id', partner.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTransactions = data?.map((transaction: any) => ({
        id: transaction.id,
        transaction_type: transaction.transaction_type,
        transaction_id: transaction.transaction_id,
        ownership_status: transaction.ownership_status,
        associated_entity: transaction.associated_entity,
        revenue_amount: transaction.revenue_amount,
        partner_share: transaction.partner_share,
        transaction_date: transaction.transaction_date,
        created_at: transaction.created_at,
        invoice_number: transaction.invoices?.invoice_number,
        customer_name: transaction.invoices?.customers?.name,
        gem_stock_id: transaction.invoice_items?.[0]?.gems?.stock_id,
        gem_type: transaction.invoice_items?.[0]?.gems?.gem_type,
        gem_carat: transaction.invoice_items?.[0]?.carat_purchased || transaction.invoice_items?.[0]?.gems?.carat
      })) || [];

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
                Ownership %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partner.ownership_percentage}%</div>
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
                          ({partner.ownership_percentage}%)
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