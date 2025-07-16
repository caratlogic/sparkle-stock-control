
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Share2, Mail, User, Camera, QrCode } from 'lucide-react';
import { Gem } from '../types/gem';
import { useCustomers } from '../hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useQRCodeSettings } from '../hooks/useQRCodeSettings';

interface GemDetailViewProps {
  gem: Gem;
  onBack: () => void;
}

export const GemDetailView = ({ gem, onBack }: GemDetailViewProps) => {
  const { customers } = useCustomers();
  const { toast } = useToast();
  const { fieldConfig } = useQRCodeSettings();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  const handleSendToCustomer = async () => {
    if (!selectedCustomerId) {
      toast({
        title: "Error",
        description: "Please select a customer first",
        variant: "destructive",
      });
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      toast({
        title: "Error",
        description: "Customer not found",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Create email content with gem details
      const emailContent = `
        Dear ${customer.name},
        
        We would like to share details of a beautiful ${gem.gemType} from our collection:
        
        Stock ID: ${gem.stockId}
        Type: ${gem.gemType}
        Carat: ${gem.carat}ct
        Cut: ${gem.cut}
        Color: ${gem.color}
        Price: $${gem.price.toLocaleString()}
        Certificate: ${gem.certificateNumber}
        
        ${gem.description ? `Description: ${gem.description}` : ''}
        ${gem.measurements ? `Measurements: ${gem.measurements}` : ''}
        ${gem.notes ? `Notes: ${gem.notes}` : ''}
        
        Please contact us if you would like to schedule a viewing or have any questions.
        
        Best regards,
        Your Jewelry Team
      `;

      // In a real implementation, you would send this via email service
      console.log('Sending gem details to customer:', customer.email);
      console.log('Email content:', emailContent);
      
      toast({
        title: "Success",
        description: `Gem details sent to ${customer.name}`,
      });
      
      setSelectedCustomerId('');
    } catch (error) {
      console.error('Error sending gem details:', error);
      toast({
        title: "Error",
        description: "Failed to send gem details",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Button>
        <h1 className="text-2xl font-bold text-slate-800">
          {gem.gemType} Details - {gem.stockId}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Product Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
              {gem.imageUrl ? (
                <img
                  src={gem.imageUrl}
                  alt={`${gem.gemType} ${gem.stockId}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <Camera className="w-16 h-16 mx-auto mb-2" />
                  <p>No image available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Stock ID</label>
                <p className="text-lg font-semibold">{gem.stockId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="mt-1">
                  <Badge variant={
                    gem.status === 'In Stock' ? 'secondary' : 
                    gem.status === 'Sold' ? 'destructive' : 'default'
                  }>
                    {gem.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Gem Type</label>
                <p className="text-lg">{gem.gemType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Carat</label>
                <p className="text-lg">{gem.carat}ct</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Cut</label>
                <p className="text-lg">{gem.cut}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Color</label>
                <p className="text-lg">{gem.color}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Selling Price</label>
                <p className="text-xl font-bold text-slate-800">${gem.price.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Cost Price</label>
                <p className="text-lg text-emerald-600">${gem.costPrice.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Certificate Number</label>
              <p className="text-lg font-mono">{gem.certificateNumber}</p>
            </div>

            {gem.measurements && (
              <div>
                <label className="text-sm font-medium text-slate-600">Measurements</label>
                <p className="text-lg">{gem.measurements}</p>
              </div>
            )}

            {gem.description && (
              <div>
                <label className="text-sm font-medium text-slate-600">Description</label>
                <p className="text-lg">{gem.description}</p>
              </div>
            )}

            {gem.notes && (
              <div>
                <label className="text-sm font-medium text-slate-600">Notes</label>
                <p className="text-lg">{gem.notes}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-600">Date Added</label>
              <p className="text-lg">{gem.dateAdded}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <QRCodeDisplay 
              gemData={{
                stockId: gem.stockId,
                gemType: gem.gemType,
                carat: gem.carat,
                color: gem.color,
                cut: gem.cut,
                measurements: gem.measurements || '',
                certificateNumber: gem.certificateNumber,
                price: gem.price,
                pricePerCarat: gem.price / gem.carat,
                description: gem.description,
                origin: gem.origin,
                treatment: gem.treatment,
                supplier: gem.supplier,
                dateAdded: gem.dateAdded
              }}
              fieldConfig={fieldConfig}
              size="medium"
              showPrint={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Sharing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share with Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                Select Customer
              </label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{customer.name} ({customer.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSendToCustomer}
              disabled={!selectedCustomerId || isSending}
              className="bg-diamond-gradient hover:opacity-90"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Details'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
