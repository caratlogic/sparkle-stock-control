
import JsBarcode from 'jsbarcode';

export const generateBarcode = (
  stockId: string, 
  carat?: number, 
  measurements?: string, 
  certificates?: string,
  origin?: string,
  treatment?: string
): string => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  
  // Create display text with gem information for barcode scanning
  const barcodeData = {
    stockId,
    carat,
    measurements,
    certificates,
    origin,
    treatment: treatment === 'Heated' ? 'Heated' : 'Not Heated'
  };
  
  // Convert to JSON string for barcode data
  const displayText = JSON.stringify(barcodeData);
  
  // Generate barcode using CODE128 format
  JsBarcode(canvas, stockId, {
    format: "CODE128",
    width: 2,
    height: 100,
    displayValue: true,
    text: displayText,
    fontSize: 14,
    margin: 10
  });
  
  // Return the data URL of the canvas
  return canvas.toDataURL('image/png');
};

export const downloadBarcode = (
  stockId: string, 
  carat?: number, 
  measurements?: string, 
  certificates?: string,
  
  origin?: string,
  treatment?: string
) => {
  const barcodeDataUrl = generateBarcode(stockId, carat, measurements, certificates, origin, treatment);
  
  // Create a download link
  const link = document.createElement('a');
  link.href = barcodeDataUrl;
  link.download = `barcode-${stockId}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
