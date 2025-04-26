"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { QRCodeType, QR_TYPE_CONFIGS, UrlTypeConfig, ComplexTypeConfig } from './types';
import { QrCodeIcon } from "lucide-react";

interface DynamicFormProps {
  type: QRCodeType;
  onGenerateData: (data: string) => void;
  isGenerating: boolean;
}

// Type guards for different config types
const isUrlTypeConfig = (config: unknown): config is UrlTypeConfig => {
  return typeof config === 'object' && config !== null && 
    'validation' in config && 'errorMessage' in config;
};

const isComplexTypeConfig = (config: unknown): config is ComplexTypeConfig => {
  return typeof config === 'object' && config !== null && 
    'fields' in config && 'formatter' in config;
};

export function DynamicForm({ type, onGenerateData, isGenerating }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, string | boolean>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Reset form data when type changes
  useEffect(() => {
    setFormData({});
    setError(null);
  }, [type]);
  
  const typeConfig = QR_TYPE_CONFIGS[type];
  
  // For simple types (text, url)
  const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData({ value });
    
    // Validate URL if needed
    if (type === 'url' && value && isUrlTypeConfig(typeConfig)) {
      if (!typeConfig.validation(value)) {
        setError(typeConfig.errorMessage);
      } else {
        setError(null);
      }
    }
  };
  
  // For complex types with multiple fields
  const handleFieldChange = (fieldId: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  const handleSubmit = () => {
    try {
      let finalData = '';
      
      // For simple types (text, url)
      if (!isComplexTypeConfig(typeConfig)) {
        finalData = (formData.value as string) || '';
        
        // Validate URL if needed
        if (type === 'url' && isUrlTypeConfig(typeConfig) && !typeConfig.validation(finalData)) {
          setError(typeConfig.errorMessage);
          return;
        }
      } 
      // For complex types (wifi, contact, etc.)
      else if (isComplexTypeConfig(typeConfig)) {
        // Check required fields
        const missingRequired = typeConfig.fields
          .filter(field => field.required)
          .find(field => !formData[field.id]);
          
        if (missingRequired) {
          setError(`${missingRequired.label} is required`);
          return;
        }
        
        finalData = typeConfig.formatter(formData as Record<string, string>);
      }
      
      if (!finalData) {
        setError('Please fill in the required fields');
        return;
      }
      
      setError(null);
      onGenerateData(finalData);
    } catch (err) {
      console.error('Error generating QR data:', err);
      setError('Failed to generate QR code data');
    }
  };
  
  return (
    <Card>
      <CardContent className="py-4">
        <div className="space-y-4">
          {/* For simple types (text, url) */}
          {!isComplexTypeConfig(typeConfig) ? (
            <div className="space-y-2">
              {type === 'text' ? (
                <Textarea
                  placeholder={typeConfig.placeholder}
                  value={(formData.value as string) || ''}
                  onChange={handleSimpleChange}
                  className="font-mono min-h-[100px]"
                  maxLength={typeConfig.maxLength}
                />
              ) : (
                <Input
                  placeholder={typeConfig.placeholder}
                  value={(formData.value as string) || ''}
                  onChange={handleSimpleChange}
                  className="font-mono"
                  maxLength={typeConfig.maxLength}
                />
              )}
              {typeConfig.maxLength && (
                <p className="text-xs text-right text-muted-foreground">
                  {((formData.value as string)?.length || 0)}/{typeConfig.maxLength} characters
                </p>
              )}
            </div>
          ) : (
            /* For complex types with multiple fields */
            <div className="space-y-4">
              {typeConfig.fields.map(field => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  
                  {field.type === 'checkbox' ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={!!formData[field.id]}
                        onCheckedChange={(checked) => 
                          handleFieldChange(field.id, Boolean(checked))
                        }
                      />
                      <label 
                        htmlFor={field.id} 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {field.label}
                      </label>
                    </div>
                  ) : field.type === 'select' ? (
                    <Select
                      value={(formData[field.id] as string) || ''}
                      onValueChange={(value) => handleFieldChange(field.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.multiline ? (
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      value={(formData[field.id] as string) || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="font-mono"
                    />
                  ) : (
                    <Input
                      id={field.id}
                      placeholder={field.placeholder}
                      type={field.type || 'text'}
                      value={(formData[field.id] as string) || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="font-mono"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          
          <Button 
            onClick={handleSubmit} 
            disabled={isGenerating} 
            className="w-full"
          >
            <QrCodeIcon className="h-4 w-4 mr-2" />
            Generate QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 