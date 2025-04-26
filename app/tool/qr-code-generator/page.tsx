"use client";

import React, { useState } from "react";
import { TabSelector } from "./components/TabSelector";
import { DynamicForm } from "./components/DynamicForm";
import { QRSettings } from "./components/QRSettings";
import { QRCodeDisplay } from "./components/QRCodeDisplay";
import { 
  QRCodeType, 
  QRCodeSettings, 
  DEFAULT_QR_SETTINGS 
} from "./components/types";


export default function QrGenerator() {
  // State for QR code data and settings
  const [activeTab, setActiveTab] = useState<QRCodeType>("text");
  const [qrData, setQrData] = useState<string>("");
  const [settings, setSettings] = useState<QRCodeSettings>(DEFAULT_QR_SETTINGS);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  

  
  // Handle QR code generation
  const handleGenerateQR = (data: string) => {
    setIsGenerating(true);
    setQrData("");
    
    // Small delay to allow for loading state to show
    setTimeout(() => {
      setQrData(data);
      setIsGenerating(false);
    }, 300);
  };
  
  // Handle settings changes
  const handleSettingsChange = (newSettings: Partial<QRCodeSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };
  

  

  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Create customized QR codes for various uses with advanced styling options
        </p>
        
      </div>
      
      <div className="space-y-6">
        <TabSelector activeTab={activeTab} onChange={setActiveTab} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <DynamicForm 
              type={activeTab}
              onGenerateData={handleGenerateQR}
              isGenerating={isGenerating}
            />
            
            <QRSettings 
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          </div>
          
          <QRCodeDisplay 
            data={qrData} 
            settings={settings}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}
