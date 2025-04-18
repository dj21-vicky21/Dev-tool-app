"use client";

import React, { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, QrCodeIcon } from "lucide-react";
import QRCode from "qrcode";
import { useToast } from "@/hooks/use-toast";

function QrGenerator() {
  const [isQrGenerated, setIsQrGenerated] = useState<boolean>(false);
  const convasRef = useRef<HTMLCanvasElement>(null)
  const [userInput, setUserInput] = useState<string>("");
  const { toast } = useToast();

  const handleGenerateQRCode = () => {
    try {

      QRCode.toCanvas(convasRef.current, userInput,{version: 9 , errorCorrectionLevel:"L", scale:7} ,function (error) {
        console.log(userInput)
        if (error) throw error
        console.log('success!');
        setIsQrGenerated(true)
      })

    } catch (error) {
      console.log(error);
      toast({
        title: "Failed",
        description: "Max character limit of 230 exceeded!",
        variant: "destructive"
      })
    }
  };

   // Function to handle the download of the QR code as an image
   const handleDownloadQRCode = () => {
    if (convasRef.current) {
      const imageUrl = convasRef.current.toDataURL("image/png"); 
      const link = document.createElement("a"); 
      link.href = imageUrl; 
      link.download = "qrcode.png";
      link.click(); 
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Easily generate secure, custom QR codes for URLs, text, or any data
          you need.
        </p>
      </div>

      <Card>
        <CardContent className="py-6 px-3">
          <div className="flex gap-2">
            <Input
              max={230}
              onChange={(e) => setUserInput(e.target.value)}
              className="font-mono"
              placeholder="Enter data to generate QR code"
            />
            <Button variant="outline" size="icon" disabled={!userInput} onClick={handleGenerateQRCode}>
              <QrCodeIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={!isQrGenerated} onClick={handleDownloadQRCode}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6 px-3">
        <div className="flex gap-2 items-center justify-center" id="container">
             <canvas ref={convasRef} id="canvas" 
              style={{ width: '250px', height: '250px' }}  />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QrGenerator;
