import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GemCertificate } from '../types/gem';

export const useGemCertificates = (gemId?: string) => {
  const [certificates, setCertificates] = useState<GemCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCertificates = async () => {
    if (!gemId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gem_certificates')
        .select('*')
        .eq('gem_id', gemId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setCertificates(data?.map(cert => ({
        id: cert.id,
        gemId: cert.gem_id,
        certificateType: cert.certificate_type,
        certificateNumber: cert.certificate_number,
        issuingAuthority: cert.issuing_authority,
        issueDate: cert.issue_date,
        expiryDate: cert.expiry_date,
        certificateUrl: cert.certificate_url,
        notes: cert.notes,
        createdAt: cert.created_at,
        updatedAt: cert.updated_at
      })) || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch certificates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCertificate = async (certificate: Omit<GemCertificate, 'id' | 'gemId' | 'createdAt' | 'updatedAt'>) => {
    if (!gemId) return;

    try {
      // First verify the gem exists
      const { data: gemExists } = await supabase
        .from('gems')
        .select('id')
        .eq('id', gemId)
        .single();

      if (!gemExists) {
        throw new Error('Gem not found');
      }

      const { data, error } = await supabase
        .from('gem_certificates')
        .insert([{
          gem_id: gemId,
          certificate_type: certificate.certificateType,
          certificate_number: certificate.certificateNumber,
          issuing_authority: certificate.issuingAuthority || null,
          issue_date: certificate.issueDate || null,
          expiry_date: certificate.expiryDate || null,
          certificate_url: certificate.certificateUrl || null,
          notes: certificate.notes || null
        }])
        .select()
        .single();

      if (error) throw error;

      const newCertificate = {
        id: data.id,
        gemId: data.gem_id,
        certificateType: data.certificate_type,
        certificateNumber: data.certificate_number,
        issuingAuthority: data.issuing_authority,
        issueDate: data.issue_date,
        expiryDate: data.expiry_date,
        certificateUrl: data.certificate_url,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setCertificates(prev => [...prev, newCertificate]);

      toast({
        title: "Success",
        description: "Certificate added successfully"
      });

      return newCertificate;
    } catch (error) {
      console.error('Error adding certificate:', error);
      toast({
        title: "Error",
        description: "Failed to add certificate",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCertificate = async (certificateId: string, updates: Partial<GemCertificate>) => {
    try {
      const { data, error } = await supabase
        .from('gem_certificates')
        .update({
          certificate_type: updates.certificateType,
          certificate_number: updates.certificateNumber,
          issuing_authority: updates.issuingAuthority,
          issue_date: updates.issueDate,
          expiry_date: updates.expiryDate,
          certificate_url: updates.certificateUrl,
          notes: updates.notes
        })
        .eq('id', certificateId)
        .select()
        .single();

      if (error) throw error;

      setCertificates(prev => 
        prev.map(cert => 
          cert.id === certificateId 
            ? {
                ...cert,
                certificateType: data.certificate_type,
                certificateNumber: data.certificate_number,
                issuingAuthority: data.issuing_authority,
                issueDate: data.issue_date,
                expiryDate: data.expiry_date,
                certificateUrl: data.certificate_url,
                notes: data.notes,
                updatedAt: data.updated_at
              }
            : cert
        )
      );

      toast({
        title: "Success",
        description: "Certificate updated successfully"
      });
    } catch (error) {
      console.error('Error updating certificate:', error);
      toast({
        title: "Error",
        description: "Failed to update certificate",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCertificate = async (certificateId: string) => {
    try {
      const { error } = await supabase
        .from('gem_certificates')
        .delete()
        .eq('id', certificateId);

      if (error) throw error;

      setCertificates(prev => prev.filter(cert => cert.id !== certificateId));

      toast({
        title: "Success",
        description: "Certificate deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast({
        title: "Error",
        description: "Failed to delete certificate",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [gemId]);

  return {
    certificates,
    loading,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    refetch: fetchCertificates
  };
};