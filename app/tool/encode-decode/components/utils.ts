export type EncodingType = 
  | "base64" 
  | "url" 
  | "html" 
  | "hex" 
  | "binary" 
  | "morse" 
  | "rot13" 
  | "unicode";

export interface EncodingOption {
  id: EncodingType;
  name: string;
  description: string;
}

export const encodingOptions: EncodingOption[] = [
  { 
    id: "base64", 
    name: "Base64", 
    description: "Encode text to Base64 format or decode Base64 strings"
  },
  { 
    id: "url", 
    name: "URL", 
    description: "Encode/decode URL components for safe transmission in URLs"
  },
  { 
    id: "html", 
    name: "HTML", 
    description: "Convert special characters to HTML entities or decode them"
  },
  { 
    id: "hex", 
    name: "Hexadecimal", 
    description: "Convert text to hexadecimal representation or decode hex"
  },
  { 
    id: "binary", 
    name: "Binary", 
    description: "Convert text to binary representation or decode binary"
  },
  { 
    id: "morse", 
    name: "Morse Code", 
    description: "Translate text to Morse code or decode Morse code"
  },
  { 
    id: "rot13", 
    name: "ROT13", 
    description: "Simple letter substitution cipher that replaces a letter with the 13th letter after it"
  },
  { 
    id: "unicode", 
    name: "Unicode/ASCII", 
    description: "Convert text to Unicode code points or ASCII values"
  }
];

// Morse code mapping
const morseCodeMap: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
  '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.',
  ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-',
  '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
  ' ': '/'
};

// Reverse Morse code mapping for decoding
const reverseMorseCodeMap: Record<string, string> = {};
for (const [key, value] of Object.entries(morseCodeMap)) {
  reverseMorseCodeMap[value] = key;
}

export const encode = (text: string, type: EncodingType): string => {
  if (!text) return "";
  
  try {
    switch (type) {
      case "base64":
        return btoa(text);
      case "url":
        return encodeURIComponent(text);
      case "html":
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      case "hex":
        return Array.from(text)
          .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
          .join(' ');
      case "binary":
        return Array.from(text)
          .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
          .join(' ');
      case "morse":
        return text.toUpperCase()
          .split('')
          .map(char => morseCodeMap[char] || char)
          .join(' ');
      case "rot13":
        return text.replace(/[a-zA-Z]/g, char => {
          const code = char.charCodeAt(0);
          const isUpperCase = code >= 65 && code <= 90;
          const shift = isUpperCase ? 65 : 97;
          return String.fromCharCode(((code - shift + 13) % 26) + shift);
        });
      case "unicode":
        return Array.from(text)
          .map(char => `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`)
          .join(' ');
      default:
        return text;
    }
  } catch (error) {
    console.error(`Error encoding with ${type}:`, error);
    return `Error encoding with ${type}`;
  }
};

export const decode = (text: string, type: EncodingType): string => {
  if (!text) return "";
  
  try {
    switch (type) {
      case "base64":
        try {
          // Check if the string is valid base64 (ignoring whitespace)
          const cleanedText = text.replace(/\s/g, '');
          if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanedText)) {
            return "Error: Invalid Base64 string format";
          }
          return atob(cleanedText);
        } catch (error) {
          console.error("Base64 decode error:", error);
          return "Error: Invalid Base64 input - unable to decode";
        }
      case "url":
        return decodeURIComponent(text);
      case "html":
        const textarea = document.createElement("textarea");
        textarea.innerHTML = text;
        return textarea.value;
      case "hex":
        return text.split(/\s+/)
          .map(hex => String.fromCharCode(parseInt(hex, 16)))
          .join('');
      case "binary":
        return text.split(/\s+/)
          .map(binary => String.fromCharCode(parseInt(binary, 2)))
          .join('');
      case "morse":
        return text.split(/\s+/)
          .map(code => reverseMorseCodeMap[code] || code)
          .join('');
      case "rot13":
        return text.replace(/[a-zA-Z]/g, char => {
          const code = char.charCodeAt(0);
          const isUpperCase = code >= 65 && code <= 90;
          const shift = isUpperCase ? 65 : 97;
          return String.fromCharCode(((code - shift + 13) % 26) + shift);
        });
      case "unicode":
        return text.split(/\s+/)
          .map(code => {
            if (code.startsWith('U+')) {
              return String.fromCharCode(parseInt(code.slice(2), 16));
            }
            return code;
          })
          .join('');
      default:
        return text;
    }
  } catch (error) {
    console.error(`Error decoding with ${type}:`, error);
    return `Error decoding with ${type}`;
  }
};

