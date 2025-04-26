import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings2, Upload } from 'lucide-react';
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
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image and not too large
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    if (file.size > 1024 * 100) { // 100KB limit
      alert('Logo must be less than 100KB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      onSettingsChange({ logoUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };
  
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
            
            <div className="grid gap-2">
              <Label>Logo (optional)</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild className="flex items-center gap-2">
                  <label>
                    <Upload className="h-4 w-4" />
                    <span>Upload Logo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                    />
                  </label>
                </Button>
                {settings.logoUrl && (
                  <Button 
                    variant="outline" 
                    onClick={() => onSettingsChange({ logoUrl: undefined })}
                    size="sm"
                  >
                    Remove
                  </Button>
                )}
              </div>
              {settings.logoUrl && (
                <div className="mt-2 border rounded p-2 flex justify-center">
                  <img 
                    src={settings.logoUrl} 
                    alt="Logo preview" 
                    className="max-h-16 max-w-full object-contain" 
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                For best results, use a small, simple logo with high contrast.
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 