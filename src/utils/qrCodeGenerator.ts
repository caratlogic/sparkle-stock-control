import QRCode from 'qrcode';
import JSZip from 'jszip';
import { Gem } from '../types/gem';
import { QRCodeFieldConfig } from '../hooks/useQRCodeSettings';

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
  costPrice: number;
  costPricePerCarat: number;
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
    if (fieldConfig.sellingPrice) {
      qrData.price = data.price;
      qrData.pricePerCarat = data.pricePerCarat;
    }
    if (fieldConfig.costPrice) {
      qrData.costPrice = data.costPrice;
      qrData.costPricePerCarat = data.costPricePerCarat;
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
    sellingPrice: true,
    costPrice: false,
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
    if (fieldConfig.sellingPrice) {
      qrData.price = data.price;
      qrData.pricePerCarat = data.pricePerCarat;
    }
    if (fieldConfig.costPrice) {
      qrData.costPrice = data.costPrice;
      qrData.costPricePerCarat = data.costPricePerCarat;
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

    if (fieldConfig.sellingPrice) {
      ctx.fillText(`Selling: $${data.price.toLocaleString()} ($${data.pricePerCarat.toLocaleString()}/ct)`, printWidth / 2, currentY);
      currentY += lineHeight;
    }

    if (fieldConfig.costPrice) {
      ctx.fillText(`Cost: $${data.costPrice.toLocaleString()} ($${data.costPricePerCarat.toLocaleString()}/ct)`, printWidth / 2, currentY);
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
    sellingPrice: true,
    costPrice: false,
    treatment: true,
    origin: true,
    supplier: false,
    description: false
  };
  
  return downloadCustomQRCode(data, defaultConfig, filename);
};

// Function to convert gem data to QR code data format
export const gemToQRCodeData = (gem: Gem): QRCodeData => {
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
    costPrice: gem.costPrice || 0,
    costPricePerCarat: (gem.costPrice || 0) / gem.carat,
    description: gem.description || '',
    origin: gem.origin || '',
    treatment: gem.treatment || '',
    supplier: gem.supplier || '',
    dateAdded: gem.dateAdded
  };
};

