"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLandConverterStore,
  ConversionResult,
} from "@/stores/landConverterStore";
import { Ruler, ArrowRightLeft, Trash2, X, History } from "lucide-react";

// Conversion factors to square meters (base unit)
const UNIT_TO_SQ_METERS: Record<string, number> = {
  "sq_ft": 0.092903,
  "sq_m": 1,
  "sq_yd": 0.836127,
  "acre": 4046.86,
  "hectare": 10000,
  "bigha": 2529.29, // Standard bigha (varies by region)
  "biswa": 125.419, // 1/20 of bigha
  "guntha": 101.171,
  "cent": 40.4686,
  "ground": 222.967,
  "kanal": 505.857,
  "marla": 25.2929,
};

const UNIT_LABELS: Record<string, string> = {
  "sq_ft": "Square Feet",
  "sq_m": "Square Meters",
  "sq_yd": "Square Yards",
  "acre": "Acres",
  "hectare": "Hectares",
  "bigha": "Bigha",
  "biswa": "Biswa",
  "guntha": "Guntha",
  "cent": "Cent",
  "ground": "Ground",
  "kanal": "Kanal",
  "marla": "Marla",
};

const convertLandUnit = (
  value: number,
  fromUnit: string,
  toUnit: string
): number => {
  if (fromUnit === toUnit) return value;

  // Convert to square meters first, then to target unit
  const sqMeters = value * UNIT_TO_SQ_METERS[fromUnit];
  const result = sqMeters / UNIT_TO_SQ_METERS[toUnit];

  return result;
};

const formatNumber = (num: number): string => {
  if (num === 0) return "0";
  if (Math.abs(num) >= 1) {
    return num.toLocaleString("en-IN", {
      maximumFractionDigits: 4,
      minimumFractionDigits: 0,
    });
  }
  return num.toPrecision(6);
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  return date.toLocaleDateString("en-IN");
};

const ResultItem = ({
  result,
  onRemove,
}: {
  result: ConversionResult;
  onRemove: () => void;
}) => (
  <Card className="mb-2 transition-all duration-200 hover:shadow-sm">
    <CardContent className="p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium truncate">
              {formatNumber(result.inputValue)} {UNIT_LABELS[result.inputUnit]}
            </span>
            <ArrowRightLeft className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
            <span className="font-semibold text-primary truncate">
              {formatNumber(result.outputValue)} {UNIT_LABELS[result.outputUnit]}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDate(result.timestamp)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-7 w-7 flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const LandConverter = () => {
  const { results, isOpen, addResult, clearResults, removeResult, setIsOpen } =
    useLandConverterStore();

  const [inputValue, setInputValue] = useState<string>("");
  const [fromUnit, setFromUnit] = useState<string>("sq_ft");
  const [toUnit, setToUnit] = useState<string>("sq_m");
  const [currentResult, setCurrentResult] = useState<number | null>(null);

  const handleConvert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) return;

    const result = convertLandUnit(value, fromUnit, toUnit);
    setCurrentResult(result);

    addResult({
      inputValue: value,
      inputUnit: fromUnit,
      outputUnit: toUnit,
      outputValue: result,
    });
  };

  const handleSwapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setCurrentResult(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setCurrentResult(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConvert();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          title="Land Converter"
        >
          <Ruler className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-[92vw] md:w-full p-4 sm:p-6 max-h-[80vh] md:max-h-[100vh] overflow-auto my-auto rounded-l-2xl">
        <SheetHeader className="pb-2 sm:pb-4">
          <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
            Land Converter
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* Input Section */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="land-value" className="text-sm">
                Enter Value
              </Label>
              <Input
                id="land-value"
                type="number"
                placeholder="Enter land area"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="mt-1.5"
                min="0"
                step="any"
              />
            </div>

            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
              <div>
                <Label className="text-sm">From</Label>
                <Select value={fromUnit} onValueChange={(v) => { setFromUnit(v); setCurrentResult(null); }}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwapUnits}
                className="mb-0.5"
                title="Swap units"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>

              <div>
                <Label className="text-sm">To</Label>
                <Select value={toUnit} onValueChange={(v) => { setToUnit(v); setCurrentResult(null); }}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleConvert} className="w-full" disabled={!inputValue}>
              Convert
            </Button>

            {/* Current Result */}
            {currentResult !== null && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Result</div>
                    <div className="text-2xl font-bold text-primary mt-1">
                      {formatNumber(currentResult)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {UNIT_LABELS[toUnit]}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* History Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recent Conversions</span>
                {results.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({results.length})
                  </span>
                )}
              </div>
              {results.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearResults}
                  className="h-7 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <ScrollArea className="h-[calc(100vh-480px)] min-h-[120px]">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Ruler className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No conversions yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your conversion history will appear here
                  </p>
                </div>
              ) : (
                <div className="pr-4">
                  {results.map((result) => (
                    <ResultItem
                      key={result.id}
                      result={result}
                      onRemove={() => removeResult(result.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
