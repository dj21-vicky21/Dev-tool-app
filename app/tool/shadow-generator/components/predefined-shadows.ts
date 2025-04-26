export interface PredefinedShadow {
  name: string;
  type: 'box' | 'text';
  css: string;
  params: {
    horizontalOffset: number;
    verticalOffset: number;
    blur: number;
    spread?: number;
    color: string;
    opacity: number;
    inset?: boolean;
  };
}

export const predefinedBoxShadows: PredefinedShadow[] = [
  {
    name: "Soft Shadow",
    type: "box",
    css: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 2,
      blur: 4,
      spread: 0,
      color: "#000000",
      opacity: 0.1,
      inset: false
    }
  },
  {
    name: "Material Design",
    type: "box",
    css: "0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 3,
      blur: 6,
      spread: 0,
      color: "#000000",
      opacity: 0.16,
      inset: false
    }
  },
  {
    name: "Inset Shadow",
    type: "box",
    css: "inset 0px 2px 4px rgba(0, 0, 0, 0.25)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 2,
      blur: 4,
      spread: 0,
      color: "#000000",
      opacity: 0.25,
      inset: true
    }
  },
  {
    name: "Floating Card",
    type: "box",
    css: "0px 10px 20px rgba(0, 0, 0, 0.1)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 10,
      blur: 20,
      spread: 0,
      color: "#000000",
      opacity: 0.1,
      inset: false
    }
  },
  {
    name: "Harsh Shadow",
    type: "box",
    css: "5px 5px 0px rgba(0, 0, 0, 0.75)",
    params: {
      horizontalOffset: 5,
      verticalOffset: 5,
      blur: 0,
      spread: 0,
      color: "#000000",
      opacity: 0.75,
      inset: false
    }
  },
  {
    name: "Layered Shadow",
    type: "box",
    css: "0px 1px 1px rgba(0, 0, 0, 0.12), 0px 2px 2px rgba(0, 0, 0, 0.12), 0px 4px 4px rgba(0, 0, 0, 0.12), 0px 8px 8px rgba(0, 0, 0, 0.12)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 4,
      blur: 8,
      spread: 0,
      color: "#000000",
      opacity: 0.12,
      inset: false
    }
  },
  {
    name: "Neon Glow",
    type: "box",
    css: "0px 0px 10px rgba(0, 255, 255, 0.7)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 0,
      blur: 10,
      spread: 0,
      color: "#00ffff",
      opacity: 0.7,
      inset: false
    }
  },
  {
    name: "Bottom Shadow",
    type: "box",
    css: "0px 8px 6px -6px rgba(0, 0, 0, 0.5)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 8,
      blur: 6,
      spread: -6,
      color: "#000000",
      opacity: 0.5,
      inset: false
    }
  },
  {
    name: "Perspective Shadow",
    type: "box",
    css: "5px 10px 15px rgba(0, 0, 0, 0.3)",
    params: {
      horizontalOffset: 5,
      verticalOffset: 10,
      blur: 15,
      spread: 0,
      color: "#000000",
      opacity: 0.3,
      inset: false
    }
  },
  {
    name: "Soft Spread",
    type: "box",
    css: "0px 0px 8px 4px rgba(0, 0, 0, 0.15)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 0,
      blur: 8,
      spread: 4,
      color: "#000000",
      opacity: 0.15,
      inset: false
    }
  },
  {
    name: "Sharp Edge",
    type: "box",
    css: "5px 5px 0px 0px rgba(0, 0, 0, 0.75)",
    params: {
      horizontalOffset: 5,
      verticalOffset: 5,
      blur: 0,
      spread: 0,
      color: "#000000",
      opacity: 0.75,
      inset: false
    }
  },
  {
    name: "3D Button",
    type: "box",
    css: "0px 5px 0px rgba(0, 0, 0, 0.5)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 5,
      blur: 0,
      spread: 0,
      color: "#000000",
      opacity: 0.5,
      inset: false
    }
  },
  {
    name: "Embossed",
    type: "box",
    css: "inset 2px 2px 5px rgba(154, 147, 140, 0.5), 1px 1px 5px rgba(255, 255, 255, 1)",
    params: {
      horizontalOffset: 2,
      verticalOffset: 2,
      blur: 5,
      spread: 0,
      color: "#9a938c",
      opacity: 0.5,
      inset: true
    }
  },
  {
    name: "Candy Button",
    type: "box",
    css: "0px 8px 20px rgba(255, 105, 180, 0.5)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 8,
      blur: 20,
      spread: 0,
      color: "#ff69b4",
      opacity: 0.5,
      inset: false
    }
  },
  {
    name: "Subtle Card",
    type: "box",
    css: "0px 1px 3px rgba(0, 0, 0, 0.12)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 1,
      blur: 3,
      spread: 0,
      color: "#000000",
      opacity: 0.12,
      inset: false
    }
  },
  {
    name: "Colored Shadow",
    type: "box",
    css: "5px 5px 15px rgba(75, 0, 130, 0.5)",
    params: {
      horizontalOffset: 5,
      verticalOffset: 5,
      blur: 15,
      spread: 0,
      color: "#4b0082",
      opacity: 0.5,
      inset: false
    }
  },
  {
    name: "Double-sided Shadow",
    type: "box",
    css: "5px 5px 10px rgba(0, 0, 0, 0.25), -5px -5px 10px rgba(255, 255, 255, 0.25)",
    params: {
      horizontalOffset: 5,
      verticalOffset: 5,
      blur: 10,
      spread: 0,
      color: "#000000",
      opacity: 0.25,
      inset: false
    }
  },
  {
    name: "Neomorphism",
    type: "box",
    css: "20px 20px 60px rgba(0, 0, 0, 0.1), -20px -20px 60px rgba(255, 255, 255, 0.1)",
    params: {
      horizontalOffset: 20,
      verticalOffset: 20,
      blur: 60,
      spread: 0,
      color: "#000000",
      opacity: 0.1,
      inset: false
    }
  },
  {
    name: "Floating Button",
    type: "box",
    css: "0px 4px 6px rgba(50, 50, 93, 0.11), 0px 1px 3px rgba(0, 0, 0, 0.08)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 4,
      blur: 6,
      spread: 0,
      color: "#32325d",
      opacity: 0.11,
      inset: false
    }
  },
  {
    name: "Deep Shadow",
    type: "box",
    css: "0px 10px 50px rgba(0, 0, 0, 0.3)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 10,
      blur: 50,
      spread: 0,
      color: "#000000",
      opacity: 0.3,
      inset: false
    }
  },
  {
    name: "Angled Shadow",
    type: "box",
    css: "10px 10px 20px rgba(0, 0, 0, 0.19)",
    params: {
      horizontalOffset: 10,
      verticalOffset: 10,
      blur: 20,
      spread: 0,
      color: "#000000",
      opacity: 0.19,
      inset: false
    }
  },
  {
    name: "Distant Light",
    type: "box",
    css: "0px 15px 35px rgba(50, 50, 93, 0.1), 0px 5px 15px rgba(0, 0, 0, 0.07)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 15,
      blur: 35,
      spread: 0,
      color: "#32325d",
      opacity: 0.1,
      inset: false
    }
  },
  {
    name: "Subtle Glow",
    type: "box",
    css: "0px 0px 15px rgba(0, 0, 255, 0.3)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 0,
      blur: 15,
      spread: 0,
      color: "#0000ff",
      opacity: 0.3,
      inset: false
    }
  },
  {
    name: "Modal Shadow",
    type: "box",
    css: "0px 25px 50px -12px rgba(0, 0, 0, 0.25)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 25,
      blur: 50,
      spread: -12,
      color: "#000000",
      opacity: 0.25,
      inset: false
    }
  }
];

