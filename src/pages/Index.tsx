
import { Layout } from '../components/Layout';
import { Dashboard } from '../components/Dashboard';
import { useOverdueReminders } from '../hooks/useOverdueReminders';

const Index = () => {
  // Initialize overdue reminders check
  useOverdueReminders();

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default Index;
