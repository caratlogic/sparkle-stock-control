import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ColumnCustomizerProps {
  open: boolean;
  onClose: () => void;
  tableName: string;
  columns: Array<{ key: string; label: string; defaultLabel: string }>;
  onSave: (customizations: Record<string, string>) => void;
  userEmail: string;
}

export const ColumnCustomizer = ({
  open,
  onClose,
  tableName,
  columns,
  onSave,
  userEmail
}: ColumnCustomizerProps) => {
  const { toast } = useToast();
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userEmail) {
      loadCustomizations();
    }
  }, [open, userEmail, tableName]);

  const loadCustomizations = async () => {
    try {
      const { data, error } = await supabase
        .from('column_customizations')
        .select('column_key, display_name')
        .eq('user_email', userEmail)
        .eq('table_name', tableName);

      if (error) throw error;

      const customizations: Record<string, string> = {};
      data?.forEach(item => {
        customizations[item.column_key] = item.display_name;
      });

      // Initialize with current labels or defaults
      const labels: Record<string, string> = {};
      columns.forEach(col => {
        labels[col.key] = customizations[col.key] || col.label;
      });

      setCustomLabels(labels);
    } catch (error) {
      console.error('Error loading customizations:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // First delete existing customizations for this table
      await supabase
        .from('column_customizations')
        .delete()
        .eq('user_email', userEmail)
        .eq('table_name', tableName);

      // Insert new customizations
      const customizations = Object.entries(customLabels)
        .filter(([key, label]) => {
          const defaultLabel = columns.find(col => col.key === key)?.defaultLabel;
          return label !== defaultLabel; // Only save if different from default
        })
        .map(([column_key, display_name]) => ({
          user_email: userEmail,
          table_name: tableName,
          column_key,
          display_name
        }));

      if (customizations.length > 0) {
        const { error } = await supabase
          .from('column_customizations')
          .insert(customizations);

        if (error) throw error;
      }

      onSave(customLabels);
      onClose();
      
      toast({
        title: "Success",
        description: "Column names saved successfully"
      });
    } catch (error) {
      console.error('Error saving customizations:', error);
      toast({
        title: "Error",
        description: "Failed to save column customizations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const resetLabels: Record<string, string> = {};
    columns.forEach(col => {
      resetLabels[col.key] = col.defaultLabel;
    });
    setCustomLabels(resetLabels);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Column Names</DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Column Display Names</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {columns.map((column) => (
              <div key={column.key} className="space-y-2">
                <Label htmlFor={column.key} className="text-sm">
                  {column.defaultLabel}
                </Label>
                <Input
                  id={column.key}
                  value={customLabels[column.key] || column.label}
                  onChange={(e) => setCustomLabels(prev => ({
                    ...prev,
                    [column.key]: e.target.value
                  }))}
                  placeholder={column.defaultLabel}
                  className="text-sm"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};