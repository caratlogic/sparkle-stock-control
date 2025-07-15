import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserSettings {
  qrCodeSettings?: any;
  columnCustomizations?: Record<string, Record<string, string>>;
  theme?: 'light' | 'dark' | 'system';
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({});
  const [loading, setLoading] = useState(false);

  // Load settings from localStorage and database
  useEffect(() => {
    if (user?.email) {
      loadSettings();
    }
  }, [user?.email]);

  const loadSettings = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      // Load from localStorage first (for immediate availability)
      const localSettings = localStorage.getItem(`userSettings_${user.email}`);
      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        setSettings(parsed);
      }

      // Load QR code settings from database
      const { data: qrData } = await supabase
        .from('qr_code_settings')
        .select('field_config')
        .eq('user_email', user.email)
        .maybeSingle();

      // Load column customizations from database
      const { data: columnData } = await supabase
        .from('column_customizations')
        .select('table_name, column_key, display_name')
        .eq('user_email', user.email);

      // Organize column customizations by table
      const columnCustomizations: Record<string, Record<string, string>> = {};
      columnData?.forEach(item => {
        if (!columnCustomizations[item.table_name]) {
          columnCustomizations[item.table_name] = {};
        }
        columnCustomizations[item.table_name][item.column_key] = item.display_name;
      });

      const updatedSettings: UserSettings = {
        ...settings,
        qrCodeSettings: qrData?.field_config,
        columnCustomizations
      };

      setSettings(updatedSettings);
      
      // Save to localStorage for persistence
      localStorage.setItem(`userSettings_${user.email}`, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user?.email) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to localStorage immediately
    localStorage.setItem(`userSettings_${user.email}`, JSON.stringify(updatedSettings));

    // Save specific settings to database
    try {
      if (newSettings.qrCodeSettings) {
        await supabase
          .from('qr_code_settings')
          .upsert({
            user_email: user.email,
            field_config: newSettings.qrCodeSettings
          });
      }

      if (newSettings.columnCustomizations) {
        // Handle column customizations updates
        for (const [tableName, customizations] of Object.entries(newSettings.columnCustomizations)) {
          // Delete existing customizations for this table
          await supabase
            .from('column_customizations')
            .delete()
            .eq('user_email', user.email)
            .eq('table_name', tableName);

          // Insert new customizations
          const customizationRecords = Object.entries(customizations).map(([columnKey, displayName]) => ({
            user_email: user.email,
            table_name: tableName,
            column_key: columnKey,
            display_name: displayName
          }));

          if (customizationRecords.length > 0) {
            await supabase
              .from('column_customizations')
              .insert(customizationRecords);
          }
        }
      }
    } catch (error) {
      console.error('Error saving settings to database:', error);
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: loadSettings
  };
};