
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Mail, FileText, Receipt, User } from 'lucide-react';
import { Customer } from '../types/customer';
import { useCustomerCommunications } from '../hooks/useCustomerCommunications';
import { useToast } from '@/hooks/use-toast';

interface CustomerCommunicationsProps {
  customer: Customer;
}

export const CustomerCommunications = ({ customer }: CustomerCommunicationsProps) => {
  const { communications, loading, addCommunication } = useCustomerCommunications(customer.id);
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [messageType, setMessageType] = useState<'note' | 'email' | 'follow_up'>('note');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const result = await addCommunication({
        customerId: customer.id,
        communicationType: messageType,
        subject: messageType === 'email' ? newSubject : undefined,
        message: newMessage,
        senderType: 'owner',
        senderName: 'Business Owner',
        senderEmail: 'owner@business.com',
        isRead: true
      });

      if (result.success) {
        setNewMessage('');
        setNewSubject('');
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'follow_up': return <MessageCircle className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getCommunicationColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-green-100 text-green-800';
      case 'note': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-slate-600">Loading communications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Info Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" />
            Communications with {customer.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600">
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Phone:</strong> {customer.phone}</p>
            {customer.company && <p><strong>Company:</strong> {customer.company}</p>}
          </div>
        </CardContent>
      </Card>

      {/* New Message Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send New Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={messageType === 'note' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('note')}
            >
              Note
            </Button>
            <Button
              variant={messageType === 'follow_up' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('follow_up')}
            >
              Follow-up
            </Button>
            <Button
              variant={messageType === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMessageType('email')}
            >
              Email
            </Button>
          </div>

          {messageType === 'email' && (
            <Input
              placeholder="Email subject..."
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
          )}

          <Textarea
            placeholder={
              messageType === 'note' 
                ? "Add a note about this customer..." 
                : messageType === 'email'
                ? "Compose your email message..."
                : "Add a follow-up reminder..."
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={4}
          />

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : `Send ${messageType === 'note' ? 'Note' : messageType === 'email' ? 'Email' : 'Follow-up'}`}
          </Button>
        </CardContent>
      </Card>

      {/* Communications History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          {communications.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No communications yet. Start a conversation above!
            </div>
          ) : (
            <div className="space-y-4">
              {communications.map((comm, index) => (
                <div key={comm.id}>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${getCommunicationColor(comm.communicationType)}`}>
                        {getCommunicationIcon(comm.communicationType)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {comm.communicationType.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          {comm.senderType === 'owner' ? 'You' : comm.senderName || 'Customer'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(comm.createdAt).toLocaleDateString()} at {new Date(comm.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {comm.subject && (
                        <h4 className="font-medium text-slate-800 mb-1">{comm.subject}</h4>
                      )}
                      
                      <p className="text-slate-700 whitespace-pre-wrap">{comm.message}</p>
                      
                      {(comm.relatedInvoiceId || comm.relatedConsignmentId) && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
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
                  {index < communications.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
