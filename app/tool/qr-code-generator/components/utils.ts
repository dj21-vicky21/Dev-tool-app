import { QRCodeSettings } from './types';






// Generate QR code options for qrcode.js library
export const getQRCodeOptions = (settings: QRCodeSettings) => {
  return {
    width: settings.size,
    margin: settings.includeMargin ? 4 : 0,
    color: {
      dark: settings.foregroundColor,
      light: settings.backgroundColor
    },
    errorCorrectionLevel: settings.errorCorrectionLevel
  };
}; 