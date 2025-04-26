"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BoxShadowGenerator from "./BoxShadowGenerator";
import TextShadowGenerator from "./TextShadowGenerator";

export default function ShadowGenerator() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="box">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="box">Box Shadow</TabsTrigger>
          <TabsTrigger value="text">Text Shadow</TabsTrigger>
        </TabsList>
        
        <TabsContent value="box" className="mt-6">
          <BoxShadowGenerator />
        </TabsContent>
        
        <TabsContent value="text" className="mt-6">
          <TextShadowGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
} 