import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Mail, FileText, Receipt, User, Search, Filter, MoreHorizontal } from 'lucide-react';
import { useCustomerCommunications } from '../hooks/useCustomerCommunications';
import { useCustomers } from '../hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';

export const CommunicationsDashboard = () => {
  const { communications, loading, markAsRead } = useCustomerCommunications();
  const { customers } = useCustomers();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'follow_up': return <MessageCircle className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'invoice': return <Receipt className="w-4 h-4" />;
      case 'consignment': return <FileText className="w-4 h-4" />;
      case 'payment': return <Receipt className="w-4 h-4" />;
      case 'kyc': return <User className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getCommunicationColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-green-100 text-green-800';
      case 'note': return 'bg-gray-100 text-gray-800';
      case 'invoice': return 'bg-purple-100 text-purple-800';
      case 'consignment': return 'bg-orange-100 text-orange-800';
      case 'payment': return 'bg-emerald-100 text-emerald-800';
      case 'kyc': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'responded': return 'bg-blue-100 text-blue-800';
      case 'no_response': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredCommunications = useMemo(() => {
    return communications.filter(comm => {
      const customer = customers.find(c => c.id === comm.customerId);
      const customerName = customer?.name || 'Unknown Customer';
      
      const matchesSearch = 
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (comm.subject && comm.subject.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = filterType === 'all' || comm.communicationType === filterType;
      const matchesStatus = filterStatus === 'all' || comm.responseStatus === filterStatus;
      const matchesCustomer = selectedCustomer === 'all' || comm.customerId === selectedCustomer;

      return matchesSearch && matchesType && matchesStatus && matchesCustomer;
    });
  }, [communications, customers, searchTerm, filterType, filterStatus, selectedCustomer]);

  const handleMarkAsRead = async (communicationId: string, isRead: boolean) => {
    if (!isRead) {
      const result = await markAsRead(communicationId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Communication marked as read",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-lg font-medium mb-2">Loading communications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Communications Dashboard</h1>
          <p className="text-slate-600">View and manage all customer communications</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Customer</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="consignment">Consignment</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="kyc">KYC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no_response">No Response</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Communications ({filteredCommunications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCommunications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <div className="text-lg font-medium mb-2">No communications found</div>
              <div className="text-sm">Try adjusting your filters or search criteria.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommunications.map((comm) => {
                const customer = customers.find(c => c.id === comm.customerId);
                return (
                  <div 
                    key={comm.id} 
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      !comm.isRead ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                    } hover:bg-slate-100`}
                    onClick={() => handleMarkAsRead(comm.id, comm.isRead)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${getCommunicationColor(comm.communicationType)}`}>
                          {getCommunicationIcon(comm.communicationType)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {comm.communicationType.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getResponseStatusColor(comm.responseStatus)}`}
                            >
                              {comm.responseStatus.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {!comm.isRead && (
                              <Badge className="text-xs bg-blue-600">
                                UNREAD
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-slate-800">
                              {customer?.name || 'Unknown Customer'}
                            </span>
                            <span className="text-sm text-slate-500">
                              {comm.senderType === 'owner' ? 'You' : comm.senderName || 'Customer'}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(comm.createdAt).toLocaleDateString()} at {new Date(comm.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {comm.subject && (
                            <h4 className="font-medium text-slate-800 mb-1">{comm.subject}</h4>
                          )}
                          
                          <p className="text-slate-700 text-sm line-clamp-2">{comm.message}</p>
                          
                          {(comm.relatedInvoiceId || comm.relatedConsignmentId) && (
                            <div className="mt-2 flex items-center gap-2">
                              {comm.relatedInvoiceId && (
                                <Badge variant="outline" className="text-xs">
                                  <Receipt className="w-3 h-3 mr-1" />
                                  Invoice Related
                                </Badge>
                              )}
                              {comm.relatedConsignmentId && (
                                <Badge variant="outline" className="text-xs">
                                  <FileText className="w-3 h-3 mr-1" />
                                  Consignment Related
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="opacity-50 hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};