// Detect the encoding type of input
export const detectEncoding = (text: string): EncodingType | null => {
  if (!text) return null;
  
  // Check for Base64
  if (/^[A-Za-z0-9+/=]+$/.test(text)) {
    try {
      const decoded = atob(text);
      // If we can decode it and the result contains printable characters
      if (/^[\x20-\x7E]+$/.test(decoded)) {
        return "base64";
      }
    } catch {}
  }
  
  // Check for URL encoding
  if (/%[0-9A-Fa-f]{2}/.test(text)) {
    try {
      decodeURIComponent(text);
      return "url";
    } catch {}
  }
  
  // Check for HTML entities
  if (/&[a-z]+;|&#\d+;/.test(text)) {
    return "html";
  }
  
  // Check for Hex
  if (/^([0-9A-Fa-f]{2}\s+)*[0-9A-Fa-f]{2}$/.test(text)) {
    return "hex";
  }
  
  // Check for Binary
  if (/^([01]{8}\s+)*[01]{8}$/.test(text)) {
    return "binary";
  }
  
  // Check for Morse code
  if (/^[.\-/\s]+$/.test(text)) {
    return "morse";
  }
  
  // Check for Unicode notation
  if (/^(U\+[0-9A-Fa-f]{4}\s+)*U\+[0-9A-Fa-f]{4}$/.test(text)) {
    return "unicode";
  }
  
  return null;
};

// Save operation to history
export interface HistoryItem {
  input: string;
  output: string;
  encodingType: EncodingType;
  operation: 'encode' | 'decode';
  timestamp: number;
}

export const getHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = localStorage.getItem('encode-decode-history');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

export const saveToHistory = (item: Omit<HistoryItem, 'timestamp'>) => {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getHistory();
    const newItem = { ...item, timestamp: Date.now() };
    
    // Limit history to 20 items
    const updatedHistory = [newItem, ...history].slice(0, 20);
    localStorage.setItem('encode-decode-history', JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

export const clearHistory = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('encode-decode-history');
};

// Get example text for each encoding type
export const getExampleText = (type: EncodingType): { original: string, encoded: string } => {
  const examples: Record<EncodingType, { original: string, encoded: string }> = {
    base64: {
      original: "Hello, World!",
      encoded: "SGVsbG8sIFdvcmxkIQ=="
    },
    url: {
      original: "https://example.com?param=value&name=Test User",
      encoded: "https%3A%2F%2Fexample.com%3Fparam%3Dvalue%26name%3DTest%20User"
    },
    html: {
      original: "<div>Hello & welcome</div>",
      encoded: "&lt;div&gt;Hello &amp; welcome&lt;/div&gt;"
    },
    hex: {
      original: "Hello",
      encoded: "48 65 6c 6c 6f"
    },
    binary: {
      original: "ABC",
      encoded: "01000001 01000010 01000011"
    },
    morse: {
      original: "SOS",
      encoded: "... --- ..."
    },
    rot13: {
      original: "Hello",
      encoded: "Uryyb"
    },
    unicode: {
      original: "ABC",
      encoded: "U+0041 U+0042 U+0043"
    }
  };
  
  return examples[type];
}; 