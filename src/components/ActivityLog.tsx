
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Activity, 
  Filter, 
  Download, 
  Calendar as CalendarIcon, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText, 
  Receipt, 
  CreditCard,
  Shield,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useActivityLog } from '../hooks/useActivityLog';
import { useCustomers } from '../hooks/useCustomers';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

export const ActivityLog = () => {
  const { activities, reminders, loading, fetchActivities, addReminder } = useActivityLog();
  const { customers } = useCustomers();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    communicationType: [] as string[],
    responseStatus: [] as string[],
    customerId: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const communicationTypes = [
    { value: 'note', label: 'Note', icon: FileText },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'call', label: 'Call', icon: Phone },
    { value: 'follow_up', label: 'Follow-up', icon: MessageCircle },
    { value: 'document', label: 'Document', icon: FileText },
    { value: 'invoice', label: 'Invoice', icon: Receipt },
    { value: 'consignment', label: 'Consignment', icon: FileText },
    { value: 'payment', label: 'Payment', icon: CreditCard },
    { value: 'kyc', label: 'KYC', icon: Shield }
  ];

  const responseStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'responded', label: 'Responded', color: 'bg-green-100 text-green-800' },
    { value: 'no_response', label: 'No Response', color: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' }
  ];

  const getCommunicationIcon = (type: string) => {
    const typeConfig = communicationTypes.find(t => t.value === type);
    const IconComponent = typeConfig?.icon || MessageCircle;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    const statusConfig = responseStatuses.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const handleApplyFilters = () => {
    const filterData = {
      ...filters,
      dateRange: dateRange?.from && dateRange?.to ? {
        start: format(dateRange.from, 'yyyy-MM-dd'),
        end: format(dateRange.to, 'yyyy-MM-dd')
      } : undefined
    };
    
    fetchActivities(filterData);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      communicationType: [],
      responseStatus: [],
      customerId: ''
    });
    setDateRange(undefined);
    fetchActivities();
  };

  const handleExportPDF = () => {
    // This would generate a PDF export of the activity log
    toast({
      title: "Export Started",
      description: "Your activity log PDF is being generated...",
    });
    
    // TODO: Implement PDF export functionality
    console.log('Exporting activities:', activities);
  };

  const handleAddReminder = async (activityId: string, customerId: string) => {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 7); // Default to 7 days from now
    
    const result = await addReminder({
      customerId,
      communicationId: activityId,
      reminderType: 'follow_up',
      reminderDate: reminderDate.toISOString(),
      message: 'Follow-up reminder',
      staffEmail: 'owner@business.com'
    });

    if (result.success) {
      toast({
        title: "Reminder Set",
        description: "Follow-up reminder has been created successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create reminder.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-slate-600">Loading activity log...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-8 h-8" />
            Activity Log
          </h2>
          <p className="text-slate-600 mt-1">Track all customer interactions and communications.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button
            onClick={handleExportPDF}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {dateRange?.from && dateRange?.to
                        ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                        : 'Select dates'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Customer */}
              <div>
                <label className="text-sm font-medium mb-2 block">Customer</label>
                <Select value={filters.customerId} onValueChange={(value) => setFilters({...filters, customerId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All customers</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Communication Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select 
                  value={filters.communicationType[0] || ''} 
                  onValueChange={(value) => setFilters({...filters, communicationType: value ? [value] : []})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {communicationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Response Status */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select 
                  value={filters.responseStatus[0] || ''} 
                  onValueChange={(value) => setFilters({...filters, responseStatus: value ? [value] : []})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {responseStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
              <Button variant="outline" onClick={handleClearFilters}>Clear All</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Reminders */}
      {reminders.filter(r => !r.isSent && new Date(r.reminderDate) <= new Date()).length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertCircle className="w-5 h-5" />
              Pending Reminders ({reminders.filter(r => !r.isSent && new Date(r.reminderDate) <= new Date()).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reminders
                .filter(r => !r.isSent && new Date(r.reminderDate) <= new Date())
                .slice(0, 5)
                .map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium">{reminder.customerName || 'Unknown Customer'}</p>
                      <p className="text-sm text-slate-600">{reminder.message}</p>
                      <p className="text-xs text-slate-500">Due: {format(new Date(reminder.reminderDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Complete
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activities ({activities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No activities found. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-white border">
                        {getCommunicationIcon(activity.communicationType)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {activity.communicationType.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(activity.responseStatus)}`}>
                          {activity.responseStatus.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          {activity.customerName || 'Unknown Customer'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      
                      {activity.subject && (
                        <h4 className="font-medium text-slate-800 mb-1">{activity.subject}</h4>
                      )}
                      
                      <p className="text-slate-700 text-sm mb-2">{activity.message}</p>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleAddReminder(activity.id, activity.customerId)}
                          className="text-xs"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Set Reminder
                        </Button>
                        
                        {(activity.relatedInvoiceId || activity.relatedConsignmentId) && (
                          <div className="flex items-center gap-1">
                            {activity.relatedInvoiceId && (
                              <Badge variant="outline" className="text-xs">
                                <Receipt className="w-3 h-3 mr-1" />
                                Invoice
                              </Badge>
                            )}
                            {activity.relatedConsignmentId && (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                Consignment
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < activities.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
