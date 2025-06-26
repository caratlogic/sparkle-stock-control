
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Save, Package, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Gem } from '@/types/gem';
import { Customer } from '@/types/customer';
import { useCustomers } from '@/hooks/useCustomers';
import { useConsignments } from '@/hooks/useConsignments';
import { toast } from 'sonner';

interface ConsignmentCreationProps {
  gems: Gem[];
  onCancel: () => void;
  selectedGem?: Gem;
}

export const ConsignmentCreation = ({ gems, onCancel, selectedGem }: ConsignmentCreationProps) => {
  const { customers } = useCustomers();
  const { createConsignment } = useConsignments();
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [returnDate, setReturnDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [selectedGems, setSelectedGems] = useState<Array<{
    gem: Gem;
    quantity: number;
    unitPrice: number;
  }>>([]);

  // Initialize with selected gem if provided
  useEffect(() => {
    if (selectedGem) {
      const gemData = {
        stockId: selectedGem.stockId,
        carat: selectedGem.carat,
        shape: selectedGem.shape || '',
        color: selectedGem.color,
        measurementsMm: selectedGem.measurementsMm || '',
        certificateNumber: selectedGem.certificateNumber,
        gemType: selectedGem.gemType,
        stoneDescription: selectedGem.stoneDescription || ''
      };
      
      setSelectedGems([{
        gem: selectedGem,
        quantity: 1,
        unitPrice: selectedGem.price
      }]);
    }
  }, [selectedGem]);

  const handleAddGem = (gemId: string) => {
    const gem = gems.find(g => g.id === gemId);
    if (!gem) return;

    const isAlreadySelected = selectedGems.some(sg => sg.gem.id === gem.id);
    if (isAlreadySelected) {
      toast.error('This gem is already selected');
      return;
    }

    if (gem.status !== 'In Stock') {
      toast.error('Only gems that are In Stock can be consigned');
      return;
    }

    const gemData = {
      stockId: gem.stockId,
      carat: gem.carat,
      shape: gem.shape || '',
      color: gem.color,
      measurementsMm: gem.measurementsMm || '',
      certificateNumber: gem.certificateNumber,
      gemType: gem.gemType,
      stoneDescription: gem.stoneDescription || ''
    };

    setSelectedGems(prev => [...prev, {
      gem,
      quantity: 1,
      unitPrice: gem.price
    }]);
  };

  const handleRemoveGem = (gemId: string) => {
    setSelectedGems(prev => prev.filter(sg => sg.gem.id !== gemId));
  };

  const handleQuantityChange = (gemId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedGems(prev => prev.map(sg => 
      sg.gem.id === gemId ? { ...sg, quantity } : sg
    ));
  };

  const handleUnitPriceChange = (gemId: string, unitPrice: number) => {
    if (unitPrice < 0) return;
    setSelectedGems(prev => prev.map(sg => 
      sg.gem.id === gemId ? { ...sg, unitPrice } : sg
    ));
  };

  const calculateTotal = () => {
    return selectedGems.reduce((total, sg) => total + (sg.quantity * sg.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    if (!returnDate) {
      toast.error('Please select a return date');
      return;
    }

    if (selectedGems.length === 0) {
      toast.error('Please select at least one gem');
      return;
    }

    try {
      const consignmentData = {
        customerId: selectedCustomer.id,
        returnDate: format(returnDate, 'yyyy-MM-dd'),
        notes,
        items: selectedGems.map(sg => ({
          gemId: sg.gem.id,
          quantity: sg.quantity,
          unitPrice: sg.unitPrice,
          totalPrice: sg.quantity * sg.unitPrice
        }))
      };

      const result = await createConsignment(consignmentData);
      
      if (result.success) {
        toast.success('Consignment created successfully');
        onCancel();
      } else {
        toast.error(result.error || 'Failed to create consignment');
      }
    } catch (error) {
      console.error('Error creating consignment:', error);
      toast.error('Failed to create consignment');
    }
  };

  const availableGems = gems.filter(gem => gem.status === 'In Stock');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onCancel} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Create Consignment</h2>
          <p className="text-slate-600">Create a new consignment for customer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consignment Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-slate-600" />
                <span>Consignment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select 
                      value={selectedCustomer?.id || ''} 
                      onValueChange={(value) => {
                        const customer = customers.find(c => c.id === value);
                        setSelectedCustomer(customer || null);
                      }}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} ({customer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Return Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-slate-50 border-slate-200",
                            !returnDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {returnDate ? format(returnDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={returnDate}
                          onSelect={setReturnDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this consignment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>

                {/* Selected Gems */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Selected Gems</h3>
                    <Badge variant="secondary">{selectedGems.length} items</Badge>
                  </div>

                  {selectedGems.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No gems selected. Add gems from the available inventory.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedGems.map((sg) => (
                        <div key={sg.gem.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                          <div className="flex-1">
                            <div className="font-medium">{sg.gem.stockId} - {sg.gem.gemType}</div>
                            <div className="text-sm text-slate-600">
                              {sg.gem.carat}ct {sg.gem.color} | {sg.gem.shape} | {sg.gem.measurementsMm} | {sg.gem.stoneDescription}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm">Qty:</Label>
                              <Input
                                type="number"
                                min="1"
                                value={sg.quantity}
                                onChange={(e) => handleQuantityChange(sg.gem.id, parseInt(e.target.value) || 1)}
                                className="w-20"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label className="text-sm">Price:</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={sg.unitPrice}
                                onChange={(e) => handleUnitPriceChange(sg.gem.id, parseFloat(e.target.value) || 0)}
                                className="w-24"
                              />
                            </div>
                            <div className="font-medium">${(sg.quantity * sg.unitPrice).toLocaleString()}</div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveGem(sg.gem.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-end">
                        <div className="text-lg font-semibold">
                          Total: ${calculateTotal().toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-diamond-gradient hover:opacity-90"
                    disabled={!selectedCustomer || !returnDate || selectedGems.length === 0}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Consignment
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Available Gems */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Gems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableGems.map((gem) => (
                  <div key={gem.id} className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{gem.stockId} - {gem.gemType}</div>
                        <div className="text-xs text-slate-600">
                          {gem.carat}ct {gem.color} | {gem.shape} | {gem.measurementsMm} | {gem.stoneDescription}
                        </div>
                        <div className="text-xs font-medium text-emerald-600">${gem.price.toLocaleString()}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddGem(gem.id)}
                        disabled={selectedGems.some(sg => sg.gem.id === gem.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {availableGems.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No gems available for consignment
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
