import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRCodeSettings } from './types';

interface QRSettingsProps {
  settings: QRCodeSettings;
  onSettingsChange: (settings: Partial<QRCodeSettings>) => void;
}

export function QRSettings({ settings, onSettingsChange }: QRSettingsProps) {
  
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="settings">
        <AccordionTrigger className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          <span>Customize QR Code</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="fgColor">Foreground Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="fgColor"
                  type="color"
                  value={settings.foregroundColor}
                  onChange={(e) => onSettingsChange({ foregroundColor: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={settings.foregroundColor}
                  onChange={(e) => onSettingsChange({ foregroundColor: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bgColor">Background Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="bgColor"
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => onSettingsChange({ backgroundColor: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={settings.backgroundColor}
                  onChange={(e) => onSettingsChange({ backgroundColor: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="size">Size: {settings.size}px</Label>
              <Slider
                id="size"
                min={128}
                max={512}
                step={8}
                value={[settings.size]}
                onValueChange={([size]) => onSettingsChange({ size })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="errorLevel">Error Correction Level</Label>
              <Select
                value={settings.errorCorrectionLevel}
                onValueChange={(value) => 
                  onSettingsChange({ 
                    errorCorrectionLevel: value as 'L' | 'M' | 'Q' | 'H' 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low (7%)</SelectItem>
                  <SelectItem value="M">Medium (15%)</SelectItem>
                  <SelectItem value="Q">Quartile (25%)</SelectItem>
                  <SelectItem value="H">High (30%)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Higher correction levels make QR codes more resistant to damage but increase complexity.
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 