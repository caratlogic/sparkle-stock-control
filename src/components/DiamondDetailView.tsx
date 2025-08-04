import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, FileText, Handshake, Download } from 'lucide-react';
import { Diamond } from '../types/diamond';

interface DiamondDetailViewProps {
  diamond: Diamond;
  onBack: () => void;
  onEdit?: (diamond: Diamond) => void;
}

export const DiamondDetailView = ({ diamond, onBack, onEdit }: DiamondDetailViewProps) => {
  const formatPrice = (price?: number) => {
    return price ? `$${price.toLocaleString()}` : 'N/A';
  };

  const formatPercentage = (value?: number) => {
    return value ? `${value}%` : 'N/A';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Diamond {diamond.stock_number}
            </h1>
            <p className="text-slate-600">
              {diamond.weight}ct {diamond.shape} {diamond.color} {diamond.clarity}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {onEdit && (
            <Button onClick={() => onEdit(diamond)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => {
              // Convert diamond to gem format for compatibility
              const gemEquivalent = {
                id: diamond.id,
                stockId: diamond.stock_number,
                status: diamond.status as 'In Stock' | 'Sold' | 'Reserved',
                carat: diamond.weight || 0,
                gemType: 'Diamond' as const,
                cut: diamond.shape as any || 'Round',
                color: diamond.color || '',
                description: diamond.notes || '',
                measurements: diamond.measurements || '',
                certificateNumber: diamond.report_number || '',
                price: diamond.retail_price || 0,
                inStock: diamond.in_stock || 1,
                stockType: diamond.stock_type as any || 'single',
                costPrice: diamond.cost_price || 0,
                dateAdded: diamond.date_added || new Date().toISOString().split('T')[0],
              };
              // Navigate to invoice creation with preselected diamond
              window.location.href = `/#/transaction-dashboard?createInvoice=true&preselectedGem=${encodeURIComponent(JSON.stringify(gemEquivalent))}`;
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              // Convert diamond to gem format for compatibility
              const gemEquivalent = {
                id: diamond.id,
                stockId: diamond.stock_number,
                status: diamond.status as 'In Stock' | 'Sold' | 'Reserved',
                carat: diamond.weight || 0,
                gemType: 'Diamond' as const,
                cut: diamond.shape as any || 'Round',
                color: diamond.color || '',
                description: diamond.notes || '',
                measurements: diamond.measurements || '',
                certificateNumber: diamond.report_number || '',
                price: diamond.retail_price || 0,
                inStock: diamond.in_stock || 1,
                stockType: diamond.stock_type as any || 'single',
                costPrice: diamond.cost_price || 0,
                dateAdded: diamond.date_added || new Date().toISOString().split('T')[0],
              };
              // Navigate to consignment creation with preselected diamond
              window.location.href = `/#/transaction-dashboard?createConsignment=true&preselectedGem=${encodeURIComponent(JSON.stringify(gemEquivalent))}`;
            }}
          >
            <Handshake className="w-4 h-4 mr-2" />
            Consign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Stock Number</label>
                <p className="font-medium">{diamond.stock_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div>
                  <Badge 
                    variant={
                      diamond.status === 'In Stock' ? 'secondary' : 
                      diamond.status === 'Sold' ? 'destructive' : 
                      'default'
                    }
                  >
                    {diamond.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Weight</label>
                <p className="font-medium">{diamond.weight}ct</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Shape</label>
                <p className="font-medium">{diamond.shape}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Color</label>
                <p className="font-medium">{diamond.color}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Clarity</label>
                <p className="font-medium">{diamond.clarity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cut Information */}
        <Card>
          <CardHeader>
            <CardTitle>Cut Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Cut Grade</label>
                <p className="font-medium">{diamond.cut_grade || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Polish</label>
                <p className="font-medium">{diamond.polish || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Symmetry</label>
                <p className="font-medium">{diamond.symmetry || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Fluorescence</label>
                <p className="font-medium">{diamond.fluorescence_intensity || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Depth %</label>
                <p className="font-medium">{formatPercentage(diamond.depth_percent)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Table %</label>
                <p className="font-medium">{formatPercentage(diamond.table_percent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Retail Price</label>
                <p className="font-medium text-blue-600">{formatPrice(diamond.retail_price)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Price/Carat</label>
                <p className="font-medium">
                  {diamond.retail_price && diamond.weight 
                    ? `$${(diamond.retail_price / diamond.weight).toFixed(0)}/ct`
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Cost Price</label>
                <p className="font-medium text-green-600">{formatPrice(diamond.cost_price)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">RAP Net Price</label>
                <p className="font-medium">{formatPrice(diamond.rap_net_price)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Information */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Lab</label>
                <p className="font-medium">{diamond.lab || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Report Number</label>
                <p className="font-medium font-mono">{diamond.report_number || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Report Issue Date</label>
                <p className="font-medium">{diamond.report_issue_date || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Measurements</label>
                <p className="font-medium">{diamond.measurements || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Supplier</label>
                <p className="font-medium">{diamond.supplier || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Origin</label>
                <p className="font-medium">{diamond.origin || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Purchase Date</label>
                <p className="font-medium">{diamond.purchase_date || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Date Added</label>
                <p className="font-medium">{diamond.date_added}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">In Stock</label>
                <p className="font-medium text-green-600">{diamond.in_stock || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Reserved</label>
                <p className="font-medium text-orange-600">{diamond.reserved || 0}</p>
              </div>
            </div>
            
            {diamond.notes && (
              <div>
                <label className="text-sm font-medium text-slate-600">Notes</label>
                <p className="mt-1 text-slate-700">{diamond.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        {(diamond.image1 || diamond.image2 || diamond.image3) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {diamond.image1 && (
                  <img 
                    src={diamond.image1} 
                    alt="Diamond Image 1"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                {diamond.image2 && (
                  <img 
                    src={diamond.image2} 
                    alt="Diamond Image 2"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                {diamond.image3 && (
                  <img 
                    src={diamond.image3} 
                    alt="Diamond Image 3"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};