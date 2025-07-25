-- Create table for customizable gem settings
CREATE TABLE public.gem_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('gem_type', 'treatment', 'cut', 'gem_color')),
  gem_type TEXT NULL, -- Only used for gem_color settings
  value TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(setting_type, gem_type, value)
);

-- Enable RLS
ALTER TABLE public.gem_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for gem settings
CREATE POLICY "Allow all operations on gem_settings" 
ON public.gem_settings 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gem_settings_updated_at
BEFORE UPDATE ON public.gem_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default gem types
INSERT INTO public.gem_settings (setting_type, value, display_order) VALUES
('gem_type', 'Diamond', 1),
('gem_type', 'Emerald', 2),
('gem_type', 'Ruby', 3),
('gem_type', 'Sapphire', 4),
('gem_type', 'Amethyst', 5),
('gem_type', 'Aquamarine', 6),
('gem_type', 'Garnet', 7),
('gem_type', 'Opal', 8),
('gem_type', 'Topaz', 9),
('gem_type', 'Tourmaline', 10);

-- Insert default cuts
INSERT INTO public.gem_settings (setting_type, value, display_order) VALUES
('cut', 'Round', 1),
('cut', 'Princess', 2),
('cut', 'Emerald', 3),
('cut', 'Asscher', 4),
('cut', 'Marquise', 5),
('cut', 'Oval', 6),
('cut', 'Radiant', 7),
('cut', 'Pear', 8),
('cut', 'Heart', 9),
('cut', 'Cushion', 10),
('cut', 'Cabochon', 11),
('cut', 'Faceted', 12),
('cut', 'Raw', 13);

-- Insert default treatments
INSERT INTO public.gem_settings (setting_type, value, display_order) VALUES
('treatment', 'none', 1),
('treatment', 'H', 2),
('treatment', 'NH', 3),
('treatment', 'NO', 4),
('treatment', 'MI', 5);

-- Insert default gem colors for each gem type
INSERT INTO public.gem_settings (setting_type, gem_type, value, display_order) VALUES
-- Diamond colors
('gem_color', 'Diamond', 'D', 1),
('gem_color', 'Diamond', 'E', 2),
('gem_color', 'Diamond', 'F', 3),
('gem_color', 'Diamond', 'G', 4),
('gem_color', 'Diamond', 'H', 5),
('gem_color', 'Diamond', 'I', 6),
('gem_color', 'Diamond', 'J', 7),
('gem_color', 'Diamond', 'K', 8),
('gem_color', 'Diamond', 'L', 9),
('gem_color', 'Diamond', 'M', 10),

-- Emerald colors
('gem_color', 'Emerald', 'Vivid Green', 1),
('gem_color', 'Emerald', 'Green', 2),
('gem_color', 'Emerald', 'Slightly Bluish Green', 3),
('gem_color', 'Emerald', 'Yellowish Green', 4),
('gem_color', 'Emerald', 'Light Green', 5),

-- Ruby colors
('gem_color', 'Ruby', 'Vivid Red', 1),
('gem_color', 'Ruby', 'Red', 2),
('gem_color', 'Ruby', 'Slightly Purplish Red', 3),
('gem_color', 'Ruby', 'Pinkish Red', 4),
('gem_color', 'Ruby', 'Dark Red', 5),

-- Sapphire colors
('gem_color', 'Sapphire', 'Blue', 1),
('gem_color', 'Sapphire', 'Pink', 2),
('gem_color', 'Sapphire', 'Yellow', 3),
('gem_color', 'Sapphire', 'White', 4),
('gem_color', 'Sapphire', 'Orange', 5),
('gem_color', 'Sapphire', 'Purple', 6),
('gem_color', 'Sapphire', 'Green', 7),
('gem_color', 'Sapphire', 'Padparadscha', 8),

-- Amethyst colors
('gem_color', 'Amethyst', 'Deep Purple', 1),
('gem_color', 'Amethyst', 'Purple', 2),
('gem_color', 'Amethyst', 'Light Purple', 3),
('gem_color', 'Amethyst', 'Lavender', 4),
('gem_color', 'Amethyst', 'Rose de France', 5),

-- Aquamarine colors
('gem_color', 'Aquamarine', 'Deep Blue', 1),
('gem_color', 'Aquamarine', 'Blue', 2),
('gem_color', 'Aquamarine', 'Light Blue', 3),
('gem_color', 'Aquamarine', 'Blue-Green', 4),
('gem_color', 'Aquamarine', 'Pale Blue', 5),

-- Garnet colors
('gem_color', 'Garnet', 'Red', 1),
('gem_color', 'Garnet', 'Orange', 2),
('gem_color', 'Garnet', 'Yellow', 3),
('gem_color', 'Garnet', 'Green', 4),
('gem_color', 'Garnet', 'Purple', 5),
('gem_color', 'Garnet', 'Pink', 6),

-- Opal colors
('gem_color', 'Opal', 'White', 1),
('gem_color', 'Opal', 'Black', 2),
('gem_color', 'Opal', 'Crystal', 3),
('gem_color', 'Opal', 'Boulder', 4),
('gem_color', 'Opal', 'Fire', 5),
('gem_color', 'Opal', 'Water', 6),

-- Topaz colors
('gem_color', 'Topaz', 'Blue', 1),
('gem_color', 'Topaz', 'Pink', 2),
('gem_color', 'Topaz', 'Yellow', 3),
('gem_color', 'Topaz', 'White', 4),
('gem_color', 'Topaz', 'Orange', 5),
('gem_color', 'Topaz', 'Imperial', 6),

-- Tourmaline colors
('gem_color', 'Tourmaline', 'Pink', 1),
('gem_color', 'Tourmaline', 'Green', 2),
('gem_color', 'Tourmaline', 'Blue', 3),
('gem_color', 'Tourmaline', 'Watermelon', 4),
('gem_color', 'Tourmaline', 'Paraiba', 5),
('gem_color', 'Tourmaline', 'Black', 6);