// Bulk download function
// Function to print QR code in proper printable format
export const printCustomQRCode = async (
  data: QRCodeData,
  fieldConfig: QRCodeFieldConfig
): Promise<void> => {
  try {
    // Create structured data for QR code based on field configuration
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
    if (fieldConfig.sellingPrice) {
      qrData.price = data.price;
      qrData.pricePerCarat = data.pricePerCarat;
    }
    if (fieldConfig.costPrice) {
      qrData.costPrice = data.costPrice;
      qrData.costPricePerCarat = data.costPricePerCarat;
    }
    if (fieldConfig.description) qrData.description = data.description;
    if (fieldConfig.origin) qrData.origin = data.origin;
    if (fieldConfig.treatment) qrData.treatment = data.treatment;
    if (fieldConfig.supplier) qrData.supplier = data.supplier;

    qrData.dateAdded = data.dateAdded;
    qrData.url = `${window.location.origin}/gem/${data.stockId}`;

    const jsonData = JSON.stringify(qrData);

    // Generate QR code with higher resolution for printing
    const qrCodeDataUrl = await QRCode.toDataURL(jsonData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // High error correction for printing
    });

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    // Build printable HTML with proper formatting and column names
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${data.stockId}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              background: white;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #333;
              padding: 20px;
              margin: 20px;
              background: white;
              page-break-inside: avoid;
            }
            .qr-code {
              margin: 20px 0;
            }
            .qr-info {
              margin-top: 15px;
            }
            .stock-id {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #333;
            }
            .gem-details {
              font-size: 16px;
              color: #666;
              line-height: 1.4;
            }
            .field-row {
              margin: 5px 0;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .field-label {
              font-weight: bold;
              margin-right: 8px;
            }
            .field-value {
              color: #333;
            }
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              .qr-container {
                margin: 0;
                border: 1px solid #333;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-code">
              <img src="${qrCodeDataUrl}" alt="QR Code for ${data.stockId}" style="width: 300px; height: 300px;" />
            </div>
            <div class="qr-info">
              <div class="stock-id">${data.stockId}</div>
              <div class="gem-details">
                ${fieldConfig.gemType && fieldConfig.carat ? `
                <div class="field-row">
                  <span class="field-label">Gem Type & Carat:</span>
                  <span class="field-value">${data.carat}ct ${data.gemType}</span>
                </div>
                ` : ''}
                ${fieldConfig.gemType && !fieldConfig.carat ? `
                <div class="field-row">
                  <span class="field-label">Gem Type:</span>
                  <span class="field-value">${data.gemType}</span>
                </div>
                ` : ''}
                ${fieldConfig.carat && !fieldConfig.gemType ? `
                <div class="field-row">
                  <span class="field-label">Carat:</span>
                  <span class="field-value">${data.carat}ct</span>
                </div>
                ` : ''}
                ${fieldConfig.color ? `
                <div class="field-row">
                  <span class="field-label">Color:</span>
                  <span class="field-value">${data.color}</span>
                </div>
                ` : ''}
                ${fieldConfig.cut && data.cut ? `
                <div class="field-row">
                  <span class="field-label">Cut:</span>
                  <span class="field-value">${data.cut}</span>
                </div>
                ` : ''}
                ${fieldConfig.measurements && data.measurements ? `
                <div class="field-row">
                  <span class="field-label">Measurements:</span>
                  <span class="field-value">${data.measurements}</span>
                </div>
                ` : ''}
                ${fieldConfig.certificateNumber ? `
                <div class="field-row">
                  <span class="field-label">Certificate Number:</span>
                  <span class="field-value">${data.certificateNumber}</span>
                </div>
                ` : ''}
                ${fieldConfig.treatment && data.treatment ? `
                <div class="field-row">
                  <span class="field-label">Treatment:</span>
                  <span class="field-value">${data.treatment}</span>
                </div>
                ` : ''}
                ${fieldConfig.origin && data.origin ? `
                <div class="field-row">
                  <span class="field-label">Origin:</span>
                  <span class="field-value">${data.origin}</span>
                </div>
                ` : ''}
                ${fieldConfig.supplier && data.supplier ? `
                <div class="field-row">
                  <span class="field-label">Supplier:</span>
                  <span class="field-value">${data.supplier}</span>
                </div>
                ` : ''}
                ${fieldConfig.sellingPrice ? `
                <div class="field-row">
                  <span class="field-label">Selling Price:</span>
                  <span class="field-value">$${data.price.toLocaleString()}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Selling Price/Carat:</span>
                  <span class="field-value">$${data.pricePerCarat.toLocaleString()}/ct</span>
                </div>
                ` : ''}
                ${fieldConfig.costPrice ? `
                <div class="field-row">
                  <span class="field-label">Cost Price:</span>
                  <span class="field-value">$${data.costPrice.toLocaleString()}</span>
                </div>
                <div class="field-row">
                  <span class="field-label">Cost Price/Carat:</span>
                  <span class="field-value">$${data.costPricePerCarat.toLocaleString()}/ct</span>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for image to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };

  } catch (error) {
    console.error('Error printing QR code:', error);
    throw new Error('Failed to print QR code');
  }
};

// Bulk print function for multiple QR codes
export const printAllQRCodes = async (
  gems: Gem[],
  fieldConfig: QRCodeFieldConfig,
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  try {
    const total = gems.length;
    const qrCodePages: string[] = [];

    for (let i = 0; i < gems.length; i++) {
      const gem = gems[i];
      onProgress?.(i + 1, total);

      // Convert gem to QR code data
      const qrData = gemToQRCodeData(gem);

      // Create structured data for QR code based on field configuration
      const qrDataStructured: any = {
        type: 'GEM_INVENTORY',
        stockId: qrData.stockId,
      };

      // Add fields based on configuration
      if (fieldConfig.gemType) qrDataStructured.gemType = qrData.gemType;
      if (fieldConfig.carat) qrDataStructured.carat = qrData.carat;
      if (fieldConfig.color) qrDataStructured.color = qrData.color;
      if (fieldConfig.cut) qrDataStructured.cut = qrData.cut;
      if (fieldConfig.measurements) qrDataStructured.measurements = qrData.measurements;
      if (fieldConfig.certificateNumber) qrDataStructured.certificateNumber = qrData.certificateNumber;
      if (fieldConfig.sellingPrice) {
        qrDataStructured.price = qrData.price;
        qrDataStructured.pricePerCarat = qrData.pricePerCarat;
      }
      if (fieldConfig.costPrice) {
        qrDataStructured.costPrice = qrData.costPrice;
        qrDataStructured.costPricePerCarat = qrData.costPricePerCarat;
      }
      if (fieldConfig.description) qrDataStructured.description = qrData.description;
      if (fieldConfig.origin) qrDataStructured.origin = qrData.origin;
      if (fieldConfig.treatment) qrDataStructured.treatment = qrData.treatment;
      if (fieldConfig.supplier) qrDataStructured.supplier = qrData.supplier;

      qrDataStructured.dateAdded = qrData.dateAdded;
      qrDataStructured.url = `${window.location.origin}/gem/${qrData.stockId}`;

      const jsonData = JSON.stringify(qrDataStructured);

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(jsonData, {
        width: 250,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      // Create HTML for this QR code
      const qrCodeHTML = `
        <div class="qr-container">
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="QR Code for ${qrData.stockId}" style="width: 250px; height: 250px;" />
          </div>
          <div class="qr-info">
            <div class="stock-id">${qrData.stockId}</div>
            <div class="gem-details">
              ${fieldConfig.gemType && fieldConfig.carat ? `
              <div class="field-row">
                <span class="field-label">Gem Type & Carat:</span>
                <span class="field-value">${qrData.carat}ct ${qrData.gemType}</span>
              </div>
              ` : ''}
              ${fieldConfig.color ? `
              <div class="field-row">
                <span class="field-label">Color:</span>
                <span class="field-value">${qrData.color}</span>
              </div>
              ` : ''}
              ${fieldConfig.certificateNumber ? `
              <div class="field-row">
                <span class="field-label">Certificate:</span>
                <span class="field-value">${qrData.certificateNumber}</span>
              </div>
              ` : ''}
              ${fieldConfig.sellingPrice ? `
              <div class="field-row">
                <span class="field-label">Selling Price:</span>
                <span class="field-value">$${qrData.price.toLocaleString()}</span>
              </div>
              ` : ''}
              ${fieldConfig.costPrice ? `
              <div class="field-row">
                <span class="field-label">Cost Price:</span>
                <span class="field-value">$${qrData.costPrice.toLocaleString()}</span>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      qrCodePages.push(qrCodeHTML);
    }

    // Create print window with all QR codes
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - Gem Inventory</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background: white;
            }
            .print-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #333;
              padding: 15px;
              background: white;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .qr-code {
              margin: 10px 0;
            }
            .qr-info {
              margin-top: 10px;
            }
            .stock-id {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #333;
            }
            .gem-details {
              font-size: 12px;
              color: #666;
              line-height: 1.3;
            }
            .field-row {
              margin: 3px 0;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .field-label {
              font-weight: bold;
              margin-right: 5px;
            }
            .field-value {
              color: #333;
            }
            @media print {
              body {
                margin: 0;
                padding: 10px;
              }
              .print-container {
                gap: 15px;
              }
              .qr-container {
                margin: 0;
                border: 1px solid #333;
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${qrCodePages.join('')}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for images to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    };

  } catch (error) {
    console.error('Error printing QR codes:', error);
    throw new Error('Failed to print QR codes');
  }
};

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