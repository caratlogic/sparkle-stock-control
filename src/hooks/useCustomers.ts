
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '../types/customer';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedCustomers: Customer[] = data.map(customer => ({
        id: customer.id,
        customerId: customer.customer_id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company || undefined,
        taxId: customer.tax_id || undefined,
        address: {
          street: customer.street,
          city: customer.city,
          state: customer.state,
          zipCode: customer.zip_code,
          country: customer.country || undefined
        },
        dateAdded: customer.date_added,
        totalPurchases: parseFloat(customer.total_purchases?.toString() || '0'),
        lastPurchaseDate: customer.last_purchase_date || undefined,
        notes: customer.notes || undefined,
        discount: parseFloat(customer.discount?.toString() || '0'),
        status: customer.status as 'active' | 'inactive'
      }));

      setCustomers(transformedCustomers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers
  };
};
