import QRCode from 'qrcode';

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
  dateAdded: string;
}

export const generateQRCode = async (
  data: QRCodeData
): Promise<string> => {
  try {
    // Create structured data for QR code
    const qrData = {
      type: 'GEM_INVENTORY',
      stockId: data.stockId,
      gemType: data.gemType,
      carat: data.carat,
      color: data.color,
      cut: data.cut,
      measurements: data.measurements,
      certificateNumber: data.certificateNumber,
      price: data.price,
      pricePerCarat: data.pricePerCarat,
      description: data.description,
      origin: data.origin,
      treatment: data.treatment,
      dateAdded: data.dateAdded,
      url: `${window.location.origin}/gem/${data.stockId}` // Link to gem details
    };

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

export const downloadQRCode = async (
  data: QRCodeData,
  filename?: string
): Promise<void> => {
  try {
    // Generate QR code for download with higher resolution
    const qrData = {
      type: 'GEM_INVENTORY',
      stockId: data.stockId,
      gemType: data.gemType,
      carat: data.carat,
      color: data.color,
      cut: data.cut,
      measurements: data.measurements,
      certificateNumber: data.certificateNumber,
      price: data.price,
      pricePerCarat: data.pricePerCarat,
      description: data.description,
      origin: data.origin,
      treatment: data.treatment,
      dateAdded: data.dateAdded,
      url: `${window.location.origin}/gem/${data.stockId}`
    };

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
    const lineHeight = 30;
    let currentY = textY;

    // Stock ID
    ctx.font = 'bold 28px Arial';
    ctx.fillText(data.stockId, printWidth / 2, currentY);
    currentY += lineHeight + 10;

    // Gem details
    ctx.font = '20px Arial';
    ctx.fillText(`${data.carat}ct ${data.gemType}`, printWidth / 2, currentY);
    currentY += lineHeight;

    ctx.fillText(`${data.color} ${data.cut || ''}`, printWidth / 2, currentY);
    currentY += lineHeight;

    if (data.measurements) {
      ctx.fillText(`${data.measurements}`, printWidth / 2, currentY);
      currentY += lineHeight;
    }

    ctx.fillText(`Cert: ${data.certificateNumber}`, printWidth / 2, currentY);
    currentY += lineHeight;

    ctx.fillText(`$${data.price.toLocaleString()}`, printWidth / 2, currentY);

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