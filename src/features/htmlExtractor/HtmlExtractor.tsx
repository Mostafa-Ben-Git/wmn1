import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/app/store";
import { copyToClipboard } from "@/lib/helpers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  FileTextIcon,
  GlobeIcon,
  LinkIcon,
  Paintbrush,
  UndoIcon,
  RefreshCwIcon as ReplaceIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ExtractionMode } from "@/types";
import { fetchHtmlContent, fetchRandomBlogPost } from "./htmlExtractorThunks";
import {
  replaceDomains,
  revertDomainChanges,
  setExtractionMode,
  setSiteUrl,
} from "./htmlExtractorSlice";

const HtmlExtractor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    status,
    siteUrl,
    extractedHtml,
    extractedText,
    extractedClean,
    originalCleanHtml,
    extractionMode,
  } = useSelector((state: RootState) => state.htmlExtractor);

  const [copied, setCopied] = useState(false);
  const [domainReplacement, setDomainReplacement] = useState("");

  // Check if domains have been replaced
  const hasReplacedDomains = Boolean(originalCleanHtml);

  // Handle copy with visual feedback
  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle extraction
  const handleExtract = () => {
    dispatch(fetchHtmlContent(siteUrl))
      .unwrap()
      .then(() => {
        toast.success("Content Extracted", {
          description: "HTML content has been successfully extracted",
        });
      })
      .catch((errorMessage) => {
        toast.error("Extraction Failed", {
          description: errorMessage,
        });
      });
  };

  // Handle random blog post
  const handleRandomBlog = () => {
    dispatch(fetchRandomBlogPost())
      .unwrap()
      .then(() => {
        toast.success("Random URL Generated", {
          description: "Found a random blog post to explore",
        });
      })
      .catch((errorMessage) => {
        toast.error("Failed to fetch random blog", {
          description: errorMessage,
        });
      });
  };

  // Handle domain replacement
  const handleReplaceDomains = () => {
    dispatch(replaceDomains(domainReplacement));
    toast.success("Domains Replaced", {
      description: `All domains have been replaced with "${domainReplacement}"`,
    });
  };

  // Handle domain revert
  const handleRevertDomains = () => {
    dispatch(revertDomainChanges());
    toast.success("Domain Changes Reverted", {
      description: "All domain replacements have been undone",
    });
  };

  return (
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
                onChange={(e) => dispatch(setSiteUrl(e.target.value))}
                placeholder="example.com"
                className="flex-2"
              />
              <Button
                onClick={handleRandomBlog}
                className="whitespace-nowrap"
                disabled={status === "loading"}
                type="button"
              >
                {status === "loading" ? (
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <LinkIcon className="h-4 w-4 mr-2" />
                )}
                Random Blog Site
              </Button>

              <Button
                onClick={handleExtract}
                className="whitespace-nowrap"
                disabled={status === "extract" || !siteUrl.trim()}
                type="button"
              >
                {status === "extract" ? (
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <GlobeIcon className="h-4 w-4 mr-2" />
                )}
                {status === "extract" ? "Extracting..." : "Extract Content"}
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
                  value && dispatch(setExtractionMode(value as ExtractionMode))
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

            <div className="flex items-center space-x-2">
              <Input
                placeholder="Replace domain with..."
                value={domainReplacement}
                onChange={(e) => setDomainReplacement(e.target.value)}
                className="w-48"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplaceDomains}
                disabled={!extractedClean || !domainReplacement.trim()}
              >
                <ReplaceIcon className="h-4 w-4 mr-1" /> Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevertDomains}
                disabled={!hasReplacedDomains}
              >
                <UndoIcon className="h-4 w-4 mr-1" /> Revert
              </Button>
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
                  onClick={() => handleCopy(extractedHtml)}
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
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
                <Textarea value={extractedText} readOnly className="h-96" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-8"
                  onClick={() => handleCopy(extractedText)}
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {extractionMode === "clean" && (
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">
                    Clean HTML{" "}
                    <Badge variant="outline">
                      {extractedClean ? "Extracted" : "None"}
                    </Badge>
                  </Label>
                </div>
                <Textarea value={extractedClean} readOnly className="h-96" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-8"
                  onClick={() => handleCopy(extractedClean)}
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-center">
        The content is extracted through a proxy to bypass CORS restrictions
      </CardFooter>
    </Card>
  );
};

export default HtmlExtractor;
