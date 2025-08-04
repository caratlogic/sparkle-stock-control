import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Diamond-specific settings
const DIAMOND_SHAPES = ['Round', 'Princess', 'Emerald', 'Asscher', 'Marquise', 'Oval', 'Radiant', 'Pear', 'Heart', 'Cushion'];
const DIAMOND_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const DIAMOND_CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
const DIAMOND_CUTS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
const DIAMOND_POLISH = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
const DIAMOND_SYMMETRY = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
const DIAMOND_FLUORESCENCE = ['None', 'Faint', 'Medium', 'Strong', 'Very Strong'];

interface AddSettingDialogProps {
  settingType: string;
  title: string;
  onAdd: (value: string) => void;
  existingValues: string[];
}

const AddSettingDialog: React.FC<AddSettingDialogProps> = ({ settingType, title, onAdd, existingValues }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
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

    if (existingValues.includes(value.trim())) {
      toast({
        title: "Error",
        description: "This value already exists",
        variant: "destructive",
      });
      return;
    }

    onAdd(value.trim());
    setValue('');
    setOpen(false);
    
    toast({
      title: "Success",
      description: `${title} added successfully`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add {title}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {title}</DialogTitle>
          <DialogDescription>
            Add a new {title.toLowerCase()} option for diamonds
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${title.toLowerCase()}`}
              required
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

const DiamondSettingsManagement: React.FC = () => {
  const [shapes, setShapes] = useState(DIAMOND_SHAPES);
  const [colors, setColors] = useState(DIAMOND_COLORS);
  const [clarities, setClarities] = useState(DIAMOND_CLARITIES);
  const [cuts, setCuts] = useState(DIAMOND_CUTS);
  const [polish, setPolish] = useState(DIAMOND_POLISH);
  const [symmetry, setSymmetry] = useState(DIAMOND_SYMMETRY);
  const [fluorescence, setFluorescence] = useState(DIAMOND_FLUORESCENCE);

  const { toast } = useToast();

  const handleDeleteSetting = (settingType: string, value: string) => {
    toast({
      title: "Cannot Delete",
      description: `Cannot delete "${value}". This is a standard diamond classification.`,
      variant: "destructive",
    });
  };

  const addShape = (value: string) => setShapes([...shapes, value]);
  const addColor = (value: string) => setColors([...colors, value]);
  const addClarity = (value: string) => setClarities([...clarities, value]);
  const addCut = (value: string) => setCuts([...cuts, value]);
  const addPolish = (value: string) => setPolish([...polish, value]);
  const addSymmetry = (value: string) => setSymmetry([...symmetry, value]);
  const addFluorescence = (value: string) => setFluorescence([...fluorescence, value]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Diamond Settings Management</h2>
        <p className="text-muted-foreground">
          Manage customizable diamond shapes, colors, clarities, and other attributes
        </p>
      </div>

      <Tabs defaultValue="shapes" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="shapes">Shapes</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="clarities">Clarities</TabsTrigger>
          <TabsTrigger value="cuts">Cut Grades</TabsTrigger>
          <TabsTrigger value="polish">Polish</TabsTrigger>
          <TabsTrigger value="symmetry">Symmetry</TabsTrigger>
          <TabsTrigger value="fluorescence">Fluorescence</TabsTrigger>
        </TabsList>

        <TabsContent value="shapes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Diamond Shapes</CardTitle>
                  <CardDescription>Manage available diamond shapes</CardDescription>
                </div>
                <AddSettingDialog 
                  settingType="shape"
                  title="Shape"
                  onAdd={addShape}
                  existingValues={shapes}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {shapes.map((shape) => (
                  <Badge key={shape} variant="secondary" className="flex items-center gap-2">
                    {shape}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSetting('shape', shape)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Diamond Colors</CardTitle>
                  <CardDescription>Manage diamond color grades (D-Z scale)</CardDescription>
                </div>
                <AddSettingDialog 
                  settingType="color"
                  title="Color"
                  onAdd={addColor}
                  existingValues={colors}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <Badge key={color} variant="outline" className="flex items-center gap-2">
                    {color}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSetting('color', color)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clarities">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Diamond Clarities</CardTitle>
                  <CardDescription>Manage diamond clarity grades</CardDescription>
                </div>
                <AddSettingDialog 
                  settingType="clarity"
                  title="Clarity"
                  onAdd={addClarity}
                  existingValues={clarities}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {clarities.map((clarity) => (
                  <Badge key={clarity} variant="secondary" className="flex items-center gap-2">
                    {clarity}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSetting('clarity', clarity)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cuts">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Cut Grades</CardTitle>
                  <CardDescription>Manage diamond cut quality grades</CardDescription>
                </div>
                <AddSettingDialog 
                  settingType="cut"
                  title="Cut Grade"
                  onAdd={addCut}
                  existingValues={cuts}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {cuts.map((cut) => (
                  <Badge key={cut} variant="secondary" className="flex items-center gap-2">
                    {cut}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSetting('cut', cut)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="polish">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Polish Grades</CardTitle>
                  <CardDescription>Manage diamond polish quality grades</CardDescription>
                </div>
                <AddSettingDialog 
                  settingType="polish"
                  title="Polish Grade"
                  onAdd={addPolish}
                  existingValues={polish}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {polish.map((polishGrade) => (
                  <Badge key={polishGrade} variant="secondary" className="flex items-center gap-2">
                    {polishGrade}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSetting('polish', polishGrade)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symmetry">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Symmetry Grades</CardTitle>
                  <CardDescription>Manage diamond symmetry quality grades</CardDescription>
                </div>
                <AddSettingDialog 
                  settingType="symmetry"
                  title="Symmetry Grade"
                  onAdd={addSymmetry}
                  existingValues={symmetry}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {symmetry.map((symmetryGrade) => (
                  <Badge key={symmetryGrade} variant="secondary" className="flex items-center gap-2">
                    {symmetryGrade}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSetting('symmetry', symmetryGrade)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fluorescence">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Fluorescence Intensities</CardTitle>
                  <CardDescription>Manage diamond fluorescence intensity levels</CardDescription>
                </div>
                <AddSettingDialog 
                  settingType="fluorescence"
                  title="Fluorescence Intensity"
                  onAdd={addFluorescence}
                  existingValues={fluorescence}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {fluorescence.map((fluor) => (
                  <Badge key={fluor} variant="secondary" className="flex items-center gap-2">
                    {fluor}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSetting('fluorescence', fluor)}
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiamondSettingsManagement;