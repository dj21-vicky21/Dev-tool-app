export type QRCodeType = 'text' | 'url' | 'wifi' | 'contact' | 'email' | 'sms';

export interface QRCodeSettings {
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  size: number;
  includeMargin: boolean;
  logoUrl?: string;
}


export const DEFAULT_QR_SETTINGS: QRCodeSettings = {
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  size: 250,
  includeMargin: true,
};

export interface Field {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  options?: string[];
}

export interface TextTypeConfig {
  label: string;
  placeholder: string;
  icon: string;
  maxLength: number;
}

export interface UrlTypeConfig extends TextTypeConfig {
  validation: (value: string) => boolean;
  errorMessage: string;
}

export interface ComplexTypeConfig {
  label: string;
  icon: string;
  fields: Field[];
  formatter: (data: Record<string, string>) => string;
}

export type TypeConfig = TextTypeConfig | UrlTypeConfig | ComplexTypeConfig;

export const QR_TYPE_CONFIGS: Record<QRCodeType, TypeConfig> = {
  text: {
    label: 'Text',
    placeholder: 'Enter any text to encode',
    icon: 'FileText',
    maxLength: 300,
  },
  url: {
    label: 'URL',
    placeholder: 'https://example.com',
    icon: 'Globe',
    maxLength: 300,
    validation: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    errorMessage: 'Please enter a valid URL',
  },
  wifi: {
    label: 'WiFi',
    icon: 'Wifi',
    fields: [
      { id: 'ssid', label: 'Network Name (SSID)', placeholder: 'Network name', required: true },
      { id: 'password', label: 'Password', placeholder: 'Password', type: 'password' },
      { id: 'encryption', label: 'Encryption', type: 'select', options: ['WPA/WPA2', 'WEP', 'None'] },
      { id: 'hidden', label: 'Hidden Network', type: 'checkbox' }
    ],
    formatter: (data: Record<string, string>) => {
      const { ssid, password, encryption, hidden } = data;
      let encType = 'nopass';
      if (encryption === 'WPA/WPA2') encType = 'WPA';
      if (encryption === 'WEP') encType = 'WEP';

      return `WIFI:S:${ssid};T:${encType};P:${password || ''};H:${hidden ? 'true' : 'false'};;`;
    }
  },
  contact: {
    label: 'Contact',
    icon: 'Contact',
    fields: [
      { id: 'name', label: 'Name', placeholder: 'Full name', required: true },
      { id: 'email', label: 'Email', placeholder: 'email@example.com' },
      { id: 'phone', label: 'Phone', placeholder: '+1234567890' },
      { id: 'company', label: 'Company', placeholder: 'Company name' },
      { id: 'title', label: 'Job Title', placeholder: 'Job title' },
      { id: 'url', label: 'Website', placeholder: 'https://example.com' },
      { id: 'address', label: 'Address', placeholder: 'Street, City, State, ZIP' },
    ],
    formatter: (data: Record<string, string>) => {
      const { name, email, phone, company, title, url, address } = data;
      let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
      if (name) vcard += `N:${name}\nFN:${name}\n`;
      if (company) vcard += `ORG:${company}\n`;
      if (title) vcard += `TITLE:${title}\n`;
      if (phone) vcard += `TEL:${phone}\n`;
      if (email) vcard += `EMAIL:${email}\n`;
      if (url) vcard += `URL:${url}\n`;
      if (address) vcard += `ADR:;;${address};;;\n`;
      vcard += 'END:VCARD';
      return vcard;
    }
  },
  email: {
    label: 'Email',
    icon: 'Mail',
    fields: [
      { id: 'email', label: 'Email Address', placeholder: 'recipient@example.com', required: true },
      { id: 'subject', label: 'Subject', placeholder: 'Email subject' },
      { id: 'body', label: 'Body', placeholder: 'Email content', multiline: true }
    ],
    formatter: (data: Record<string, string>) => {
      const { email, subject, body } = data;
      let mailtoStr = `mailto:${email}`;
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (body) params.append('body', body);
      
      const paramsStr = params.toString();
      if (paramsStr) mailtoStr += `?${paramsStr}`;
      
      return mailtoStr;
    }
  },
  sms: {
    label: 'SMS',
    icon: 'MessageSquare',
    fields: [
      { id: 'phone', label: 'Phone Number', placeholder: '+1234567890', required: true },
      { id: 'message', label: 'Message', placeholder: 'Your message', multiline: true }
    ],
    formatter: (data: Record<string, string>) => {
      const { phone, message } = data;
      let smsStr = `smsto:${phone}`;
      if (message) smsStr += `:${message}`;
      return smsStr;
    }
  }
}; 