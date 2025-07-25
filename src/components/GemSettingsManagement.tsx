import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useGemSettings, GemSetting } from '@/hooks/useGemSettings';
import { useToast } from '@/hooks/use-toast';

interface AddSettingDialogProps {
  settingType: 'gem_type' | 'treatment' | 'cut' | 'gem_color';
  gemTypes?: string[];
  onAdd: (setting: Omit<GemSetting, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

const AddSettingDialog: React.FC<AddSettingDialogProps> = ({ settingType, gemTypes = [], onAdd }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [selectedGemType, setSelectedGemType] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!value.trim()) {
      toast({
        title: "Error",
        description: "Value is required",
        variant: "destructive",
      });
      return;
    }

    if (settingType === 'gem_color' && !selectedGemType) {
      toast({
        title: "Error",
        description: "Gem type is required for colors",
        variant: "destructive",
      });
      return;
    }

    try {
      await onAdd({
        setting_type: settingType,
        gem_type: settingType === 'gem_color' ? selectedGemType : undefined,
        value: value.trim(),
        display_order: displayOrder,
        is_active: true
      });
      
      setValue('');
      setSelectedGemType('');
      setDisplayOrder(1);
      setOpen(false);
    } catch (error) {
      console.error('Error adding setting:', error);
    }
  };

  const getTitle = () => {
    switch (settingType) {
      case 'gem_type': return 'Add Gem Type';
      case 'treatment': return 'Add Treatment';
      case 'cut': return 'Add Cut';
      case 'gem_color': return 'Add Gem Color';
      default: return 'Add Setting';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add {settingType.replace('_', ' ')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            Add a new {settingType.replace('_', ' ')} option
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {settingType === 'gem_color' && (
            <div>
              <Label htmlFor="gemType">Gem Type</Label>
              <Select value={selectedGemType} onValueChange={setSelectedGemType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gem type" />
                </SelectTrigger>
                <SelectContent>
                  {gemTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${settingType.replace('_', ' ')} name`}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const GemSettingsManagement: React.FC = () => {
  const { 
    gemSettings, 
    loading, 
    addGemSetting, 
    deleteGemSetting, 
    getGemTypes,
    getTreatments,
    getCuts,
    getAllGemColors
  } = useGemSettings();

  const gemTypes = getGemTypes();
  const treatments = getTreatments();
  const cuts = getCuts();
  const gemColors = getAllGemColors();

  const handleDeleteSetting = async (id: string, value: string) => {
    if (window.confirm(`Are you sure you want to delete "${value}"?`)) {
      await deleteGemSetting(id);
    }
  };

  if (loading) {
    return <div>Loading gem settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gem Settings Management</h2>
        <p className="text-muted-foreground">
          Manage customizable gem types, colors, treatments, and cuts
        </p>
      </div>

      <Tabs defaultValue="gem_types" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gem_types">Gem Types</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="cuts">Cuts</TabsTrigger>
        </TabsList>

        <TabsContent value="gem_types">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gem Types</CardTitle>
                  <CardDescription>Manage available gem types</CardDescription>
                </div>
                <AddSettingDialog 
                  settingType="gem_type" 
                  onAdd={addGemSetting}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {gemTypes.map((type) => {
                  const setting = gemSettings.find(s => s.setting_type === 'gem_type' && s.value === type);
                  return (
                    <Badge key={type} variant="secondary" className="flex items-center gap-2">
                      {type}
                      {setting && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSetting(setting.id, type)}
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gem Colors</CardTitle>
                  <CardDescription>Manage colors for each gem type</CardDescription>
                </div>
                <AddSettingDialog 
                  settingType="gem_color" 
                  gemTypes={gemTypes}
                  onAdd={addGemSetting}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(gemColors).map(([gemType, colors]) => (
                  <div key={gemType}>
                    <h4 className="font-medium mb-2">{gemType}</h4>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => {
                        const setting = gemSettings.find(s => 
                          s.setting_type === 'gem_color' && 
                          s.gem_type === gemType && 
                          s.value === color
                        );
                        return (
                          <Badge key={`${gemType}-${color}`} variant="outline" className="flex items-center gap-2">
                            {color}
                            {setting && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteSetting(setting.id, color)}
                                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Treatments</CardTitle>
                  <CardDescription>Manage available treatments</CardDescription>
                </div>
                <AddSettingDialog 
                  settingType="treatment" 
                  onAdd={addGemSetting}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {treatments.map((treatment) => {
                  const setting = gemSettings.find(s => s.setting_type === 'treatment' && s.value === treatment);
                  return (
                    <Badge key={treatment} variant="secondary" className="flex items-center gap-2">
                      {treatment}
                      {setting && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSetting(setting.id, treatment)}
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cuts">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Cuts</CardTitle>
                  <CardDescription>Manage available cuts</CardDescription>
                </div>
                <AddSettingDialog 
                  settingType="cut" 
                  onAdd={addGemSetting}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {cuts.map((cut) => {
                  const setting = gemSettings.find(s => s.setting_type === 'cut' && s.value === cut);
                  return (
                    <Badge key={cut} variant="secondary" className="flex items-center gap-2">
                      {cut}
                      {setting && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSetting(setting.id, cut)}
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GemSettingsManagement;