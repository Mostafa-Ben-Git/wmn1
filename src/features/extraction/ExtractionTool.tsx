import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { setInputText, setExtractionType, setResults } from './extractionSlice';
import { getRegexPattern, copyToClipboard } from '@/lib/helpers';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ExtractionType } from '@/types';

const ExtractionTool: React.FC = () => {
  const dispatch = useDispatch();
  const { inputText, extractionType, results } = useSelector((state: RootState) => state.extraction);
  const [copied, setCopied] = useState(false);

  // Function to perform extraction
  const performExtraction = (type: ExtractionType) => {
    if (!inputText.trim()) return;
    
    const pattern = getRegexPattern(type);
    const matches = inputText.match(pattern);
    const uniqueMatches = matches ? [...new Set(matches)] : [];

    dispatch(setResults({ type, data: uniqueMatches }));

    toast.success('Extraction Complete', {
      description: `Found ${uniqueMatches.length} unique ${type}`,
    });
  };

  // Auto-extract when extraction type changes
  useEffect(() => {
    if (inputText.trim()) {
      performExtraction(extractionType);
    }
  }, [extractionType]);

  // Also perform extraction when input text changes (if not empty)
  useEffect(() => {
    if (inputText.trim()) {
      performExtraction(extractionType);
    }
  }, [inputText]);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } else {
      toast.error('Copy failed');
    }
  };

  const handleExtractionTypeChange = (value: string) => {
    if (value) {
      dispatch(setExtractionType(value as any));
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Data Extraction</CardTitle>
        <CardDescription>Extract servers, IPs, emails, or domains from text</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Extraction Type</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            className="justify-start mb-4 gap-0.5"
            value={extractionType}
            onValueChange={handleExtractionTypeChange}
          >
            <ToggleGroupItem
              value="servers"
              className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground cursor-pointer"
            >
              Servers
            </ToggleGroupItem>
            <ToggleGroupItem
              value="ips"
              className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground cursor-pointer"
            >
              IP Addresses
            </ToggleGroupItem>
            <ToggleGroupItem
              value="emails"
              className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground cursor-pointer"
            >
              Emails
            </ToggleGroupItem>
            <ToggleGroupItem
              value="domains"
              className="px-4 py-2 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground cursor-pointer"
            >
              Domains
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Input Text</Label>
          <Textarea
            value={inputText}
            onChange={(e) => dispatch(setInputText(e.target.value))}
            className="h-40 text-sm"
            placeholder="Paste text here to extract information..."
          />
        </div>

        {results[extractionType].length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm font-medium">
                Results <Badge variant="outline">{results[extractionType].length}</Badge>
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(results[extractionType].join('\n'))}
              >
                {copied ? <CheckIcon className="h-4 w-4 mr-1" /> : <CopyIcon className="h-4 w-4 mr-1" />}
                {copied ? 'Copied' : 'Copy All'}
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
                        onClick={() => handleCopy(item)}
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
  );
};

export default ExtractionTool;