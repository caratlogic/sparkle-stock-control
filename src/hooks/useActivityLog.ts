
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CustomerCommunication } from './useCustomerCommunications';

export interface ActivityLogFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  communicationType?: string[];
  responseStatus?: string[];
  customerId?: string;
}

export interface CustomerReminder {
  id: string;
  customerId: string;
  communicationId?: string;
  reminderType: string;
  reminderDate: string;
  message: string;
  isSent: boolean;
  staffEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export const useActivityLog = () => {
  const [activities, setActivities] = useState<CustomerCommunication[]>([]);
  const [reminders, setReminders] = useState<CustomerReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async (filters?: ActivityLogFilters) => {
    try {
      setLoading(true);
      setError(null);

      let whereConditions: string[] = [];
      let params: any[] = [];
      let paramIndex = 1;

      if (filters?.customerId) {
        whereConditions.push(`customer_id = $${paramIndex}`);
        params.push(filters.customerId);
        paramIndex++;
      }

      if (filters?.dateRange) {
        whereConditions.push(`created_at >= $${paramIndex} AND created_at <= $${paramIndex + 1}`);
        params.push(filters.dateRange.start, filters.dateRange.end);
        paramIndex += 2;
      }

      if (filters?.communicationType && filters.communicationType.length > 0) {
        const typeConditions = filters.communicationType.map((_, index) => `$${paramIndex + index}`).join(', ');
        whereConditions.push(`communication_type IN (${typeConditions})`);
        params.push(...filters.communicationType);
        paramIndex += filters.communicationType.length;
      }

      if (filters?.responseStatus && filters.responseStatus.length > 0) {
        const statusConditions = filters.responseStatus.map((_, index) => `$${paramIndex + index}`).join(', ');
        whereConditions.push(`response_status IN (${statusConditions})`);
        params.push(...filters.responseStatus);
        paramIndex += filters.responseStatus.length;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      const query = `
        SELECT cc.*, c.name as customer_name, c.email as customer_email
        FROM customer_communications cc
        LEFT JOIN customers c ON cc.customer_id = c.id
        ${whereClause}
        ORDER BY cc.created_at DESC
      `;

      const { data, error } = await supabase.rpc('exec_sql', { query, params });

      if (error) throw error;

      const transformedActivities: CustomerCommunication[] = (data || []).map((activity: any) => ({
        id: activity.id,
        customerId: activity.customer_id,
        communicationType: activity.communication_type,
        subject: activity.subject,
        message: activity.message,
        senderType: activity.sender_type,
        senderName: activity.sender_name,
        senderEmail: activity.sender_email,
        isRead: activity.is_read,
        responseStatus: activity.response_status || 'pending',
        relatedInvoiceId: activity.related_invoice_id,
        relatedConsignmentId: activity.related_consignment_id,
        createdAt: activity.created_at,
        updatedAt: activity.updated_at,
        customerName: activity.customer_name,
        customerEmail: activity.customer_email
      }));

      setActivities(transformedActivities);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        query: `
          SELECT cr.*, c.name as customer_name
          FROM customer_reminders cr
          LEFT JOIN customers c ON cr.customer_id = c.id
          ORDER BY cr.reminder_date ASC
        `
      });

      if (error) throw error;

      const transformedReminders: CustomerReminder[] = (data || []).map((reminder: any) => ({
        id: reminder.id,
        customerId: reminder.customer_id,
        communicationId: reminder.communication_id,
        reminderType: reminder.reminder_type,
        reminderDate: reminder.reminder_date,
        message: reminder.message,
        isSent: reminder.is_sent,
        staffEmail: reminder.staff_email,
        createdAt: reminder.created_at,
        updatedAt: reminder.updated_at,
        customerName: reminder.customer_name
      }));

      setReminders(transformedReminders);
    } catch (err) {
      console.error('Error fetching reminders:', err);
    }
  };

  const addReminder = async (reminder: Omit<CustomerReminder, 'id' | 'createdAt' | 'updatedAt' | 'isSent'>) => {
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        query: `
          INSERT INTO customer_reminders (
            customer_id, communication_id, reminder_type, reminder_date, message, staff_email
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `,
        params: [
          reminder.customerId,
          reminder.communicationId,
          reminder.reminderType,
          reminder.reminderDate,
          reminder.message,
          reminder.staffEmail
        ]
      });

      if (error) throw error;

      await fetchReminders();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding reminder:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add reminder' };
    }
  };

  const markReminderSent = async (reminderId: string) => {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        query: 'UPDATE customer_reminders SET is_sent = true WHERE id = $1',
        params: [reminderId]
      });

      if (error) throw error;

      await fetchReminders();
      return { success: true };
    } catch (err) {
      console.error('Error marking reminder as sent:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to mark reminder as sent' };
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchReminders();
  }, []);

  return {
    activities,
    reminders,
    loading,
    error,
    fetchActivities,
    fetchReminders,
    addReminder,
    markReminderSent
  };
};
