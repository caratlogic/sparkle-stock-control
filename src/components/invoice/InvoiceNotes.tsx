
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface InvoiceNotesProps {
  notes: string;
  setNotes: (value: string) => void;
}

export const InvoiceNotes = ({ notes, setNotes }: InvoiceNotesProps) => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-lg">Additional Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter any additional notes or terms..."
          rows={3}
        />
      </CardContent>
    </Card>
  );
};
