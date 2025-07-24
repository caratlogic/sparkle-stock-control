import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InvoiceItem } from '../types/customer';
import { useGems } from '../hooks/useGems';

interface TransactionDetailsCardProps {
  items: InvoiceItem[];
  type: 'invoice' | 'consignment' | 'quotation';
}

export const TransactionDetailsCard = ({ items, type }: TransactionDetailsCardProps) => {
  const { gems } = useGems();

  // Get unique ownership statuses and associated entities from items
  const getTransactionDetails = () => {
    const ownershipStatuses = new Set<string>();
    const associatedEntities = new Set<string>();

    items.forEach(item => {
      const gem = gems.find(g => g.id === item.productId);
      if (gem) {
        ownershipStatuses.add(gem.ownershipStatus || 'O');
        associatedEntities.add(gem.associatedEntity || 'Self');
      }
    });

    return {
      ownershipStatuses: Array.from(ownershipStatuses),
      associatedEntities: Array.from(associatedEntities)
    };
  };

  const { ownershipStatuses, associatedEntities } = getTransactionDetails();

  const getOwnershipStatusLabel = (status: string) => {
    switch (status) {
      case 'P': return 'Partner Stone';
      case 'M': return 'Memo';
      case 'O': return 'Owned';
      default: return status;
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg capitalize">{type} Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Ownership Status</h4>
          <div className="flex flex-wrap gap-2">
            {ownershipStatuses.map((status, index) => (
              <Badge key={index} variant="outline">
                {getOwnershipStatusLabel(status)}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Associated Entity</h4>
          <div className="flex flex-wrap gap-2">
            {associatedEntities.map((entity, index) => (
              <Badge key={index} variant="secondary">
                {entity}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Items:</span>
              <span className="ml-2 font-medium">{items.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Carat:</span>
              <span className="ml-2 font-medium">
                {items.reduce((sum, item) => sum + item.caratPurchased, 0).toFixed(2)}ct
              </span>
            </div>
          </div>
        </div>

        {/* Item breakdown by ownership and entity */}
        {(ownershipStatuses.length > 1 || associatedEntities.length > 1) && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Item Breakdown</h4>
            <div className="space-y-2 text-xs">
              {items.map((item, index) => {
                const gem = gems.find(g => g.id === item.productId);
                return (
                  <div key={index} className="flex justify-between items-center">
                    <span className="truncate mr-2">{item.productDetails.stockId}</span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {getOwnershipStatusLabel(gem?.ownershipStatus || 'O')}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {gem?.associatedEntity || 'Self'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};