import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  mandatory?: boolean;
  order: number;
}

interface ColumnSelectorProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

export const ColumnSelector = ({ columns, onColumnsChange }: ColumnSelectorProps) => {
  const [localColumns, setLocalColumns] = useState(columns);
  const [open, setOpen] = useState(false);

  const handleToggleColumn = (key: string) => {
    setLocalColumns(prev => 
      prev.map(col => 
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedColumns = Array.from(localColumns);
    const [movedColumn] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, movedColumn);

    // Update order property
    const updatedColumns = reorderedColumns.map((col, index) => ({
      ...col,
      order: index
    }));

    setLocalColumns(updatedColumns);
  };

  const handleApply = () => {
    onColumnsChange(localColumns);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalColumns(columns);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Customize Columns
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Table Columns</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Select which columns to display and drag to reorder them. Stock ID and Actions are mandatory.
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {localColumns
                    .sort((a, b) => a.order - b.order)
                    .map((column, index) => (
                      <Draggable
                        key={column.key}
                        draggableId={column.key}
                        index={index}
                        isDragDisabled={column.mandatory}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            } ${column.mandatory ? 'opacity-75' : ''}`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center space-x-3">
                                <div
                                  {...provided.dragHandleProps}
                                  className={`${
                                    column.mandatory 
                                      ? 'text-slate-300 cursor-not-allowed' 
                                      : 'text-slate-400 cursor-grab'
                                  }`}
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                
                                <Checkbox
                                  id={column.key}
                                  checked={column.visible}
                                  disabled={column.mandatory}
                                  onCheckedChange={() => handleToggleColumn(column.key)}
                                />
                                
                                <Label
                                  htmlFor={column.key}
                                  className={`flex-1 ${
                                    column.mandatory ? 'text-slate-500' : ''
                                  }`}
                                >
                                  {column.label}
                                  {column.mandatory && (
                                    <span className="text-xs text-slate-400 ml-1">
                                      (Required)
                                    </span>
                                  )}
                                </Label>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply}>
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};