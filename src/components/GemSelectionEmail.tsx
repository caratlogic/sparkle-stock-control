import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, Send, CheckCircle, X } from 'lucide-react';
import { Gem } from '../types/gem';
import { Customer } from '../types/customer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GemSelectionEmailProps {
  gems: Gem[];
  customers: Customer[];
  isOpen: boolean;
  onClose: () => void;
}

export const GemSelectionEmail = ({ gems, customers, isOpen, onClose }: GemSelectionEmailProps) => {
  const { toast } = useToast();
  const [selectedGems, setSelectedGems] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [subject, setSubject] = useState('Selected Gem Inventory from Our Collection');
  const [message, setMessage] = useState('Dear Valued Customer,\n\nWe are pleased to share with you a selection of gems from our exclusive inventory that we believe may interest you.\n\nPlease review the attached details and let us know if any of these pieces catch your attention.\n\nBest regards,\nYour Gem Collection Team');
  const [sending, setSending] = useState(false);

  const handleGemToggle = (gemId: string) => {
    setSelectedGems(prev => 
      prev.includes(gemId) 
        ? prev.filter(id => id !== gemId)
        : [...prev, gemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGems.length === gems.length) {
      setSelectedGems([]);
    } else {
      setSelectedGems(gems.map(gem => gem.id));
    }
  };

  const selectedGemsData = gems.filter(gem => selectedGems.includes(gem.id));
  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  const generateInventoryHTML = () => {
    const gemRows = selectedGemsData.map(gem => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: left;">${gem.stockId}</td>
        <td style="padding: 12px; text-align: left;">${gem.gemType}</td>
        <td style="padding: 12px; text-align: center;">${gem.carat} ct</td>
        <td style="padding: 12px; text-align: left;">${gem.cut}</td>
        <td style="padding: 12px; text-align: left;">${gem.color}</td>
        <td style="padding: 12px; text-align: left;">${gem.measurements}</td>
        <td style="padding: 12px; text-align: right;">$${gem.price.toLocaleString()}</td>
        <td style="padding: 12px; text-align: left;">${gem.description}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Selected Gem Inventory</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e5e7eb;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Stock ID</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Type</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Carat</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Cut</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Color</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Measurements</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Description</th>
            </tr>
          </thead>
          <tbody>
            ${gemRows}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Total Gems: ${selectedGemsData.length} | 
            Total Value: $${selectedGemsData.reduce((sum, gem) => sum + gem.price, 0).toLocaleString()}
          </p>
        </div>
      </div>
    `;
  };

  const handleSendEmail = async () => {
    if (!selectedCustomer || selectedGems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select a customer and at least one gem",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const inventoryHTML = generateInventoryHTML();
      const fullMessage = `${message}\n\n${inventoryHTML}`;

      const response = await supabase.functions.invoke('send-gem-inventory-email', {
        body: {
          to: selectedCustomerData?.email,
          customerName: selectedCustomerData?.name,
          subject,
          message: fullMessage,
          gems: selectedGemsData
        }
      });

      if (response.error) throw response.error;

      // Log communication
      await supabase.from('customer_communications').insert({
        customer_id: selectedCustomer,
        communication_type: 'email',
        sender_type: 'staff',
        subject,
        message: `Gem inventory selection sent. ${selectedGems.length} gems included.`,
        response_status: 'sent'
      });

      toast({
        title: "Email Sent Successfully",
        description: `Gem inventory sent to ${selectedCustomerData?.name}`,
      });

      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Selected Gems to Customer
          </DialogTitle>
          <DialogDescription>
            Select gems from your inventory and send details to a customer via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label>Select Customer</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email Details */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Email message..."
                rows={4}
              />
            </div>
          </div>

          {/* Gem Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Gems ({selectedGems.length} selected)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedGems.length === gems.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <div className="grid gap-2 p-4">
                {gems.map(gem => (
                  <div
                    key={gem.id}
                    className="flex items-center space-x-3 p-3 border rounded hover:bg-slate-50"
                  >
                    <Checkbox
                      checked={selectedGems.includes(gem.id)}
                      onCheckedChange={() => handleGemToggle(gem.id)}
                    />
                    <div className="flex-1 grid grid-cols-5 gap-2 text-sm">
                      <div>
                        <span className="font-medium">{gem.stockId}</span>
                      </div>
                      <div>
                        {gem.gemType} - {gem.carat}ct
                      </div>
                      <div>
                        {gem.cut} {gem.color}
                      </div>
                      <div>
                        ${gem.price.toLocaleString()}
                      </div>
                      <div>
                        <Badge variant={gem.status === 'In Stock' ? 'default' : 'secondary'}>
                          {gem.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedGems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p><strong>To:</strong> {selectedCustomerData?.email || 'No customer selected'}</p>
                  <p><strong>Subject:</strong> {subject}</p>
                  <p><strong>Gems:</strong> {selectedGems.length} selected (Total Value: ${selectedGemsData.reduce((sum, gem) => sum + gem.price, 0).toLocaleString()})</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={!selectedCustomer || selectedGems.length === 0 || sending}
              className="bg-green-600 hover:bg-green-700"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};