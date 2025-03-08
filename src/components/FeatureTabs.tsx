import { useState, useEffect, JSX } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
  GlobeIcon,
  CodeIcon,
  LinkIcon,
  FileTextIcon,
  Paintbrush,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";

// Define TypeScript types
type ExtractionType = "servers" | "ips" | "emails" | "domains";
type ExtractionMode = "source" | "text" | "clean";

interface ResultsState {
  servers: string[];
  ips: string[];
  emails: string[];
  domains: string[];
}

interface AttributeData {
  tag: string;
  attributes: Record<string, string>;
}

export function FeatureTabs(): JSX.Element {
  // Extraction tool state
  const [inputText, setInputText] = useState<string>("");
  const [extractionType, setExtractionType] =
    useState<ExtractionType>("servers");
  const [copied, setCopied] = useState<boolean>(false);
  const [results, setResults] = useState<ResultsState>({
    servers: [],
    ips: [],
    emails: [],
    domains: [],
  });

  // Random string generator state
  const [randomString, setRandomString] = useState<string>("");
  const [randomLength, setRandomLength] = useState<number>(16);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);

  // HTML extractor state
  const [siteUrl, setSiteUrl] = useState<string>("");
  const [extractionMode, setExtractionMode] =
    useState<ExtractionMode>("source");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [extractedHtml, setExtractedHtml] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [extractedClean, setExtractedClean] = useState<string>("");

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleExtraction = (): void => {
    const patterns: Record<ExtractionType, RegExp> = {
      servers: /\b(sr|s)_[a-zA-Z0-9]{1,5}_[0-9]{1,4}\b/g,
      ips: /(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})/g,
      emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      domains: /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-_.]+\.[a-zA-Z]{2,})/gi,
    };

    const matches = inputText.match(patterns[extractionType]);
    const uniqueMatches = matches ? [...new Set(matches)] : [];

    setResults((prev) => ({
      ...prev,
      [extractionType]: uniqueMatches,
    }));

    toast.success("Extraction Complete", {
      description: `Found ${uniqueMatches.length} unique ${extractionType}`,
    });
  };

  const generateRandomString = (): void => {
    let chars = "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_-+=<>?/";

    if (chars.length === 0) {
      toast.error("Error", {
        description: "Please select at least one character type",
      });
      return;
    }

    let result = "";
    for (let i = 0; i < randomLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRandomString(result);

    toast.success("String Generated", {
      description: `Generated a ${randomLength} character string`,
    });
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast.success("Copied to clipboard", {
          description: "The content has been copied to your clipboard",
        });
      })
      .catch((error) => {
        console.error("Failed to copy:", error);
        toast.error("Copy failed", {
          description: "Unable to copy to clipboard",
        });
      });
  };

  const fetchHtmlFromUrl = async (): Promise<void> => {
    if (!siteUrl.trim()) {
      toast.error("Error", {
        description: "Please enter a valid URL",
      });
      return;
    }

    // Add https:// if not present
    let url = siteUrl;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    setIsLoading(true);

    try {
      // Using cors-anywhere proxy or similar service to bypass CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        url
      )}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.contents) {
        throw new Error("Invalid response from proxy service");
      }

      const htmlContent = data.contents;
      setExtractedHtml(htmlContent.replace(/[\n\r]+/g, " "));

      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");

      // Extract inner text
      const bodyElement = doc.body;
      if (!bodyElement) {
        throw new Error("Could not parse HTML body");
      }

      const innerText = bodyElement.innerText.replace(/[\n\r]+/g, " ");
      setExtractedText(innerText);

      // Clean HTML (remove scripts, styles, and comments)
      const scripts = doc.querySelectorAll("script");
      scripts.forEach((script) => script.remove());

      const styles = doc.querySelectorAll("style");
      styles.forEach((style) => style.remove());

      // Extract basic attributes from elements
      const elements = doc.querySelectorAll("*");
      const attributesList: AttributeData[] = [];
      const importantAttributes = [
        "id",
        "class",
        "href",
        "src",
        "alt",
        "title",
      ];

      elements.forEach((el) => {
        if (el.hasAttributes()) {
          const elementAttrs: Record<string, string> = {};
          let hasImportantAttr = false;

          importantAttributes.forEach((attr) => {
            if (el.hasAttribute(attr)) {
              const attrValue = el.getAttribute(attr);
              if (attrValue !== null) {
                elementAttrs[attr] = attrValue;
                hasImportantAttr = true;
              }
            }
          });

          if (hasImportantAttr) {
            attributesList.push({
              tag: el.tagName.toLowerCase(),
              attributes: elementAttrs,
            });
          }
        }
      });

      // Get clean HTML
      const htmlOnly = doc.documentElement.outerHTML;
      setExtractedClean(htmlOnly);

      toast.success("Content Extracted", {
        description: "HTML content has been successfully extracted",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Extraction Failed", {
        description: errorMessage,
      });
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRandomBlogPost = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const adviceResponse = await fetch("https://api.adviceslip.com/advice");
      if (!adviceResponse.ok) {
        throw new Error("Failed to fetch random advice");
      }

      const adviceData = await adviceResponse.json();
      if (!adviceData || !adviceData.slip || !adviceData.slip.advice) {
        throw new Error("Invalid advice data format");
      }

      const randomAdvice = adviceData.slip.advice;
      const searchQuery = encodeURIComponent(randomAdvice);
      const url = `https://www.googleapis.com/customsearch/v1?q=${searchQuery}&cx=20bf7476686df428c&key=AIzaSyDAn_HUaB4aZVHbuWSvnQ-rlmh6O5eLQNQ`;

      const searchResponse = await fetch(url);
      if (!searchResponse.ok) {
        throw new Error("Search API request failed");
      }

      const searchData = await searchResponse.json();
      if (
        !searchData ||
        !searchData.items ||
        !searchData.items[0] ||
        !searchData.items[0].link
      ) {
        throw new Error("Invalid search results format");
      }

      const firstResult = searchData.items[0].link;
      setSiteUrl(firstResult);

      toast.success("Random URL Generated", {
        description: "Found a random blog post to explore",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to fetch random blog", {
        description: errorMessage,
      });
      console.error("Error fetching random blog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Tabs defaultValue="extraction" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="extraction">Extraction Tool</TabsTrigger>
          <TabsTrigger value="randomstring">
            Random String Generator
          </TabsTrigger>
          <TabsTrigger value="negative">HTML Extractor</TabsTrigger>
        </TabsList>

        <TabsContent value="extraction">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Data Extraction</CardTitle>
              <CardDescription>
                Extract servers, IPs, emails, or domains from text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Extraction Type
                </Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  className="justify-start mb-4"
                  value={extractionType}
                  onValueChange={(value) =>
                    value && setExtractionType(value as ExtractionType)
                  }
                >
                  <ToggleGroupItem
                    value="servers"
                    className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Servers
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="ips"
                    className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    IP Addresses
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="emails"
                    className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Emails
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="domains"
                    className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    Domains
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Input Text
                </Label>
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
                Extract{" "}
                {extractionType.charAt(0).toUpperCase() +
                  extractionType.slice(1)}
              </Button>

              {results[extractionType].length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">
                      Results{" "}
                      <Badge variant="outline">
                        {results[extractionType].length}
                      </Badge>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(results[extractionType].join("\n"))
                      }
                    >
                      {copied ? (
                        <CheckIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <CopyIcon className="h-4 w-4 mr-1" />
                      )}
                      {copied ? "Copied" : "Copy All"}
                    </Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
                    {results[extractionType].length > 0 ? (
                      <ul className="space-y-1">
                        {results[extractionType].map((item, index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center py-1 px-2 hover:bg-muted/80 rounded"
                          >
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
                      <p className="text-sm text-muted-foreground">
                        No results found
                      </p>
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
              <CardTitle className="text-2xl">
                Random String Generator
              </CardTitle>
              <CardDescription>
                Generate secure random strings with custom options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Length ({randomLength} characters)
                </Label>
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
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setRandomLength(Math.min(Math.max(value, 4), 64));
                    }}
                    min={4}
                    max={64}
                    className="w-20"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Character Types
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={includeSymbols ? "default" : "outline"}
                    className={`px-4 py-2 ${
                      includeSymbols ? "bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => setIncludeSymbols(!includeSymbols)}
                    type="button"
                  >
                    Symbols (!@#$)
                  </Button>
                  <Button
                    variant={includeNumbers ? "default" : "outline"}
                    className={`px-4 py-2 ${
                      includeNumbers ? "bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => setIncludeNumbers(!includeNumbers)}
                    type="button"
                  >
                    Numbers (0-9)
                  </Button>
                  <Button
                    variant={includeUppercase ? "default" : "outline"}
                    className={`px-4 py-2 ${
                      includeUppercase
                        ? "bg-primary text-primary-foreground"
                        : ""
                    }`}
                    onClick={() => setIncludeUppercase(!includeUppercase)}
                    type="button"
                  >
                    Uppercase (A-Z)
                  </Button>
                </div>
              </div>

              <Button
                onClick={generateRandomString}
                className="w-full mt-6"
                disabled={
                  !includeSymbols && !includeNumbers && !includeUppercase
                }
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" /> Generate Random
                String
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
                    {copied ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground flex justify-center">
              Generated strings are created client-side and never stored or
              transmitted
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="negative">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">HTML Extractor</CardTitle>
              <CardDescription>
                Extract and clean HTML, text and attributes from any website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-sm font-medium mb-2 block">
                    Website URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      placeholder="example.com"
                      className="flex-2"
                    />
                    <Button
                      onClick={fetchRandomBlogPost}
                      className="whitespace-nowrap"
                      disabled={isLoading}
                      type="button"
                    >
                      {isLoading ? (
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <LinkIcon className="h-4 w-4 mr-2" />
                      )}
                      Random Blog Site
                    </Button>

                    <Button
                      onClick={fetchHtmlFromUrl}
                      className="whitespace-nowrap"
                      disabled={isLoading || !siteUrl.trim()}
                      type="button"
                    >
                      {isLoading ? (
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <GlobeIcon className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? "Extracting..." : "Extract Content"}
                    </Button>
                  </div>
                </div>
              </div>

              {(extractedHtml || extractedText || extractedClean) && (
                <>
                  <div className="mb-2">
                    <Label className="text-sm font-medium mb-2 block">
                      View Mode
                    </Label>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      className="justify-start mb-4"
                      value={extractionMode}
                      onValueChange={(value) =>
                        value && setExtractionMode(value as ExtractionMode)
                      }
                    >
                      <ToggleGroupItem
                        value="source"
                        className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        <CodeIcon className="h-4 w-4 mr-1" /> HTML Source
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="text"
                        className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        <FileTextIcon className="h-4 w-4 mr-1" /> Just Text
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="clean"
                        className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        <Paintbrush className="h-4 w-4 mr-1" /> Clean HTML
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {extractionMode === "source" && (
                    <div className="relative">
                      <Label className="text-sm font-medium mb-2 block">
                        HTML source{" "}
                        <Badge variant="outline">
                          {extractedHtml ? "Extracted" : "None"}
                        </Badge>
                      </Label>
                      <Textarea
                        value={extractedHtml}
                        readOnly
                        className="h-96 text-xs font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-8"
                        onClick={() => copyToClipboard(extractedHtml)}
                        type="button"
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {extractionMode === "text" && (
                    <div className="relative">
                      <Label className="text-sm font-medium mb-2 block">
                        Inner Text{" "}
                        <Badge variant="outline">
                          {extractedText ? "Extracted" : "None"}
                        </Badge>
                      </Label>
                      <Textarea
                        value={extractedText}
                        readOnly
                        className="h-96"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-8"
                        onClick={() => copyToClipboard(extractedText)}
                        type="button"
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {extractionMode === "clean" && (
                    <div className="relative">
                      <Label className="text-sm font-medium mb-2 block">
                        Clean HTML{" "}
                        <Badge variant="outline">
                          {extractedClean ? "Extracted" : "None"}
                        </Badge>
                      </Label>
                      <Textarea
                        value={extractedClean}
                        readOnly
                        className="h-96"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-8"
                        onClick={() => copyToClipboard(extractedClean)}
                        type="button"
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground flex justify-center">
              The content is extracted through a proxy to bypass CORS
              restrictions
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster position="top-center" />
    </div>
  );
}
