
import JsBarcode from 'jsbarcode';

export const generateBarcode = (stockId: string, gemType?: string, color?: string, cut?: string): string => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  
  // Create display text with additional gem information
  let displayText = stockId;
  if (gemType || color || cut) {
    const additionalInfo = [gemType, color, cut].filter(Boolean).join(' ');
    displayText = `${stockId} | ${additionalInfo}`;
  }
  
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

export const downloadBarcode = (stockId: string, gemType: string, color?: string, cut?: string) => {
  const barcodeDataUrl = generateBarcode(stockId, gemType, color, cut);
  
  // Create a download link
  const link = document.createElement('a');
  link.href = barcodeDataUrl;
  link.download = `barcode-${stockId}-${gemType}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
