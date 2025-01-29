"use client";
import { HSL, RGB } from "@/lib/types";
import useColorConvertorStore from "@/store/colorConvertor";
import { useState, useEffect } from "react";
import ColorPicker, { useColorPicker } from "react-best-gradient-color-picker";

interface ColorSelectorProps {
  handleOnchangeColor: (hex: string, rgb: RGB, hsl: HSL) => void;
}

const ColorSelector = ({ handleOnchangeColor }: ColorSelectorProps) => {
  const [isClient, setIsClient] = useState(false); 

  const { color, setColor } = useColorConvertorStore();
  const { hslArr, valueToHex, rgbaArr } = useColorPicker(color, setColor);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const hex = valueToHex();
    const rgb = { r: rgbaArr[0], g: rgbaArr[1], b: rgbaArr[2] };
    const hsl = {
      h: Math.round(hslArr[0] * 100),
      s: Math.round(hslArr[1] * 100),
      l: Math.round(hslArr[2] * 100),
    };
    handleOnchangeColor(hex, rgb, hsl);
  }, [color]);

  if (!isClient) {
    return null; // Optionally show a loading spinner here while waiting for the client render
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ColorPicker
        className={"w-full"}
        value={color}
        onChange={setColor}
        hideAdvancedSliders
        hideColorGuide
        hideColorTypeBtns
        hideControls
        hideEyeDrop
        hideGradientAngle
        hideGradientControls
        hideGradientStop
        hideGradientType
        hideInputType
        hideInputs
        hidePresets
      />
    </div>
  );
};

export default ColorSelector;
