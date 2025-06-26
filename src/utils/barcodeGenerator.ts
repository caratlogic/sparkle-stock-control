
import JsBarcode from 'jsbarcode';

export const generateBarcode = (stockId: string): string => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  
  // Generate barcode using CODE128 format
  JsBarcode(canvas, stockId, {
    format: "CODE128",
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 16,
    margin: 10
  });
  
  // Return the data URL of the canvas
  return canvas.toDataURL('image/png');
};

export const downloadBarcode = (stockId: string, gemType: string) => {
  const barcodeDataUrl = generateBarcode(stockId);
  
  // Create a download link
  const link = document.createElement('a');
  link.href = barcodeDataUrl;
  link.download = `barcode-${stockId}-${gemType}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