export const predefinedTextShadows: PredefinedShadow[] = [
  {
    name: "Subtle Text",
    type: "text",
    css: "1px 1px 1px rgba(0, 0, 0, 0.3)",
    params: {
      horizontalOffset: 1,
      verticalOffset: 1,
      blur: 1,
      color: "#000000",
      opacity: 0.3
    }
  },
  {
    name: "Crisp Shadow",
    type: "text",
    css: "2px 2px 0px rgba(0, 0, 0, 0.8)",
    params: {
      horizontalOffset: 2,
      verticalOffset: 2,
      blur: 0,
      color: "#000000",
      opacity: 0.8
    }
  },
  {
    name: "Neon Text",
    type: "text",
    css: "0px 0px 10px rgba(255, 0, 255, 0.8)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 0,
      blur: 10,
      color: "#ff00ff",
      opacity:.8
    }
  },
  {
    name: "3D Text",
    type: "text",
    css: "1px 1px 0px #444, 2px 2px 0px #444, 3px 3px 0px #444",
    params: {
      horizontalOffset: 2,
      verticalOffset: 2,
      blur: 0,
      color: "#444444",
      opacity: 1
    }
  },
  {
    name: "Letterpress",
    type: "text",
    css: "0px -1px 0px rgba(0, 0, 0, 0.3)",
    params: {
      horizontalOffset: 0,
      verticalOffset: -1,
      blur: 0,
      color: "#000000",
      opacity: 0.3
    }
  },
  {
    name: "Glow Effect",
    type: "text",
    css: "0px 0px 5px rgba(255, 255, 255, 0.8)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 0,
      blur: 5,
      color: "#ffffff",
      opacity: 0.8
    }
  },
  {
    name: "Multiple Shadow",
    type: "text",
    css: "2px 2px 5px rgba(0, 0, 0, 0.4), 4px 4px 10px rgba(0, 0, 0, 0.3)",
    params: {
      horizontalOffset: 3,
      verticalOffset: 3,
      blur: 7,
      color: "#000000",
      opacity: 0.35
    }
  },
  {
    name: "Retro Text",
    type: "text",
    css: "3px 3px 0px rgba(206, 89, 55, 0.7)",
    params: {
      horizontalOffset: 3,
      verticalOffset: 3,
      blur: 0,
      color: "#ce5937",
      opacity: 0.7
    }
  },
  {
    name: "Hard Shadow",
    type: "text",
    css: "6px 6px 0px rgba(0, 0, 0, 0.4)",
    params: {
      horizontalOffset: 6,
      verticalOffset: 6,
      blur: 0,
      color: "#000000",
      opacity: 0.4
    }
  },
  {
    name: "Blurred Text",
    type: "text",
    css: "0px 0px 8px rgba(0, 0, 0, 0.6)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 0,
      blur: 8,
      color: "#000000",
      opacity: 0.6
    }
  },
  {
    name: "Pop Out",
    type: "text",
    css: "1px 1px 2px rgba(0, 0, 0, 0.5), -1px -1px 2px rgba(255, 255, 255, 0.5)",
    params: {
      horizontalOffset: 1,
      verticalOffset: 1,
      blur: 2,
      color: "#000000",
      opacity: 0.5
    }
  },
  {
    name: "Fire Text",
    type: "text",
    css: "0px 0px 4px rgba(255, 100, 0, 0.6), 0px 0px 8px rgba(255, 165, 0, 0.8)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 0,
      blur: 6,
      color: "#ff6400",
      opacity: 0.7
    }
  },
  {
    name: "Comic Style",
    type: "text",
    css: "-1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000",
    params: {
      horizontalOffset: 1,
      verticalOffset: 1,
      blur: 0,
      color: "#000000",
      opacity: 1
    }
  },
  {
    name: "Ice Text",
    type: "text",
    css: "0px 0px 8px rgba(0, 191, 255, 0.7)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 0,
      blur: 8,
      color: "#00bfff",
      opacity: 0.7
    }
  },
  {
    name: "Vintage Text",
    type: "text",
    css: "2px 2px 0px rgba(139, 69, 19, 0.8)",
    params: {
      horizontalOffset: 2,
      verticalOffset: 2,
      blur: 0,
      color: "#8b4513",
      opacity: 0.8
    }
  },
  {
    name: "Faded Text",
    type: "text",
    css: "3px 3px 3px rgba(0, 0, 0, 0.2)",
    params: {
      horizontalOffset: 3,
      verticalOffset: 3,
      blur: 3,
      color: "#000000",
      opacity: 0.2
    }
  },
  {
    name: "Elegant Text",
    type: "text",
    css: "1px 1px 2px rgba(0, 0, 0, 0.3)",
    params: {
      horizontalOffset: 1,
      verticalOffset: 1,
      blur: 2,
      color: "#000000",
      opacity: 0.3
    }
  },
  {
    name: "Embossed Text",
    type: "text",
    css: "-1px -1px 1px rgba(255, 255, 255, 0.5), 1px 1px 1px rgba(0, 0, 0, 0.3)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 0,
      blur: 1,
      color: "#000000",
      opacity: 0.3
    }
  },
  {
    name: "Outline Text",
    type: "text",
    css: "-1px -1px 0px rgba(0, 0, 0, 0.8), 1px -1px 0px rgba(0, 0, 0, 0.8), -1px 1px 0px rgba(0, 0, 0, 0.8), 1px 1px 0px rgba(0, 0, 0, 0.8)",
    params: {
      horizontalOffset: 0,
      verticalOffset: 0,
      blur: 0,
      color: "#000000",
      opacity: 0.8
    }
  },
  {
    name: "Glitch Text",
    type: "text",
    css: "2px 0px 0px rgba(255, 0, 0, 0.5), -2px 0px 0px rgba(0, 255, 255, 0.5)",
    params: {
      horizontalOffset: 2,
      verticalOffset: 0,
      blur: 0,
      color: "#ff0000",
      opacity: 0.5
    }
  }
];

// Utility function to generate random parameters
export const generateRandomBoxShadow = () => {
  return {
    horizontalOffset: Math.floor(Math.random() * 20) - 10,
    verticalOffset: Math.floor(Math.random() * 20) - 5,
    blur: Math.floor(Math.random() * 30),
    spread: Math.floor(Math.random() * 15) - 5,
    color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
    opacity: Math.round((Math.random() * 0.7 + 0.1) * 100) / 100,
    inset: Math.random() > 0.8
  };
};

export const generateRandomTextShadow = () => {
  return {
    horizontalOffset: Math.floor(Math.random() * 8) - 4,
    verticalOffset: Math.floor(Math.random() * 8) - 4,
    blur: Math.floor(Math.random() * 10),
    color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
    opacity: Math.round((Math.random() * 0.7 + 0.1) * 100) / 100
  };
}; 