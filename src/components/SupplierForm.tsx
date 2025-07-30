import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Supplier, SUPPLIER_STATUS_OPTIONS, PAYMENT_TERMS_OPTIONS, RELIABILITY_RATINGS } from '@/types/supplier';

interface SupplierFormProps {
  supplier?: Supplier | null;
  onClose: () => void;
  readOnly?: boolean;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onClose, readOnly = false }) => {
  const { addSupplier, updateSupplier } = useSuppliers();
  const [formData, setFormData] = useState({
    supplier_id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    country: 'USA',
    payment_terms: 'Net 30',
    credit_limit: 0,
    reliability_rating: 3,
    ethical_certifications: [] as string[],
    performance_notes: '',
    status: 'active',
    total_purchase_history: 0,
  });

  const [newCertification, setNewCertification] = useState('');

  useEffect(() => {
    if (supplier) {
      setFormData({
        supplier_id: supplier.supplier_id,
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        country: supplier.country,
        payment_terms: supplier.payment_terms,
        credit_limit: supplier.credit_limit,
        reliability_rating: supplier.reliability_rating,
        ethical_certifications: supplier.ethical_certifications || [],
        performance_notes: supplier.performance_notes || '',
        status: supplier.status,
        total_purchase_history: supplier.total_purchase_history,
      });
    } else {
      // Generate new supplier ID
      const newId = `SUP${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, supplier_id: newId }));
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    try {
      if (supplier) {
        await updateSupplier(supplier.id, formData);
      } else {
        await addSupplier(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !formData.ethical_certifications.includes(newCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        ethical_certifications: [...prev.ethical_certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      ethical_certifications: prev.ethical_certifications.filter(c => c !== cert)
    }));
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        } ${interactive ? 'hover:text-yellow-400' : ''}`}
        onClick={interactive ? () => handleInputChange('reliability_rating', i + 1) : undefined}
      />
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="supplier_id">Supplier ID</Label>
              <Input
                id="supplier_id"
                value={formData.supplier_id}
                onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                disabled={readOnly || !!supplier}
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Supplier Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={readOnly}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={readOnly}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={readOnly}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={readOnly}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Business Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Select
                value={formData.payment_terms}
                onValueChange={(value) => handleInputChange('payment_terms', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS_OPTIONS.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="credit_limit">Credit Limit ($)</Label>
              <Input
                id="credit_limit"
                type="number"
                value={formData.credit_limit}
                onChange={(e) => handleInputChange('credit_limit', parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label>Reliability Rating</Label>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(formData.reliability_rating, !readOnly)}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPLIER_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {supplier && (
              <div>
                <Label>Total Purchase History</Label>
                <div className="text-2xl font-bold text-green-600">
                  ${formData.total_purchase_history.toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certifications and Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Ethical Certifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.ethical_certifications.map((cert) => (
              <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                {cert}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeCertification(cert)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </Badge>
            ))}
          </div>
          
          {!readOnly && (
            <div className="flex gap-2">
              <Input
                placeholder="Add certification (e.g., Kimberley Process)"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
              />
              <Button type="button" onClick={addCertification} variant="outline">
                Add
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.performance_notes}
            onChange={(e) => handleInputChange('performance_notes', e.target.value)}
            disabled={readOnly}
            rows={4}
            placeholder="Notes about supplier performance, quality, reliability, etc."
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      {!readOnly && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {supplier ? 'Update Supplier' : 'Add Supplier'}
          </Button>
        </div>
      )}

      {readOnly && (
        <div className="flex justify-end">
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </form>
  );
};