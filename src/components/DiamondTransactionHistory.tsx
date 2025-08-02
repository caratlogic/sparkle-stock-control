import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Diamond } from '../types/diamond';

interface DiamondTransactionHistoryProps {
  diamond: Diamond | null;
  open: boolean;
  onClose: () => void;
}

export const DiamondTransactionHistory = ({ diamond, open, onClose }: DiamondTransactionHistoryProps) => {
  if (!diamond) return null;

  // This would typically fetch transaction history from the backend
  const mockTransactions = [
    {
      id: 1,
      type: 'purchase',
      date: '2024-01-15',
      description: 'Initial purchase from supplier',
      quantity: 1,
      amount: diamond.cost_price,
      status: 'completed'
    },
    {
      id: 2,
      type: 'reserve',
      date: '2024-02-20',
      description: 'Reserved for customer ABC123',
      quantity: 1,
      amount: 0,
      status: 'active'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Transaction History - {diamond.stock_number}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diamond Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Weight</label>
                  <p className="font-medium">{diamond.weight}ct</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Shape</label>
                  <p className="font-medium">{diamond.shape}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Color</label>
                  <p className="font-medium">{diamond.color}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Clarity</label>
                  <p className="font-medium">{diamond.clarity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <p className="text-sm text-slate-600">{transaction.date}</p>
                      </div>
                      <Badge 
                        variant={
                          transaction.status === 'completed' ? 'secondary' :
                          transaction.status === 'active' ? 'default' :
                          'destructive'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Type: {transaction.type}</span>
                      <span>Quantity: {transaction.quantity}</span>
                      {transaction.amount > 0 && (
                        <span>Amount: ${transaction.amount?.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};