import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Building2, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { useAssociatedEntities, useAssociatedEntityTransactions, type AssociatedEntity } from '@/hooks/useAssociatedEntities';
import { AssociatedEntityDetailView } from './AssociatedEntityDetailView';
import { toast } from 'sonner';

export const AssociatedEntitiesDashboard = () => {
  const { associatedEntities, loading, addAssociatedEntity, updateAssociatedEntity, deleteAssociatedEntity } = useAssociatedEntities();
  const { transactions } = useAssociatedEntityTransactions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<AssociatedEntity | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    company: string;
    address: string;
    status: 'active' | 'inactive';
    notes: string;
  }>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    status: 'active',
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
    setEditingEntity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEntity) {
      const result = await updateAssociatedEntity(editingEntity.id, formData);
      if (result.success) {
        setIsDialogOpen(false);
        resetForm();
      }
    } else {
      const result = await addAssociatedEntity(formData);
      if (result.success) {
        setIsDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleEdit = (entity: AssociatedEntity) => {
    setEditingEntity(entity);
    setFormData({
      name: entity.name,
      email: entity.email || '',
      phone: entity.phone || '',
      company: entity.company || '',
      address: entity.address || '',
      status: entity.status,
      notes: entity.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this associated entity?')) {
      await deleteAssociatedEntity(id);
    }
  };

  // Calculate transaction statistics for each entity
  const getEntityStats = (entityName: string) => {
    const entityTransactions = transactions.filter(t => t.associated_entity_name === entityName);
    const totalRevenue = entityTransactions.reduce((sum, t) => sum + t.revenue_amount, 0);
    const transactionCount = entityTransactions.length;
    return { totalRevenue, transactionCount };
  };

  // Show detail view if an entity is selected
  if (selectedEntityId) {
    return (
      <AssociatedEntityDetailView 
        entityId={selectedEntityId} 
        onBack={() => setSelectedEntityId(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Associated Entities</h1>
          <p className="text-slate-600">Manage companies and entities for memo ownership status</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-diamond-gradient hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Add Entity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEntity ? 'Edit Associated Entity' : 'Add Associated Entity'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Entity name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@company.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
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
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1 bg-diamond-gradient hover:opacity-90">
                  {editingEntity ? 'Update' : 'Add'} Entity
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Entities</p>
                <p className="text-2xl font-bold text-slate-800">{associatedEntities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Active Entities</p>
                <p className="text-2xl font-bold text-slate-800">
                  {associatedEntities.filter(e => e.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-800">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Associated Entities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {associatedEntities.map((entity) => {
                const stats = getEntityStats(entity.name);
                return (
                  <TableRow key={entity.id}>
                    <TableCell 
                      className="font-medium cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={() => setSelectedEntityId(entity.id)}
                    >
                      {entity.name}
                    </TableCell>
                    <TableCell>{entity.company || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {entity.email && <div>{entity.email}</div>}
                        {entity.phone && <div>{entity.phone}</div>}
                        {!entity.email && !entity.phone && '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entity.status === 'active' ? 'default' : 'secondary'}>
                        {entity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${stats.totalRevenue.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>{stats.transactionCount}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entity)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entity.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {associatedEntities.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No associated entities found</p>
              <p className="text-sm text-slate-500">Add your first entity to start tracking memo transactions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};