
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Calendar as CalendarIcon, Clock, Mail, MessageSquare, Plus, Filter } from 'lucide-react';
import { useActivityLog } from '../hooks/useActivityLog';
import { useCustomers } from '../hooks/useCustomers';
import { useOverdueReminders } from '../hooks/useOverdueReminders';
import { CustomerFilter } from '../components/ui/customer-filter';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const ReminderDashboard = () => {
  const { reminders, addReminder, markReminderSent, fetchReminders } = useActivityLog();
  const { customers } = useCustomers();
  const { createOverduePaymentReminders } = useOverdueReminders();
  const { toast } = useToast();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [newReminder, setNewReminder] = useState({
    customerId: '',
    reminderType: 'follow_up',
    reminderDate: new Date(),
    message: '',
    staffEmail: 'owner@business.com'
  });

  const reminderTypes = [
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'payment', label: 'Payment Due' },
    { value: 'invoice', label: 'Invoice Follow-up' },
    { value: 'consignment', label: 'Consignment Return' },
    { value: 'kyc', label: 'KYC Documentation' },
    { value: 'call', label: 'Schedule Call' },
    { value: 'meeting', label: 'Meeting Reminder' }
  ];

  const handleAddReminder = async () => {
    if (!newReminder.customerId || !newReminder.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const result = await addReminder({
      ...newReminder,
      reminderDate: newReminder.reminderDate.toISOString()
    });

    if (result.success) {
      toast({
        title: "Success",
        description: "Reminder created successfully.",
      });
      setShowAddForm(false);
      setNewReminder({
        customerId: '',
        reminderType: 'follow_up',
        reminderDate: new Date(),
        message: '',
        staffEmail: 'owner@business.com'
      });
      fetchReminders();
    } else {
      toast({
        title: "Error",
        description: "Failed to create reminder.",
        variant: "destructive",
      });
    }
  };

  const handleMarkSent = async (reminderId: string) => {
    const result = await markReminderSent(reminderId);
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Reminder marked as sent.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update reminder.",
        variant: "destructive",
      });
    }
  };

  // Filter reminders by selected customer
  const filteredReminders = selectedCustomer === 'all' 
    ? reminders 
    : reminders.filter(r => r.customerId === selectedCustomer);

  const upcomingReminders = filteredReminders.filter(r => !r.isSent && new Date(r.reminderDate) >= new Date());
  const overdueReminders = filteredReminders.filter(r => !r.isSent && new Date(r.reminderDate) < new Date());
  const completedReminders = filteredReminders.filter(r => r.isSent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Reminders & Alerts
          </h2>
          <p className="text-slate-600 mt-1">Manage follow-up reminders and notifications.</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={createOverduePaymentReminders}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Check Overdue Payments
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-diamond-gradient hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <span className="font-medium text-slate-700">Filter by Customer:</span>
          <CustomerFilter
            customers={customers}
            value={selectedCustomer}
            onValueChange={setSelectedCustomer}
            placeholder="All Customers"
          />
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="diamond-sparkle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueReminders.length}</div>
            <p className="text-xs text-slate-500 mt-1">Need immediate attention</p>
          </CardContent>
        </Card>

        <Card className="diamond-sparkle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Upcoming</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingReminders.length}</div>
            <p className="text-xs text-slate-500 mt-1">Scheduled for later</p>
          </CardContent>
        </Card>

        <Card className="diamond-sparkle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedReminders.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create New Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Customer</label>
                <Select 
                  value={newReminder.customerId} 
                  onValueChange={(value) => setNewReminder({...newReminder, customerId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Reminder Type</label>
                <Select 
                  value={newReminder.reminderType} 
                  onValueChange={(value) => setNewReminder({...newReminder, reminderType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Reminder Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(newReminder.reminderDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newReminder.reminderDate}
                      onSelect={(date) => date && setNewReminder({...newReminder, reminderDate: date})}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Staff Email</label>
                <Input
                  type="email"
                  value={newReminder.staffEmail}
                  onChange={(e) => setNewReminder({...newReminder, staffEmail: e.target.value})}
                  placeholder="staff@company.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                value={newReminder.message}
                onChange={(e) => setNewReminder({...newReminder, message: e.target.value})}
                placeholder="Reminder message..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddReminder}>Create Reminder</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Overdue Reminders ({overdueReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">Overdue</Badge>
                      <Badge variant="outline">{reminder.reminderType.replace('_', ' ')}</Badge>
                    </div>
                    <p className="font-medium">{reminder.customerName || 'Unknown Customer'}</p>
                    <p className="text-sm text-slate-600">{reminder.message}</p>
                    <p className="text-xs text-red-600">
                      Due: {format(new Date(reminder.reminderDate), 'PPP')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-1" />
                      Send
                    </Button>
                    <Button size="sm" onClick={() => handleMarkSent(reminder.id)}>
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Reminders ({upcomingReminders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No upcoming reminders scheduled.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{reminder.reminderType.replace('_', ' ')}</Badge>
                      <span className="text-sm text-slate-600">
                        {format(new Date(reminder.reminderDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="font-medium">{reminder.customerName || 'Unknown Customer'}</p>
                    <p className="text-sm text-slate-600">{reminder.message}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleMarkSent(reminder.id)}>
                    Complete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
