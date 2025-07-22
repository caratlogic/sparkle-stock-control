import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Save, X, ExternalLink } from 'lucide-react';
import { GemCertificate, CERTIFICATE_TYPE_OPTIONS } from '../types/gem';
import { useGemCertificates } from '../hooks/useGemCertificates';
import { FileUpload } from '@/components/ui/file-upload';

interface GemCertificateManagerProps {
  gemId?: string;
  certificates?: GemCertificate[];
  isEditing?: boolean;
}

export const GemCertificateManager = ({ gemId, certificates: propCertificates, isEditing = false }: GemCertificateManagerProps) => {
  const { certificates: hookCertificates, addCertificate, updateCertificate, deleteCertificate } = useGemCertificates(gemId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<GemCertificate>>({
    certificateType: 'none',
    certificateNumber: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    certificateUrl: '',
    notes: ''
  });

  // Use prop certificates if provided (for display mode), otherwise use hook certificates (for editing mode)
  const certificates = propCertificates || hookCertificates;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.certificateType || !formData.certificateNumber) {
      return;
    }

    try {
      if (editingCertificate) {
        await updateCertificate(editingCertificate, formData);
        setEditingCertificate(null);
      } else {
        await addCertificate(formData as Omit<GemCertificate, 'id' | 'gemId' | 'createdAt' | 'updatedAt'>);
        setShowAddForm(false);
      }
      
      // Reset form
      setFormData({
        certificateType: 'none',
        certificateNumber: '',
        issuingAuthority: '',
        issueDate: '',
        expiryDate: '',
        certificateUrl: '',
        notes: ''
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEdit = (certificate: GemCertificate) => {
    setFormData({
      certificateType: certificate.certificateType,
      certificateNumber: certificate.certificateNumber,
      issuingAuthority: certificate.issuingAuthority || '',
      issueDate: certificate.issueDate || '',
      expiryDate: certificate.expiryDate || '',
      certificateUrl: certificate.certificateUrl || '',
      notes: certificate.notes || ''
    });
    setEditingCertificate(certificate.id!);
  };

  const handleCancelEdit = () => {
    setEditingCertificate(null);
    setFormData({
      certificateType: 'none',
      certificateNumber: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
      certificateUrl: '',
      notes: ''
    });
  };

  const handleDelete = async (certificateId: string) => {
    try {
      await deleteCertificate(certificateId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getCertificateTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'GIA': 'bg-blue-100 text-blue-800',
      'GRS': 'bg-green-100 text-green-800',
      'SSEF': 'bg-purple-100 text-purple-800',
      'Gubelin': 'bg-orange-100 text-orange-800',
      'AGL': 'bg-red-100 text-red-800',
      'IGI': 'bg-yellow-100 text-yellow-800',
      'AGTA': 'bg-pink-100 text-pink-800',
      'none': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-slate-100 text-slate-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Certificates ({certificates.length})</CardTitle>
          {isEditing && gemId && (
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Certificate
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add Certificate Form */}
        {showAddForm && isEditing && gemId && (
          <Card className="border-dashed border-2">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificateType">Certificate Type *</Label>
                    <Select 
                      value={formData.certificateType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, certificateType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select certificate type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CERTIFICATE_TYPE_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificateNumber">Certificate Number *</Label>
                    <Input
                      id="certificateNumber"
                      placeholder="e.g., GIA-1234567890"
                      value={formData.certificateNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issuingAuthority">Issuing Authority</Label>
                    <Input
                      id="issuingAuthority"
                      placeholder="e.g., Gemological Institute of America"
                      value={formData.issuingAuthority}
                      onChange={(e) => setFormData(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificateUrl">Certificate URL</Label>
                    <Input
                      id="certificateUrl"
                      type="url"
                      placeholder="https://..."
                      value={formData.certificateUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, certificateUrl: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this certificate..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>

                <FileUpload
                  bucket="gem-certificates"
                  folder="certificates"
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={10}
                  onUpload={(url) => setFormData(prev => ({ ...prev, certificateUrl: url }))}
                  currentFile={formData.certificateUrl}
                  label="Certificate File"
                />

                <div className="flex gap-2 pt-2">
                  <Button type="submit" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Certificate
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing Certificates */}
        {certificates.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No certificates added yet
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="relative">
                <CardContent className="pt-4">
                  {editingCertificate === certificate.id ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Certificate Type *</Label>
                          <Select 
                            value={formData.certificateType} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, certificateType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select certificate type" />
                            </SelectTrigger>
                            <SelectContent>
                              {CERTIFICATE_TYPE_OPTIONS.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Certificate Number *</Label>
                          <Input
                            placeholder="e.g., GIA-1234567890"
                            value={formData.certificateNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Issuing Authority</Label>
                          <Input
                            placeholder="e.g., Gemological Institute of America"
                            value={formData.issuingAuthority}
                            onChange={(e) => setFormData(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Certificate URL</Label>
                          <Input
                            type="url"
                            placeholder="https://..."
                            value={formData.certificateUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, certificateUrl: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Issue Date</Label>
                          <Input
                            type="date"
                            value={formData.issueDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Expiry Date</Label>
                          <Input
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          placeholder="Additional notes about this certificate..."
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button type="submit" size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getCertificateTypeColor(certificate.certificateType)}>
                            {certificate.certificateType}
                          </Badge>
                          <div>
                            <div className="font-medium text-slate-900">
                              {certificate.certificateNumber}
                            </div>
                            {certificate.issuingAuthority && (
                              <div className="text-sm text-slate-600">
                                {certificate.issuingAuthority}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {isEditing && gemId && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(certificate)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Certificate</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this certificate? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(certificate.id!)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {certificate.issueDate && (
                          <div>
                            <span className="text-slate-500">Issue Date:</span>
                            <div className="font-medium">{new Date(certificate.issueDate).toLocaleDateString()}</div>
                          </div>
                        )}
                        {certificate.expiryDate && (
                          <div>
                            <span className="text-slate-500">Expiry Date:</span>
                            <div className="font-medium">{new Date(certificate.expiryDate).toLocaleDateString()}</div>
                          </div>
                        )}
                        {certificate.certificateUrl && (
                          <div>
                            <span className="text-slate-500">Certificate URL:</span>
                            <div>
                              <a 
                                href={certificate.certificateUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                View Certificate
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {certificate.notes && (
                        <div className="pt-2 border-t">
                          <span className="text-slate-500 text-sm">Notes:</span>
                          <div className="text-sm mt-1">{certificate.notes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
