"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ColorPicker from "./components/ColorPicker";
import ColorSchemes from "./components/ColorSchemes";
import useColorConvertorStore from "@/store/colorConvertor";
import { Palette, PaintBucket } from "lucide-react";

export default function ColorConverter() {
  const { color } = useColorConvertorStore();
  const [isClient, setIsClient] = useState(false);

  // For SSR compatibility
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="p-6">
        <div className="h-[500px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Loading color converter...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col space-y-1.5 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Color Converter</h2>
        <p className="text-muted-foreground">
          Convert, visualize, and explore colors in different formats including HEX, RGB, HSL, CMYK, and more.
        </p>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="picker" className="w-full">
          <TabsList>
            <TabsTrigger value="picker" className="flex items-center gap-1.5">
              <PaintBucket className="h-4 w-4" />
              <span>Color Picker</span>
            </TabsTrigger>
            <TabsTrigger value="schemes" className="flex items-center gap-1.5">
              <Palette className="h-4 w-4" />
              <span>Color Schemes</span>
            </TabsTrigger>
            {/* <TabsTrigger value="eyedropper" className="flex items-center gap-1.5">
              <Pipette className="h-4 w-4" />
              <span>Extract Colors</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="picker" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pick a Color</CardTitle>
                <CardDescription>
                  Choose and adjust colors in different formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ColorPicker />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Color Harmonies & Analysis</CardTitle>
                <CardDescription>
                  Explore color schemes, variations, and accessibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ColorSchemes currentColor={color} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schemes" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Schemes & Palettes</CardTitle>
                <CardDescription>
                  Generate and explore color harmonies and palettes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ColorSchemes currentColor={color} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="eyedropper" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Extractor</CardTitle>
                <CardDescription>
                  Extract colors from images and websites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    Color extraction feature coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Color History & Favorites</CardTitle>
                <CardDescription>
                  Your recently used colors and saved palettes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    Color history and favorites feature coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  );
}
