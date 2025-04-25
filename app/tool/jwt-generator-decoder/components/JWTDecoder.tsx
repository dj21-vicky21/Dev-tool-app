"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Eye, Copy, Calendar, Clock, AlertCircle, Check, CheckCircle2, XCircle, Code, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { verifyJWT, getExpirationTime, formatTimestamp, generateJWT, getAlgorithmOptions, getTokenTemplates } from "../utils/jwt-service";
import type { DecodedJWT, JWTEncodeOptions } from "../utils/jwt-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function JWTDecoderComponent() {
  const [token, setToken] = useState<string>("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzQ1NjA4OTI1LCJleHAiOjE3NDgxOTgyNTh9.ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnpkV0lpT2lJeE1qTTBOVFkzT0Rrd0lpd2libUZ0WlNJNklrcHZhRzRnUkc5bElpd2lhV0YwSWpveE56UTFOakE0T1RJMUxDSmxlSEFpT2pFM05EZ3hPVGd5TlRoOS55b3VyLTI1Ni1iaXQtc2VjcmV0");
  const [secret, setSecret] = useState<string>("your-256-bit-secret");
  const [decodedData, setDecodedData] = useState<DecodedJWT | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [activeTab, setActiveTab] = useState("decoded");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"decode" | "generate">("decode");
  const [payloadJson, setPayloadJson] = useState<string>(JSON.stringify({
    sub: "1234567890",
    name: "John Doe",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  }, null, 2));
  const [algorithm, setAlgorithm] = useState<string>("HS256");
  const [expiresIn, setExpiresIn] = useState<string>("1h");
  const [generatedToken, setGeneratedToken] = useState<string>("");
  const { toast } = useToast();

  // Handle decode
  const handleDecode = () => {
    try {
      // Split the token and decode
      const [header, payload, signature] = token.split('.');
      const decodedHeader = JSON.parse(atob(header));
      const decodedPayload = JSON.parse(atob(payload));

      // Set state variables
      setDecodedData({
        header: decodedHeader,
        payload: decodedPayload,
        signature: signature,
        isValid: false,
        expirationStatus: "no-expiry"
      });
      setVerificationResult(null); // Reset verification
      
      // Check expiration
      const exp = decodedPayload.exp;
      if (exp) {
        const expDate = new Date(exp * 1000);
        const isExpired = expDate < new Date();
        setDecodedData(prevData => ({
          ...prevData!,
          payload: {
            ...prevData!.payload,
            expirationStatus: isExpired ? 'expired' : 'valid'
          }
        }));
      } else {
        setDecodedData(prevData => ({
          ...prevData!,
          payload: {
            ...prevData!.payload,
            expirationStatus: "no-expiry"
          }
        }));
      }
      
      // Success toast
      toast({
        title: "JWT Decoded Successfully",
        description: "The JWT token has been decoded successfully.",
        variant: "default",
      });
    } catch (err) {
      // Reset state on error
      setDecodedData(null);
      setVerificationResult({
        valid: false,
        error: "Invalid JWT format"
      });
      
      // Error toast with specific error message
      const errorMessage = err instanceof Error ? err.message : "Invalid token format";
      toast({
        title: "Invalid JWT Token",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle verify
  const handleVerify = () => {
    if (!token.trim()) {
      toast({
        title: "Error",
        description: "Please enter a JWT token",
        variant: "destructive",
      });
      return;
    }

    if (!secret.trim()) {
      toast({
        title: "Warning",
        description: "Please enter a secret key for verification",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = verifyJWT(token, secret);
      setVerificationResult({
        valid: result.valid,
        error: result.error
      });
      
      if (result.decoded) {
        setDecodedData(result.decoded);
      }
      
      toast({
        title: result.valid ? "Verification Successful" : "Verification Failed",
        description: result.valid 
          ? "Token signature is valid" 
          : `Invalid signature: ${result.error || "Unknown error"}`,
        variant: result.valid ? "default" : "destructive",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setVerificationResult({
        valid: false,
        error: errorMessage
      });
      
      toast({
        title: "Verification Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      
      setTimeout(() => {
        if (copied === label) {
          setCopied(null);
        }
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to copy to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  // Auto-decode on initial render
  useEffect(() => {
    if (token) {
      handleDecode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply token template
  const applyTemplate = (templateName: string) => {
    const templates = getTokenTemplates();
    const template = templates.find(t => t.name === templateName);
    
    if (template) {
      setPayloadJson(JSON.stringify(template.payload, null, 2));
      setAlgorithm(template.options.algorithm);
      setExpiresIn(template.options.expiresIn?.toString() || "1h");
      
      toast({
        title: "Template Applied",
        description: `${templateName} template loaded`
      });
    }
  };

  // Handle token generation
  const handleGenerateToken = () => {
    try {
      // Validate inputs
      if (!secret || typeof secret !== 'string' || secret.trim() === '') {
        toast({
          title: "Validation Error",
          description: "Please enter a valid secret key",
          variant: "destructive"
        });
        return;
      }

      // Parse and validate payload JSON
      let payload;
      try {
        payload = JSON.parse(payloadJson);
        if (typeof payload !== 'object' || payload === null) {
          throw new Error('Payload must be a valid JSON object');
        }
      } catch (parseError) {
        const errorMessage = parseError instanceof Error ? 
          parseError.message : 'Invalid JSON format';
          
        toast({
          title: "Invalid JSON",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      // Create options with type safety
      const options: JWTEncodeOptions = {
        algorithm: algorithm || 'HS256'
      };

      // Only add expiresIn if it's a valid value
      if (expiresIn && (typeof expiresIn === 'string' || typeof expiresIn === 'number')) {
        options.expiresIn = expiresIn;
      }
      
      // Generate token
      const newToken = generateJWT(payload, secret, options);
      setGeneratedToken(newToken);
      
      toast({
        title: "JWT Generated Successfully",
        description: "Copy your new JWT token below"
      });
    } catch (error) {
      console.error("Token generation error:", error);
      
      let errorMessage = "Failed to generate token";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error !== null && error !== undefined) {
        errorMessage = String(error);
      }
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Use generated token 
  const useGeneratedToken = () => {
    if (generatedToken) {
      setToken(generatedToken);
      setActiveSection("decode");
      handleDecode();
      
      toast({
        title: "Token Applied",
        description: "Generated token loaded into decoder"
      });
    }
  };

  // Render expiration info
  const renderExpirationInfo = () => {
    if (!decodedData || !decodedData.payload) return null;
    
    const { payload, expirationStatus } = decodedData;
    
    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Expiration Status:</span>
          </div>
          <Badge
            variant={
              expirationStatus === 'valid' ? 'default' : 
              expirationStatus === 'expired' ? 'destructive' : 
              expirationStatus === 'not-yet-valid' ? 'outline' : 
              'secondary'
            }
            className={expirationStatus === 'valid' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
          >
            {expirationStatus === 'valid' && 'Valid'}
            {expirationStatus === 'expired' && 'Expired'}
            {expirationStatus === 'not-yet-valid' && 'Not Yet Valid'}
            {expirationStatus === 'no-expiry' && 'No Expiration'}
          </Badge>
        </div>
        
        {typeof payload.exp !== 'undefined' && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Expires at:</span>
            </div>
            <span>{formatTimestamp(Number(payload.exp))}</span>
          </div>
        )}
        
        {typeof payload.iat !== 'undefined' && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Issued at:</span>
            </div>
            <span>{formatTimestamp(Number(payload.iat))}</span>
          </div>
        )}
        
        {typeof payload.nbf !== 'undefined' && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Not valid before:</span>
            </div>
            <span>{formatTimestamp(Number(payload.nbf))}</span>
          </div>
        )}
        
        {typeof payload.exp !== 'undefined' && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Time remaining:</span>
            </div>
            <span>{getExpirationTime(Number(payload.exp))}</span>
          </div>
        )}
      </div>
    );
  };

  // Render signature verification
  const renderVerificationResult = () => {
    if (!verificationResult) return null;
    
    return (
      <div className="mt-4 p-3 border rounded-md">
        <div className="flex items-center">
          {verificationResult.valid ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="font-medium">Signature Valid</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="font-medium">Signature Invalid</span>
            </>
          )}
        </div>
        
        {!verificationResult.valid && verificationResult.error && (
          <div className="mt-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 inline mr-1 text-red-400" />
            {verificationResult.error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as "decode" | "generate")} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="decode">
            <Eye className="mr-2 h-4 w-4" />
            Decode & Verify
          </TabsTrigger>
          <TabsTrigger value="generate">
            <Code className="mr-2 h-4 w-4" />
            Generate Token
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="decode">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>Enter your JWT token and optional secret for verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jwt-token">JWT Token</Label>
                    <Textarea
                      id="jwt-token"
                      placeholder="Paste your JWT here..."
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="min-h-[120px] font-mono text-sm mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="secret-key">Secret Key (for verification)</Label>
                    <Input
                      id="secret-key"
                      type="text"
                      placeholder="Enter secret key..."
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      className="font-mono text-sm mt-2"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      onClick={handleDecode}
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Decode
                    </Button>
                    
                    <Button
                      variant="secondary"
                      onClick={handleVerify}
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Verify
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {decodedData && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Decoded Token</CardTitle>
                    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="decoded">Decoded</TabsTrigger>
                        <TabsTrigger value="header">Header</TabsTrigger>
                        <TabsTrigger value="payload">Payload</TabsTrigger>
                      </TabsList>
                    
                      <TabsContent value="decoded" className="mt-3">
                        <div className="space-y-4">
                          {/* Token Info */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Algorithm:</span>
                              <Badge variant="outline">{decodedData.header.alg}</Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Token Type:</span>
                              <Badge variant="outline">{decodedData.header.typ || 'JWT'}</Badge>
                            </div>
                          </div>
                          
                          {renderExpirationInfo()}
                          {renderVerificationResult()}
                          
                          {/* Quick access to key properties */}
                          {/* {typeof decodedData.payload.sub !== 'undefined' && (
                            <div className="flex items-center justify-between text-sm pt-3">
                              <span className="font-medium">Subject:</span>
                              <span className="text-muted-foreground">{String(decodedData.payload.sub)}</span>
                            </div>
                          )}
                          
                          {typeof decodedData.payload.iss !== 'undefined' && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">Issuer:</span>
                              <span className="text-muted-foreground">{String(decodedData.payload.iss)}</span>
                            </div>
                          )}
                          
                          {typeof decodedData.payload.aud !== 'undefined' && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">Audience:</span>
                              <span className="text-muted-foreground">
                                {Array.isArray(decodedData.payload.aud) 
                                  ? decodedData.payload.aud.join(', ') 
                                  : String(decodedData.payload.aud)}
                              </span>
                            </div>
                          )} */}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="header" className="mt-3">
                        <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs md:text-sm max-h-[350px]">
                          <code>{JSON.stringify(decodedData.header, null, 2)}</code>
                        </pre>
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => copyToClipboard(JSON.stringify(decodedData.header, null, 2), 'Header')}
                        >
                          {copied === 'Header' ? (
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4" />
                          )}
                          Copy Header
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="payload" className="mt-3">
                        <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs md:text-sm max-h-[350px]">
                          <code>{JSON.stringify(decodedData.payload, null, 2)}</code>
                        </pre>
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => copyToClipboard(JSON.stringify(decodedData.payload, null, 2), 'Payload')}
                        >
                          {copied === 'Payload' ? (
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4" />
                          )}
                          Copy Payload
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </CardHeader>
                  <CardContent>
                    {/* Content moved to TabsContent sections above */}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="generate">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate JWT Token</CardTitle>
                <CardDescription>Configure payload and options for your token</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="payload-json">Payload (JSON)</Label>
                      <Select 
                        onValueChange={(value) => applyTemplate(value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Templates" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTokenTemplates().map(template => (
                            <SelectItem key={template.name} value={template.name}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      id="payload-json"
                      placeholder="{}"
                      value={payloadJson}
                      onChange={(e) => setPayloadJson(e.target.value)}
                      className="min-h-[180px] font-mono text-sm mt-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="algorithm">Algorithm</Label>
                      <Select value={algorithm} onValueChange={setAlgorithm}>
                        <SelectTrigger id="algorithm" className="w-full">
                          <SelectValue placeholder="Select algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAlgorithmOptions().map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expires-in">Expires In</Label>
                      <Select value={expiresIn} onValueChange={setExpiresIn}>
                        <SelectTrigger id="expires-in" className="w-full">
                          <SelectValue placeholder="Select expiration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15m">15 minutes</SelectItem>
                          <SelectItem value="1h">1 hour</SelectItem>
                          <SelectItem value="6h">6 hours</SelectItem>
                          <SelectItem value="12h">12 hours</SelectItem>
                          <SelectItem value="1d">1 day</SelectItem>
                          <SelectItem value="7d">7 days</SelectItem>
                          <SelectItem value="30d">30 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secret-key-gen">Secret Key</Label>
                    <Input
                      id="secret-key-gen"
                      type="text"
                      placeholder="Enter secret key..."
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      className="font-mono text-sm mt-2"
                    />
                  </div>
                  
                  <Button
                    variant="default"
                    onClick={handleGenerateToken}
                    className="w-full"
                  >
                    <Code className="mr-2 h-4 w-4" />
                    Generate Token
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Token</CardTitle>
                <CardDescription>Your JWT token will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Generated JWT will appear here..."
                    value={generatedToken}
                    readOnly
                    className="min-h-[120px] font-mono text-sm"
                  />
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => generatedToken && copyToClipboard(generatedToken, 'Generated Token')}
                      className="flex-1"
                      disabled={!generatedToken}
                    >
                      {copied === 'Generated Token' ? (
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      Copy Token
                    </Button>
                    
                    <Button
                      variant="secondary"
                      onClick={useGeneratedToken}
                      className="flex-1"
                      disabled={!generatedToken}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Use in Decoder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 