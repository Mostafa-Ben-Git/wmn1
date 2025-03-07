import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CheckIcon, CopyIcon, RefreshCwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";

export function FeatureTabs() {
  const [inputText, setInputText] = useState("");
  const [extractionType, setExtractionType] = useState("servers");
  const [copied, setCopied] = useState(false);
  const [randomString, setRandomString] = useState("");
  const [randomLength, setRandomLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  
  const [results, setResults] = useState({
    servers: [] as string[],
    ips: [] as string[],
    emails: [] as string[],
    domains: [] as string[],
  });

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleExtraction = () => {
    const patterns = {
      servers: /\b(sr|s)_[a-zA-Z0-9]{1,5}_[0-9]{1,4}\b/g,
      ips: /(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})/g,
      emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      domains: /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-_.]+\.[a-zA-Z]{2,})/gi,
    };

    const matches = inputText.match(patterns[extractionType as keyof typeof patterns]);
    const uniqueMatches = matches ? [...new Set(matches)] : [];
    
    setResults((prev) => ({
      ...prev,
      [extractionType]: uniqueMatches,
    }));

    toast("Extraction Complete",{
      description: `Found ${uniqueMatches.length} unique ${extractionType}`,
    });
  };

  const generateRandomString = () => {
    let chars = "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_-+=<>?/";
    
    if (chars.length === 0) {
      toast( "Error",{
        description: "Please select at least one character type",
      });
      return;
    }
    
    let result = "";
    for (let i = 0; i < randomLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRandomString(result);
    
    toast( "String Generated",{
      description: `Generated a ${randomLength} character string`,
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast( "Copied to clipboard",{
      description: "The content has been copied to your clipboard",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Tabs defaultValue="extraction" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="extraction">Extraction Tool</TabsTrigger>
          <TabsTrigger value="randomstring">Random String Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="extraction">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Data Extraction</CardTitle>
              <CardDescription>Extract servers, IPs, emails, or domains from text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Extraction Type</Label>
                <ToggleGroup type="single" variant="outline" className="justify-start mb-4" 
                  value={extractionType} 
                  onValueChange={(value) => value && setExtractionType(value)}>
                  <ToggleGroupItem value="servers" className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    Servers
                  </ToggleGroupItem>
                  <ToggleGroupItem value="ips" className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    IP Addresses
                  </ToggleGroupItem>
                  <ToggleGroupItem value="emails" className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    Emails
                  </ToggleGroupItem>
                  <ToggleGroupItem value="domains" className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    Domains
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Input Text</Label>
                <Textarea 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  className="h-40 text-sm" 
                  placeholder="Paste text here to extract information..." 
                />
              </div>
              
              <Button 
                onClick={handleExtraction} 
                className="w-full"
                disabled={!inputText.trim()}
              >
                Extract {extractionType.charAt(0).toUpperCase() + extractionType.slice(1)}
              </Button>

              {results[extractionType].length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Results <Badge variant="outline">{results[extractionType].length}</Badge></Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(results[extractionType].join('\n'))}
                    >
                      {copied ? <CheckIcon className="h-4 w-4 mr-1" /> : <CopyIcon className="h-4 w-4 mr-1" />}
                      {copied ? "Copied" : "Copy All"}
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
                    {results[extractionType].length > 0 ? (
                      <ul className="space-y-1">
                        {results[extractionType].map((item, index) => (
                          <li key={index} className="flex justify-between items-center py-1 px-2 hover:bg-muted/80 rounded">
                            <span className="text-sm font-mono">{item}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0" 
                              onClick={() => copyToClipboard(item)}
                            >
                              <CopyIcon className="h-3 w-3" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No results found</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="randomstring">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Random String Generator</CardTitle>
              <CardDescription>Generate secure random strings with custom options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Length ({randomLength} characters)</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="range" 
                    value={randomLength} 
                    onChange={(e) => setRandomLength(Number(e.target.value))} 
                    min={4} 
                    max={64}
                    className="flex-1" 
                  />
                  <Input 
                    type="number" 
                    value={randomLength} 
                    onChange={(e) => setRandomLength(Number(e.target.value))} 
                    min={4} 
                    max={64}
                    className="w-20" 
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Character Types</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={includeSymbols ? "default" : "outline"} 
                    className={`px-4 py-2 ${includeSymbols ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setIncludeSymbols(!includeSymbols)}
                  >
                    Symbols (!@#$)
                  </Button>
                  <Button 
                    variant={includeNumbers ? "default" : "outline"} 
                    className={`px-4 py-2 ${includeNumbers ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setIncludeNumbers(!includeNumbers)}
                  >
                    Numbers (0-9)
                  </Button>
                  <Button 
                    variant={includeUppercase ? "default" : "outline"} 
                    className={`px-4 py-2 ${includeUppercase ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setIncludeUppercase(!includeUppercase)}
                  >
                    Uppercase (A-Z)
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={generateRandomString} 
                className="w-full mt-6"
                disabled={!includeSymbols && !includeNumbers && !includeUppercase}
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" /> Generate Random String
              </Button>
              
              {randomString && (
                <div className="mt-4 relative">
                  <Textarea 
                    value={randomString} 
                    readOnly 
                    className="h-20 font-mono text-lg pr-12" 
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-2 top-2" 
                    onClick={() => copyToClipboard(randomString)}
                  >
                    {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground flex justify-center">
              Generated strings are created client-side and never stored or transmitted
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
}