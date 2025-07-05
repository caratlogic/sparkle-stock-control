import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerId: string;
  amount: number;
  reason: string;
  description?: string;
  status: 'active' | 'void';
  dateCreated: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export const useCreditNotes = () => {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('credit_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedCreditNotes: CreditNote[] = data.map(note => ({
        id: note.id,
        creditNoteNumber: note.credit_note_number,
        customerId: note.customer_id,
        amount: parseFloat(note.amount?.toString() || '0'),
        reason: note.reason,
        description: note.description || undefined,
        status: note.status as 'active' | 'void',
        dateCreated: note.date_created,
        currency: note.currency,
        createdAt: note.created_at,
        updatedAt: note.updated_at
      }));

      setCreditNotes(transformedCreditNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditNotes();
  }, []);

  return {
    creditNotes,
    loading,
    error,
    refetch: fetchCreditNotes
  };
};