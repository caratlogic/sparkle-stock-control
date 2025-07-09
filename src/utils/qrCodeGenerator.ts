import QRCode from 'qrcode';
import JSZip from 'jszip';
import { Gem } from '../types/gem';
import { QRCodeFieldConfig } from '../components/QRCodeSettings';

export interface QRCodeData {
  stockId: string;
  gemType: string;
  carat: number;
  color: string;
  cut?: string;
  measurements?: string;
  certificateNumber: string;
  price: number;
  pricePerCarat: number;
  description?: string;
  origin?: string;
  treatment?: string;
  supplier?: string;
  dateAdded: string;
}

export const generateCustomQRCode = async (
  data: QRCodeData,
  fieldConfig: QRCodeFieldConfig
): Promise<string> => {
  try {
    // Create structured data for QR code based on field configuration
    const qrData: any = {
      type: 'GEM_INVENTORY',
      stockId: data.stockId, // Always included
    };

    // Add fields based on configuration
    if (fieldConfig.gemType) qrData.gemType = data.gemType;
    if (fieldConfig.carat) qrData.carat = data.carat;
    if (fieldConfig.color) qrData.color = data.color;
    if (fieldConfig.cut) qrData.cut = data.cut;
    if (fieldConfig.measurements) qrData.measurements = data.measurements;
    if (fieldConfig.certificateNumber) qrData.certificateNumber = data.certificateNumber;
    if (fieldConfig.price) {
      qrData.price = data.price;
      qrData.pricePerCarat = data.pricePerCarat;
    }
    if (fieldConfig.description) qrData.description = data.description;
    if (fieldConfig.origin) qrData.origin = data.origin;
    if (fieldConfig.treatment) qrData.treatment = data.treatment;
    if (fieldConfig.supplier) qrData.supplier = data.supplier;

    // Always add URL and date for tracking
    qrData.dateAdded = data.dateAdded;
    qrData.url = `${window.location.origin}/gem/${data.stockId}`;

    // Convert to JSON string
    const jsonData = JSON.stringify(qrData);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(jsonData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Backward compatibility - uses default config
export const generateQRCode = async (
  data: QRCodeData
): Promise<string> => {
  const defaultConfig: QRCodeFieldConfig = {
    stockId: true,
    gemType: true,
    carat: true,
    color: true,
    cut: true,
    measurements: true,
    certificateNumber: true,
    price: true,
    treatment: true,
    origin: true,
    supplier: false,
    description: false
  };
  
  return generateCustomQRCode(data, defaultConfig);
};

export const downloadCustomQRCode = async (
  data: QRCodeData,
  fieldConfig: QRCodeFieldConfig,
  filename?: string
): Promise<void> => {
  try {
    // Generate QR code for download with higher resolution
    const qrData: any = {
      type: 'GEM_INVENTORY',
      stockId: data.stockId,
    };

    // Add fields based on configuration
    if (fieldConfig.gemType) qrData.gemType = data.gemType;
    if (fieldConfig.carat) qrData.carat = data.carat;
    if (fieldConfig.color) qrData.color = data.color;
    if (fieldConfig.cut) qrData.cut = data.cut;
    if (fieldConfig.measurements) qrData.measurements = data.measurements;
    if (fieldConfig.certificateNumber) qrData.certificateNumber = data.certificateNumber;
    if (fieldConfig.price) {
      qrData.price = data.price;
      qrData.pricePerCarat = data.pricePerCarat;
    }
    if (fieldConfig.description) qrData.description = data.description;
    if (fieldConfig.origin) qrData.origin = data.origin;
    if (fieldConfig.treatment) qrData.treatment = data.treatment;
    if (fieldConfig.supplier) qrData.supplier = data.supplier;

    qrData.dateAdded = data.dateAdded;
    qrData.url = `${window.location.origin}/gem/${data.stockId}`;

    const jsonData = JSON.stringify(qrData);

    // Create canvas for printable QR code with labels
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas size for printable format (300 DPI equivalent)
    const printWidth = 600; // 2 inches at 300 DPI
    const printHeight = 800; // 2.67 inches at 300 DPI
    canvas.width = printWidth;
    canvas.height = printHeight;

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, printWidth, printHeight);

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(jsonData, {
      width: 400,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // High error correction for printing
    });

    // Load QR code image
    const qrImage = new Image();
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrCodeDataUrl;
    });

    // Draw QR code centered
    const qrSize = 400;
    const qrX = (printWidth - qrSize) / 2;
    const qrY = 50;
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // Add text information below QR code
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    const textY = qrY + qrSize + 40;
    const lineHeight = 25;
    let currentY = textY;

    // Stock ID (always shown)
    ctx.font = 'bold 28px Arial';
    ctx.fillText(data.stockId, printWidth / 2, currentY);
    currentY += lineHeight + 10;

    // Add other fields based on configuration
    ctx.font = '18px Arial';
    
    if (fieldConfig.gemType && fieldConfig.carat) {
      ctx.fillText(`${data.carat}ct ${data.gemType}`, printWidth / 2, currentY);
      currentY += lineHeight;
    } else if (fieldConfig.gemType) {
      ctx.fillText(data.gemType, printWidth / 2, currentY);
      currentY += lineHeight;
    } else if (fieldConfig.carat) {
      ctx.fillText(`${data.carat}ct`, printWidth / 2, currentY);
      currentY += lineHeight;
    }

    if (fieldConfig.color && fieldConfig.cut) {
      ctx.fillText(`${data.color} ${data.cut || ''}`, printWidth / 2, currentY);
      currentY += lineHeight;
    } else if (fieldConfig.color) {
      ctx.fillText(data.color, printWidth / 2, currentY);
      currentY += lineHeight;
    } else if (fieldConfig.cut && data.cut) {
      ctx.fillText(data.cut, printWidth / 2, currentY);
      currentY += lineHeight;
    }

    if (fieldConfig.measurements && data.measurements) {
      ctx.fillText(data.measurements, printWidth / 2, currentY);
      currentY += lineHeight;
    }

    if (fieldConfig.certificateNumber) {
      ctx.fillText(`Cert: ${data.certificateNumber}`, printWidth / 2, currentY);
      currentY += lineHeight;
    }

    if (fieldConfig.treatment && data.treatment) {
      ctx.fillText(`Treatment: ${data.treatment}`, printWidth / 2, currentY);
      currentY += lineHeight;
    }

    if (fieldConfig.supplier && data.supplier) {
      ctx.fillText(`Supplier: ${data.supplier}`, printWidth / 2, currentY);
      currentY += lineHeight;
    }

    if (fieldConfig.origin && data.origin) {
      ctx.fillText(`Origin: ${data.origin}`, printWidth / 2, currentY);
      currentY += lineHeight;
    }

    if (fieldConfig.price) {
      ctx.fillText(`$${data.price.toLocaleString()}`, printWidth / 2, currentY);
      currentY += lineHeight;
    }

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create blob');
      }

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename || `qr-code-${data.stockId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }, 'image/png');

  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
};

// Backward compatibility
export const downloadQRCode = async (
  data: QRCodeData,
  filename?: string
): Promise<void> => {
  const defaultConfig: QRCodeFieldConfig = {
    stockId: true,
    gemType: true,
    carat: true,
    color: true,
    cut: true,
    measurements: true,
    certificateNumber: true,
    price: true,
    treatment: true,
    origin: true,
    supplier: false,
    description: false
  };
  
  return downloadCustomQRCode(data, defaultConfig, filename);
};

// Function to convert gem data to QR code data format
const gemToQRCodeData = (gem: Gem): QRCodeData => {
  return {
    stockId: gem.stockId,
    gemType: gem.gemType,
    carat: gem.carat,
    color: gem.color,
    cut: gem.cut,
    measurements: gem.measurements || '',
    certificateNumber: gem.certificateNumber,
    price: gem.price,
    pricePerCarat: gem.price / gem.carat,
    description: gem.description || '',
    origin: gem.origin || '',
    treatment: gem.treatment || '',
    supplier: gem.supplier || '',
    dateAdded: gem.dateAdded
  };
};

// Bulk download function
export const downloadAllQRCodes = async (
  gems: Gem[],
  fieldConfig: QRCodeFieldConfig,
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  try {
    const zip = new JSZip();
    const total = gems.length;

    for (let i = 0; i < gems.length; i++) {
      const gem = gems[i];
      onProgress?.(i + 1, total);

      // Convert gem to QR code data
      const qrData = gemToQRCodeData(gem);

      // Generate QR code data for this gem
      const qrCodeDataUrl = await generateCustomQRCode(qrData, fieldConfig);
      
      // Convert data URL to blob
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      
      // Add to zip with gem stock ID as filename
      zip.file(`${gem.stockId}.png`, blob);
    }

    // Generate zip file and download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `qr-codes-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error downloading bulk QR codes:', error);
    throw new Error('Failed to download QR codes');
  }
};