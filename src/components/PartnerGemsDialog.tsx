import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Gem } from 'lucide-react';

interface PartnerGemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerName: string;
  gems: any[];
}

export const PartnerGemsDialog = ({ open, onOpenChange, partnerName, gems }: PartnerGemsDialogProps) => {
  const totalCarats = gems.reduce((sum, gem) => sum + gem.carat, 0);
  const totalValue = gems.reduce((sum, gem) => sum + gem.price, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-emerald-600" />
            Partner Gems - {partnerName}
            <Badge variant="secondary" className="ml-2">
              {gems.length} stones ({totalCarats.toFixed(2)}ct)
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600">Total Stones</p>
              <p className="text-xl font-bold">{gems.length}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600">Total Carats</p>
              <p className="text-xl font-bold">{totalCarats.toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600">Total Value</p>
              <p className="text-xl font-bold">${totalValue.toLocaleString()}</p>
            </div>
          </div>

          {gems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stock ID</TableHead>
                  <TableHead>Gem Type</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Shape</TableHead>
                  <TableHead>Carat</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Certificate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gems.map((gem) => (
                  <TableRow key={gem.id}>
                    <TableCell className="font-medium">{gem.stock_id}</TableCell>
                    <TableCell>{gem.gem_type}</TableCell>
                    <TableCell>{gem.color}</TableCell>
                    <TableCell>{gem.shape || '-'}</TableCell>
                    <TableCell>{gem.carat}</TableCell>
                    <TableCell>${gem.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={gem.status === 'In Stock' ? 'default' : 'secondary'}>
                        {gem.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{gem.certificate_number || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Gem className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No stones found for this partner</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};