import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
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
import { Textarea } from "@/components/ui/textarea";
import {
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
  PlusIcon,
  TrashIcon,
  ShuffleIcon,
  InfoIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  setIncludeNumbers,
  setIncludeSymbols,
  setIncludeUppercase,
  setRandomLength,
  setRandomString,
  addWordEntry,
  updateWordEntry,
  removeWordEntry,
} from "./randomStringSlice";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const RandomStringGenerator: React.FC = () => {
  const dispatch = useDispatch();
  const {
    includeNumbers,
    includeSymbols,
    includeUppercase,
    randomLength,
    randomString,
    wordEntries,
  } = useSelector((state: RootState) => state.randomString);

  const [copied, setCopied] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newWordTimes, setNewWordTimes] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong" | null
  >(null);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Calculate password strength whenever randomString changes
  useEffect(() => {
    if (!randomString) {
      setPasswordStrength(null);
      return;
    }

    const length = randomString.length;
    const hasLower = /[a-z]/.test(randomString);
    const hasUpper = /[A-Z]/.test(randomString);
    const hasNumber = /[0-9]/.test(randomString);
    const hasSymbol = /[^a-zA-Z0-9]/.test(randomString);

    const varietyScore = [hasLower, hasUpper, hasNumber, hasSymbol].filter(
      Boolean
    ).length;

    if (length >= 12 && varietyScore >= 3) {
      setPasswordStrength("strong");
    } else if (length >= 8 && varietyScore >= 2) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  }, [randomString]);

  const copyToClipboard = useCallback((text: string): void => {
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
  }, []);

  const shuffleString = (str: string): string => {
    return str
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const generateRandomString = useCallback((): void => {
    if (wordEntries.length > 0) {
      // Generate string using word repetitions
      let result = "";
      wordEntries.forEach((entry) => {
        result += entry.word.repeat(entry.times);
      });
      // Shuffle the characters to make it random
      // result = shuffleString(result);
      dispatch(setRandomString(result));
      toast.success("String Generated", {
        description: "Generated a string using repeated words",
      });
    } else {
      // Character-based generation
      let chars = "abcdefghijklmnopqrstuvwxyz";
      if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (includeNumbers) chars += "0123456789";
      if (includeSymbols) chars += "!@#$%^&*()_-+=<>?";

      if (chars.length === 0) {
        toast.error("Error", {
          description: "Please select at least one character type",
        });
        return;
      }

      let result = "";
      const charsLength = chars.length;

      // Using Crypto API for better randomness when available
      if (window.crypto && window.crypto.getRandomValues) {
        const randomValues = new Uint32Array(randomLength);
        window.crypto.getRandomValues(randomValues);

        for (let i = 0; i < randomLength; i++) {
          result += chars.charAt(randomValues[i] % charsLength);
        }
      } else {
        // Fallback to Math.random
        for (let i = 0; i < randomLength; i++) {
          result += chars.charAt(Math.floor(Math.random() * charsLength));
        }
      }

      dispatch(setRandomString(result));
      toast.success("String Generated", {
        description: `Generated a ${randomLength} character string`,
      });
    }
  }, [
    dispatch,
    includeNumbers,
    includeSymbols,
    includeUppercase,
    randomLength,
    wordEntries,
  ]);

  const handleAddWord = useCallback(() => {
    if (newWord.trim() === "") return;
    dispatch(addWordEntry({ word: newWord.trim(), times: newWordTimes }));
    setNewWord("");
    setNewWordTimes(1);
  }, [dispatch, newWord, newWordTimes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddWord();
    }
  };

  return (
    <Card className="border-2 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl">Random String Generator</CardTitle>
        <CardDescription>
          Generate secure random strings with custom options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Character Settings Section */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Character Settings</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="includeUppercase">Include Uppercase</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Add uppercase letters (A-Z) to your random string
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="includeUppercase"
                checked={includeUppercase}
                onCheckedChange={(checked) =>
                  dispatch(setIncludeUppercase(checked))
                }
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="includeNumbers">Include Numbers</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Add numbers (0-9) to your random string
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="includeNumbers"
                checked={includeNumbers}
                onCheckedChange={(checked) =>
                  dispatch(setIncludeNumbers(checked))
                }
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="includeSymbols">Include Symbols</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Add special characters (!@#$%^&*()_-+=&lt;&gt;?) to your
                      random string
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="includeSymbols"
                checked={includeSymbols}
                onCheckedChange={(checked) =>
                  dispatch(setIncludeSymbols(checked))
                }
              />
            </div>
          </div>
        </div>

        {/* Length Control */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="length" className="text-sm font-medium">
              Length ({randomLength} characters)
            </Label>
            <Input
              id="lengthInput"
              type="number"
              value={randomLength}
              onChange={(e) => {
                const value = Number(e.target.value);
                dispatch(setRandomLength(Math.min(Math.max(value, 4), 64)));
              }}
              min={4}
              max={64}
              className="w-20"
            />
          </div>
          <Input
            id="length"
            type="range"
            value={randomLength}
            onChange={(e) => dispatch(setRandomLength(Number(e.target.value)))}
            min={4}
            max={64}
            className="w-full"
          />
        </div>

        {/* Word Repetitions Section */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Word Repetitions</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Add words that will be repeated and shuffled to create your
                  random string
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Word Entry Form */}
          <div className="flex items-center gap-2 mb-3">
            <Input
              type="text"
              placeholder="Enter word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Repeats"
              value={newWordTimes}
              onChange={(e) => setNewWordTimes(Number(e.target.value) || 1)}
              min={1}
              className="w-20"
            />
            <Button
              variant="outline"
              onClick={handleAddWord}
              type="button"
              disabled={!newWord.trim()}
            >
              <PlusIcon className="h-4 w-4" />
              <span className="sr-only">Add Word</span>
            </Button>
          </div>

          {/* Word Entries List */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {wordEntries.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No words added yet
              </p>
            )}

            {wordEntries.map((entry, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-background p-2 rounded-md"
              >
                <div className="flex-1 font-medium">{entry.word}</div>
                <div className="text-sm text-muted-foreground">
                  × {entry.times}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(removeWordEntry(index))}
                  type="button"
                >
                  <TrashIcon className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateRandomString}
          className="w-full"
          size="lg"
          disabled={
            !includeSymbols &&
            !includeNumbers &&
            !includeUppercase &&
            wordEntries.length === 0
          }
        >
          <RefreshCwIcon className="h-4 w-4 mr-2" /> Generate Random String
        </Button>

        {/* Result Section */}
        {randomString && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated String</Label>
              {passwordStrength && (
                <div className="flex items-center gap-2">
                  <span className="text-xs">Strength:</span>
                  <div className="flex items-center gap-1">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        passwordStrength === "weak"
                          ? "bg-red-500"
                          : "bg-gray-300",
                        passwordStrength === "medium" ? "bg-yellow-500" : "",
                        passwordStrength === "strong" ? "bg-green-500" : ""
                      )}
                    />
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        passwordStrength === "weak" ? "bg-gray-300" : "",
                        passwordStrength === "medium"
                          ? "bg-yellow-500"
                          : "bg-gray-300",
                        passwordStrength === "strong" ? "bg-green-500" : ""
                      )}
                    />
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        passwordStrength === "strong"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      )}
                    />
                    <span className="text-xs capitalize">
                      {passwordStrength}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <Textarea
                value={randomString}
                readOnly
                className="h-24 font-mono text-lg pr-24"
              />
              <div className="absolute right-2 top-2 flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => copyToClipboard(randomString)}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    dispatch(setRandomString(shuffleString(randomString)))
                  }
                  title="Shuffle characters"
                >
                  <ShuffleIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {randomString.length} characters
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-1 text-xs text-muted-foreground">
        <p>
          Generated strings are created client-side and never stored or
          transmitted
        </p>
        <p>
          For maximum security, use at least 12 characters with a mix of
          uppercase, numbers, and symbols
        </p>
      </CardFooter>
    </Card>
  );
};

export default RandomStringGenerator;
