import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';

interface SearchCriteria {
  field: string;
  operator: string;
  value: string;
}

interface MultiCriteriaSearchProps {
  onSearch: (criteria: SearchCriteria[]) => void;
  fields: { key: string; label: string; type: 'text' | 'number' | 'select'; options?: string[] }[];
}

export const MultiCriteriaSearch = ({ onSearch, fields }: MultiCriteriaSearchProps) => {
  const [criteria, setCriteria] = useState<SearchCriteria[]>([]);
  const [currentCriteria, setCurrentCriteria] = useState<SearchCriteria>({
    field: '',
    operator: 'contains',
    value: ''
  });

  const operators = {
    text: [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'starts_with', label: 'Starts with' },
      { value: 'ends_with', label: 'Ends with' }
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'greater_than', label: 'Greater than' },
      { value: 'less_than', label: 'Less than' },
      { value: 'between', label: 'Between' }
    ],
    select: [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not equals' }
    ]
  };

  const addCriteria = () => {
    if (currentCriteria.field && currentCriteria.value) {
      const newCriteria = [...criteria, currentCriteria];
      setCriteria(newCriteria);
      setCurrentCriteria({ field: '', operator: 'contains', value: '' });
      onSearch(newCriteria);
    }
  };

  const removeCriteria = (index: number) => {
    const newCriteria = criteria.filter((_, i) => i !== index);
    setCriteria(newCriteria);
    onSearch(newCriteria);
  };

  const clearAll = () => {
    setCriteria([]);
    onSearch([]);
  };

  const selectedField = fields.find(f => f.key === currentCriteria.field);
  const availableOperators = selectedField ? operators[selectedField.type] : operators.text;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current criteria display */}
        {criteria.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {criteria.map((criterion, index) => {
              const field = fields.find(f => f.key === criterion.field);
              const operator = availableOperators.find(op => op.value === criterion.operator);
              return (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  <span>{field?.label} {operator?.label} "{criterion.value}"</span>
                  <button
                    onClick={() => removeCriteria(index)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        )}

        {/* Add new criteria */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            value={currentCriteria.field}
            onValueChange={(value) => setCurrentCriteria(prev => ({ ...prev, field: value, operator: 'contains' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {fields.map(field => (
                <SelectItem key={field.key} value={field.key}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentCriteria.operator}
            onValueChange={(value) => setCurrentCriteria(prev => ({ ...prev, operator: value }))}
            disabled={!currentCriteria.field}
          >
            <SelectTrigger>
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              {availableOperators.map(operator => (
                <SelectItem key={operator.value} value={operator.value}>
                  {operator.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedField?.type === 'select' ? (
            <Select
              value={currentCriteria.value}
              onValueChange={(value) => setCurrentCriteria(prev => ({ ...prev, value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                {selectedField.options?.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={selectedField?.type === 'number' ? 'number' : 'text'}
              placeholder="Enter value"
              value={currentCriteria.value}
              onChange={(e) => setCurrentCriteria(prev => ({ ...prev, value: e.target.value }))}
              disabled={!currentCriteria.field}
            />
          )}

          <Button onClick={addCriteria} disabled={!currentCriteria.field || !currentCriteria.value}>
            <Search className="w-4 h-4 mr-2" />
            Add Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};