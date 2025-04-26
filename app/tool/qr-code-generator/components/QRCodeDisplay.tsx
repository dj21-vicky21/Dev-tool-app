"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { QRCodeSettings } from './types';

interface QRCodeDisplayProps {
  data: string;
  settings: QRCodeSettings;
  isGenerating: boolean;
}

export function QRCodeDisplay({ data, settings, isGenerating }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!data || !canvasRef.current || isGenerating) return;
    
    const generateQR = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Clear the canvas first
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Generate the QR code
        await QRCode.toCanvas(canvas, data, {
          width: settings.size,
          margin: settings.includeMargin ? 4 : 0,
          color: {
            dark: settings.foregroundColor,
            light: settings.backgroundColor
          },
          errorCorrectionLevel: settings.errorCorrectionLevel
        });
        
        // Add logo if provided
        if (settings.logoUrl && ctx) {
          const logoSize = Math.floor(settings.size * 0.2); // Logo size 20% of QR code
          const centerX = Math.floor(settings.size / 2 - logoSize / 2);
          const centerY = Math.floor(settings.size / 2 - logoSize / 2);
          
          const logo = new Image();
          logo.onload = () => {
            // Draw white background for the logo
            ctx.fillStyle = settings.backgroundColor;
            ctx.fillRect(centerX, centerY, logoSize, logoSize);
            
            // Draw the logo
            ctx.drawImage(logo, centerX, centerY, logoSize, logoSize);
            
            // Update data URL for downloads
            setQrDataUrl(canvas.toDataURL('image/png'));
          };
          logo.src = settings.logoUrl;
        } else {
          setQrDataUrl(canvas.toDataURL('image/png'));
        }
      } catch (error) {
        console.error('Error generating QR code:', error);
        toast({
          title: "QR Generation Failed",
          description: "Failed to generate QR code. Please check your input.",
          variant: "destructive"
        });
      }
    };
    
    generateQR();
  }, [data, settings, isGenerating, toast]);
  
  const handleDownload = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qrcode-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded",
      description: "QR code saved as PNG image"
    });
  };
  
  const handleShare = async () => {
    if (!qrDataUrl) return;
    
    try {
      // Convert data URL to Blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'QR Code',
            files: [new File([blob], 'qrcode.png', { type: 'image/png' })]
          });
          toast({
            title: "Shared",
            description: "QR code shared successfully"
          });
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Error sharing:', error);
            // Fall back to download if sharing fails
            handleDownload();
          }
        }
      } else {
        // If Web Share API is not supported, fall back to download
        handleDownload();
      }
    } catch (error) {
      console.error('Error preparing share:', error);
      toast({
        title: "Share failed",
        description: "Could not prepare QR code for sharing",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card>
      <CardContent className="py-6 px-3 flex flex-col items-center">
        <div className="relative mb-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          {isGenerating ? (
            <div className="flex items-center justify-center" style={{ width: settings.size, height: settings.size }}>
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <canvas 
              ref={canvasRef} 
              width={settings.size} 
              height={settings.size} 
              className="max-w-full object-contain rounded"
            />
          )}
        </div>
        
        <div className="flex gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            disabled={!qrDataUrl || isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            disabled={!qrDataUrl || isGenerating}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 