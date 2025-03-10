import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import {
  setInputField,
  toggleSendType,
  setTestAfter,
  setIsSeeds,
  setDataSeeds,
  setReturnPath,
  setFromPath,
  setDeployId,
  setOffer,
  setShowResults,
} from "./detailsSlice";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const Details: React.FC = () => {
  const dispatch = useDispatch();
  const {
    inputField,
    sendTypes,
    testAfter,
    isSeeds,
    dataSeeds,
    returnPath,
    fromPath,
    deployId,
    offer,
    showResults,
  } = useSelector((state: RootState) => state.details);

  const [copied, setCopied] = useState(false);

  // Generate details and show results
  const generateDetails = () => {
    dispatch(setShowResults(true));
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

  // Format details for display
  const formattedDetails = `**********************************************
  ${inputField}
**********************************************
Send Type : ${sendTypes.join(", ")}
Test After : ${testAfter}% INBOX
Data/Seeds : ${dataSeeds}% ${isSeeds ? "SEEDS" : "DATA"}
Return Path: ${returnPath}
From Path: ${fromPath}
Deploy ID : ${deployId}
Offer : ${offer}`;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-2xl">Details</CardTitle>
        <CardDescription>Display formatted input details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Field */}
        <div>
          <Label
            className="text-sm font-medium mb-2 block"
            htmlFor="inputField"
          >
            INPUT
          </Label>
          <Textarea
            id="inputField"
            value={inputField}
            onChange={(e) => setInputField(e.target.value)}
            className="w-full h-24"
            placeholder="Enter input data here..."
          />
        </div>

        {/* Send Type Selection */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Send Type</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={sendTypes.includes("DKIM") ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch(toggleSendType("DKIM"))}
              className="rounded-md"
            >
              DKIM
            </Button>
            <Button
              variant={sendTypes.includes("SPF") ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch(toggleSendType("SPF"))}
              className="rounded-md"
            >
              SPF
            </Button>
            <Button
              variant={sendTypes.includes("DMARC") ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch(toggleSendType("DMARC"))}
              className="rounded-md"
            >
              DMARC
            </Button>
            <Button
              variant={sendTypes.includes("NEUTRAL") ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch(toggleSendType("NEUTRAL"))}
              className="rounded-md"
            >
              NEUTRAL
            </Button>
          </div>
        </div>

        {/* Test After Setting with Progress Bar */}
        <div>
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium mb-2">Test After</Label>
            <span className="text-sm font-medium">{testAfter}% INBOX</span>
          </div>
          <div className="space-y-2">
            <div className="flex">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => {
                const value = step * 10;
                return (
                  <div
                    key={step}
                    className={`h-2 flex-1 ${
                      step > 0 ? "ml-0.5" : ""
                    } rounded-sm cursor-pointer ${
                      value <= testAfter ? "bg-primary" : "bg-muted"
                    }`}
                    onClick={() => dispatch(setTestAfter(value))}
                  ></div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Data/Seeds Setting with Progress Bar */}
        <div>
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium mb-2">Data/Seeds</Label>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                className={`px-3 py-1 ${
                  isSeeds ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => dispatch(setIsSeeds(true))}
              >
                SEEDS
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`px-3 py-1 ${
                  !isSeeds ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => dispatch(setIsSeeds(false))}
              >
                DATA
              </Button>
              <span className="text-sm font-medium">{dataSeeds}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => {
                const value = step * 10;
                return (
                  <div
                    key={step}
                    className={`h-2 flex-1 ${
                      step > 0 ? "ml-0.5" : ""
                    } rounded-sm cursor-pointer ${
                      value <= dataSeeds ? "bg-primary" : "bg-muted"
                    }`}
                    onClick={() => dispatch(setDataSeeds(value))}
                  ></div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Return Path */}
          <div>
            <Label
              className="text-sm font-medium mb-2 block"
              htmlFor="returnPath"
            >
              Return Path
            </Label>
            <Input
              id="returnPath"
              value={returnPath}
              onChange={(e) => dispatch(setReturnPath(e.target.value))}
              className="w-full"
            />
          </div>

          {/* From Path */}
          <div>
            <Label
              className="text-sm font-medium mb-2 block"
              htmlFor="fromPath"
            >
              From Path
            </Label>
            <Input
              id="fromPath"
              value={fromPath}
              onChange={(e) => dispatch(setFromPath(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Deploy ID */}
          <div>
            <Label
              className="text-sm font-medium mb-2 block"
              htmlFor="deployId"
            >
              Deploy ID
            </Label>
            <Input
              id="deployId"
              value={deployId}
              onChange={(e) => dispatch(setDeployId(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Offer */}
          <div>
            <Label className="text-sm font-medium mb-2 block" htmlFor="offer">
              Offer
            </Label>
            <Textarea
              id="offer"
              value={offer}
              onChange={(e) => dispatch(setOffer(e.target.value))}
              className="w-full h-24"
            />
          </div>
        </div>
        {/* Generate Button */}
        <Button className="w-full" onClick={generateDetails}>
          Generate Details
        </Button>

        {/* Results Display */}
        {showResults && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm font-medium">Details Summary</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(formattedDetails)}
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 mr-1" />
                ) : (
                  <CopyIcon className="h-4 w-4 mr-1" />
                )}
                {copied ? "Copied" : "Copy Results"}
              </Button>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <div className="text-sm font-mono whitespace-pre-wrap">
                {formattedDetails}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Details;
