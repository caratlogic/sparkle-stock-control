
import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Dashboard } from '../components/Dashboard';
import { OverdueNotificationModal } from '../components/OverdueNotificationModal';
import { useOverdueReminders } from '../hooks/useOverdueReminders';
import { useInvoices } from '../hooks/useInvoices';
import { useConsignments } from '../hooks/useConsignments';

const Index = () => {
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const { invoices } = useInvoices();
  const { consignments } = useConsignments();
  
  // Initialize overdue reminders check
  useOverdueReminders();

  // Check for overdue items on app load
  useEffect(() => {
    const checkOverdueItems = () => {
      const now = new Date();
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      // Check for overdue invoices (more than 10 days old)
      const overdueInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.dateCreated);
        return (
          (invoice.status === 'sent' || invoice.status === 'overdue') &&
          invoiceDate < tenDaysAgo
        );
      });

      // Check for overdue consignments (past return date by more than 10 days)
      const overdueConsignments = consignments.filter(consignment => {
        const returnDate = new Date(consignment.returnDate);
        return (
          consignment.status === 'pending' &&
          returnDate < tenDaysAgo
        );
      });

      // Show modal if there are overdue items
      if (overdueInvoices.length > 0 || overdueConsignments.length > 0) {
        setShowOverdueModal(true);
      }
    };

    // Check after data is loaded
    if (invoices.length > 0 || consignments.length > 0) {
      checkOverdueItems();
    }
  }, [invoices, consignments]);

  return (
    <Layout>
      <Dashboard />
      <OverdueNotificationModal
        isOpen={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
      />
    </Layout>
  );
};

export default Index;
