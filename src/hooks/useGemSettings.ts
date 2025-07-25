import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GemSetting {
  id: string;
  setting_type: 'gem_type' | 'treatment' | 'cut' | 'gem_color';
  gem_type?: string;
  value: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useGemSettings = () => {
  const [gemSettings, setGemSettings] = useState<GemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('gem_settings')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setGemSettings((data || []) as GemSetting[]);
    } catch (error) {
      console.error('Error fetching gem settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch gem settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addGemSetting = async (setting: Omit<GemSetting, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('gem_settings')
        .insert([setting]);

      if (error) throw error;
      
      await fetchGemSettings();
      toast({
        title: "Success",
        description: "Setting added successfully",
      });
    } catch (error) {
      console.error('Error adding gem setting:', error);
      toast({
        title: "Error",
        description: "Failed to add setting",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateGemSetting = async (id: string, updates: Partial<GemSetting>) => {
    try {
      const { error } = await supabase
        .from('gem_settings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchGemSettings();
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    } catch (error) {
      console.error('Error updating gem setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  const deleteGemSetting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gem_settings')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      await fetchGemSettings();
      toast({
        title: "Success",
        description: "Setting deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting gem setting:', error);
      toast({
        title: "Error",
        description: "Failed to delete setting",
        variant: "destructive",
      });
    }
  };

  const getGemTypes = () => {
    return gemSettings
      .filter(setting => setting.setting_type === 'gem_type')
      .map(setting => setting.value);
  };

  const getTreatments = () => {
    return gemSettings
      .filter(setting => setting.setting_type === 'treatment')
      .map(setting => setting.value);
  };

  const getCuts = () => {
    return gemSettings
      .filter(setting => setting.setting_type === 'cut')
      .map(setting => setting.value);
  };

  const getColorsForGemType = (gemType: string) => {
    return gemSettings
      .filter(setting => setting.setting_type === 'gem_color' && setting.gem_type === gemType)
      .map(setting => setting.value);
  };

  const getAllGemColors = () => {
    const colorsByType: Record<string, string[]> = {};
    gemSettings
      .filter(setting => setting.setting_type === 'gem_color')
      .forEach(setting => {
        if (setting.gem_type) {
          if (!colorsByType[setting.gem_type]) {
            colorsByType[setting.gem_type] = [];
          }
          colorsByType[setting.gem_type].push(setting.value);
        }
      });
    return colorsByType;
  };

  useEffect(() => {
    fetchGemSettings();
  }, []);

  return {
    gemSettings,
    loading,
    addGemSetting,
    updateGemSetting,
    deleteGemSetting,
    getGemTypes,
    getTreatments,
    getCuts,
    getColorsForGemType,
    getAllGemColors,
    refetch: fetchGemSettings
  };
};