import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeType, QR_TYPE_CONFIGS } from './types';
import { FileText, Globe, Wifi, Contact, Mail, MessageSquare } from 'lucide-react';

interface TabSelectorProps {
  activeTab: QRCodeType;
  onChange: (tab: QRCodeType) => void;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'FileText': return <FileText className="h-4 w-4 mr-2" />;
    case 'Globe': return <Globe className="h-4 w-4 mr-2" />;
    case 'Wifi': return <Wifi className="h-4 w-4 mr-2" />;
    case 'Contact': return <Contact className="h-4 w-4 mr-2" />;
    case 'Mail': return <Mail className="h-4 w-4 mr-2" />;
    case 'MessageSquare': return <MessageSquare className="h-4 w-4 mr-2" />;
    default: return <FileText className="h-4 w-4 mr-2" />;
  }
};

export function TabSelector({ activeTab, onChange }: TabSelectorProps) {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(value) => onChange(value as QRCodeType)}
      className="w-full"
    >
      <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full h-fit">
        {Object.entries(QR_TYPE_CONFIGS).map(([type, config]) => (
          <TabsTrigger 
            key={type} 
            value={type}
            className="flex items-center justify-center"
          >
            {getIconComponent(config.icon)}
            <span className="hidden md:inline">{config.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
} 