import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface QRCodeFieldConfig {
  [key: string]: boolean;
}

export const useQRCodeSettings = () => {
  const { user } = useAuth();
  const [fieldConfig, setFieldConfig] = useState<QRCodeFieldConfig>({
    stockId: true,
    gemType: true,
    carat: true,
    color: true,
    cut: true,
    measurements: false,
    certificateNumber: true,
    price: false,
    treatment: false,
    origin: false,
    supplier: false,
    description: false
  });

  // Load settings from database on mount
  useEffect(() => {
    if (user?.email) {
      loadSettings();
    }
  }, [user?.email]);

  const loadSettings = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase
        .from('qr_code_settings')
        .select('field_config')
        .eq('user_email', user.email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading QR code settings:', error);
        return;
      }

      if (data?.field_config) {
        setFieldConfig(data.field_config as QRCodeFieldConfig);
      }
    } catch (error) {
      console.error('Error loading QR code settings:', error);
    }
  };

  const saveSettings = async (newConfig: QRCodeFieldConfig) => {
    if (!user?.email) return;

    try {
      const { error } = await supabase
        .from('qr_code_settings')
        .upsert({
          user_email: user.email,
          field_config: newConfig
        });

      if (error) {
        console.error('Error saving QR code settings:', error);
        return;
      }

      setFieldConfig(newConfig);
    } catch (error) {
      console.error('Error saving QR code settings:', error);
    }
  };

  const updateFieldConfig = (newConfig: QRCodeFieldConfig) => {
    setFieldConfig(newConfig);
    saveSettings(newConfig);
  };

  return {
    fieldConfig,
    updateFieldConfig
  };
};