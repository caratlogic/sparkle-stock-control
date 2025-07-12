import { useState, useEffect } from 'react';
import { QRCodeFieldConfig } from '../components/QRCodeSettings';

const QR_CODE_SETTINGS_KEY = 'qr-code-field-config';

export const useQRCodeSettings = () => {
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

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(QR_CODE_SETTINGS_KEY);
    if (savedConfig) {
      try {
        setFieldConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading QR code settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  const updateFieldConfig = (newConfig: QRCodeFieldConfig) => {
    setFieldConfig(newConfig);
    localStorage.setItem(QR_CODE_SETTINGS_KEY, JSON.stringify(newConfig));
  };

  return {
    fieldConfig,
    updateFieldConfig
  };
};