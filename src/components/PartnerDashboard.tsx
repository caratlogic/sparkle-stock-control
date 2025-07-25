import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Edit, DollarSign, Users, TrendingUp, Building, Gem } from 'lucide-react';
import { usePartners, usePartnerTransactions, usePartnerGems, Partner } from '@/hooks/usePartners';
import { useToast } from '@/hooks/use-toast';
import { PartnerTransactionDetail } from './PartnerTransactionDetail';
import { PartnerGemsDialog } from './PartnerGemsDialog';

export const PartnerDashboard = () => {
  const { partners, loading, addPartner, updatePartner, deletePartner } = usePartners();
  const { transactions } = usePartnerTransactions();
  const { gemsByPartner } = usePartnerGems();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isGemsDialogOpen, setIsGemsDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      status: 'active',
      notes: ''
    });
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addPartner(formData);
    if (result.success) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEditPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    
    const result = await updatePartner(selectedPartner.id, formData);
    if (result.success) {
      setIsEditDialogOpen(false);
      setSelectedPartner(null);
      resetForm();
    }
  };

  const openEditDialog = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData({
      name: partner.name,
      email: partner.email,
      phone: partner.phone || '',
      company: partner.company || '',
      address: partner.address || '',
      status: partner.status,
      notes: partner.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const openDetailDialog = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsDetailDialogOpen(true);
  };

  // Calculate partner revenue statistics
  const partnerStats = partners.map(partner => {
    const partnerTransactions = transactions.filter(t => t.partner_id === partner.id);
    const totalRevenue = partnerTransactions.reduce((sum, t) => sum + t.revenue_amount, 0);
    const partnerShare = partnerTransactions.reduce((sum, t) => sum + t.partner_share, 0);
    const partnerGems = gemsByPartner[partner.name] || [];
    
    return {
      ...partner,
      totalRevenue,
      partnerShare,
      transactionCount: partnerTransactions.length,
      gemCount: partnerGems.length,
      totalCarats: partnerGems.reduce((sum, gem) => sum + gem.carat, 0)
    };
  });

  const totalRevenue = partnerStats.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalPartnerShares = partnerStats.reduce((sum, p) => sum + p.partnerShare, 0);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Partner Management</h1>
          <p className="text-muted-foreground">Manage business partners and track revenue sharing</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Partner</DialogTitle>
              <DialogDescription>
                Add a new business partner with ownership percentage details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPartner} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Partner Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Partner</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners.length}</div>
            <p className="text-xs text-muted-foreground">
              {partners.filter(p => p.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all partners
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Shares</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPartnerShares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total distributed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Gems</CardTitle>
            <Gem className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(gemsByPartner).reduce((sum, gems) => sum + gems.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total stones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partners Overview</CardTitle>
          <CardDescription>View and manage all business partners</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Gems</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Partner Share</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerStats.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>
                    <div>
                      <button 
                        onClick={() => openDetailDialog(partner)}
                        className="font-medium text-primary hover:underline cursor-pointer text-left"
                      >
                        {partner.name}
                      </button>
                      {partner.company && (
                        <div className="text-sm text-muted-foreground">{partner.company}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{partner.email}</div>
                      {partner.phone && (
                        <div className="text-sm text-muted-foreground">{partner.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>Per Gem</TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        setSelectedPartner(partner);
                        setIsGemsDialogOpen(true);
                      }}
                      className="flex items-center gap-1 hover:bg-slate-50 p-1 rounded cursor-pointer"
                    >
                      <Gem className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{partner.gemCount}</span>
                      <span className="text-sm text-muted-foreground">
                        ({partner.totalCarats.toFixed(2)}ct)
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>${partner.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell>${partner.partnerShare.toLocaleString()}</TableCell>
                  <TableCell>{partner.transactionCount}</TableCell>
                  <TableCell>
                    <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                      {partner.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(partner)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Partner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
            <DialogDescription>
              Update partner information and ownership details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPartner} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Partner Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Partner</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Partner Transaction Detail Dialog */}
      {selectedPartner && (
        <PartnerTransactionDetail
          partner={selectedPartner}
          isOpen={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false);
            setSelectedPartner(null);
          }}
        />
      )}

      {/* Partner Gems Dialog */}
      {selectedPartner && (
        <PartnerGemsDialog
          open={isGemsDialogOpen}
          onOpenChange={setIsGemsDialogOpen}
          partnerName={selectedPartner.name}
          gems={gemsByPartner[selectedPartner.name] || []}
        />
      )}
    </div>
  );
};