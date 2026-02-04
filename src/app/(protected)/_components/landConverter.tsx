"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
import { Ruler, ArrowRightLeft, Trash2, X, History, MapPin } from "lucide-react";

// Standard conversion factors to square meters (base unit)
const STANDARD_UNITS: Record<string, number> = {
  "sq_ft": 0.092903,
  "sq_m": 1,
  "sq_yd": 0.836127,
  "acre": 4046.86,
  "hectare": 10000,
  "guntha": 101.171,
  "cent": 40.4686,
  "ground": 222.967,
  "kanal": 505.857,
  "marla": 25.2929,
};

// State-specific overrides and additions
const STATE_DATA: Record<string, { name: string; label: string; units: Record<string, number> }> = {
  "RJ": {
    name: "RJ",
    label: "Rajasthan",
    units: {
      "bigha": 2529.29, // Pucca Bigha (Standard in many parts)
      "bigha_kachha": 1618.74, // Kachha Bigha (varies, approx 1000-1700 sq m)
      "biswa": 126.46, // 1/20 of Pucca Bigha
      "biswansi": 6.323, // 1/20 of Biswa
    }
  },
  "MH": {
    name: "MH",
    label: "Maharashtra",
    units: {
      "guntha": 101.17,
      "bigha": 2529.29,
    }
  },
  "UP": {
    name: "UP",
    label: "Uttar Pradesh",
    units: {
      "bigha": 2529.29,
      "biswa": 126.46,
      "biswansi": 6.323,
    }
  },
  "GJ": {
    name: "GJ",
    label: "Gujarat",
    units: {
      "bigha": 2391.98, // Approx 17565 sq ft
      "vigha": 2391.98,
      "guntha": 101.17,
    }
  },
  // Add fallback/standard layout
  "STD": {
    name: "STD",
    label: "Standard (Generic)",
    units: {}
  }
};

const UNIT_LABELS: Record<string, string> = {
  "sq_ft": "Square Feet",
  "sq_m": "Square Meters",
  "sq_yd": "Square Yards",
  "acre": "Acres",
  "hectare": "Hectares",
  "bigha": "Bigha (Pucca)",
  "bigha_kachha": "Bigha (Kachha)",
  "vigha": "Vigha",
  "biswa": "Biswa",
  "biswansi": "Biswansi",
  "guntha": "Guntha",
  "cent": "Cent",
  "ground": "Ground",
  "kanal": "Kanal",
  "marla": "Marla",
};

const getConversionFactor = (unit: string, state: string): number => {
  // Check state specific first
  if (STATE_DATA[state]?.units[unit]) {
    return STATE_DATA[state].units[unit];
  }
  // Fallback to standard
  if (STANDARD_UNITS[unit]) {
    return STANDARD_UNITS[unit];
  }
  // Default to 1 if unknown (shouldn't happen if configured correctly)
  return 1;
};

const convertLandUnit = (
  value: number,
  fromUnit: string,
  toUnit: string,
  state: string
): number => {
  if (fromUnit === toUnit) return value;

  const fromFactor = getConversionFactor(fromUnit, state);
  const toFactor = getConversionFactor(toUnit, state);

  // Convert to square meters first, then to target unit
  const sqMeters = value * fromFactor;
  const result = sqMeters / toFactor;

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
  onSelect,
}: {
  result: ConversionResult;
  onRemove: () => void;
  onSelect: (result: ConversionResult) => void;
}) => (
  <Card
    className="mb-2 transition-all duration-200 hover:shadow-sm cursor-pointer active:scale-[0.98]"
    onClick={() => onSelect(result)}
  >
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
          <div className="flex items-center gap-2 mt-1">
            <div className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded">
              <MapPin className="w-3 h-3" />
              {STATE_DATA[result.state]?.label || result.state}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(result.timestamp)}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
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
  const [selectedState, setSelectedState] = useState<string>("RJ");
  const [currentResult, setCurrentResult] = useState<number | null>(null);

  // Combine standard units with state-specific units for the dropdown
  const getAvailableUnits = (state: string) => {
    const stateUnits = STATE_DATA[state]?.units || {};
    const allUnitKeys = new Set([...Object.keys(STANDARD_UNITS), ...Object.keys(stateUnits)]);
    return Array.from(allUnitKeys).sort();
  };

  const handleConvert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) return;

    const result = convertLandUnit(value, fromUnit, toUnit, selectedState);
    setCurrentResult(result);

    addResult({
      inputValue: value,
      inputUnit: fromUnit,
      outputUnit: toUnit,
      outputValue: result,
      state: selectedState,
    });
  };

  const handleSelectResult = (result: ConversionResult) => {
    setInputValue(result.inputValue.toString());
    setFromUnit(result.inputUnit);
    setToUnit(result.outputUnit);

    // Handle migration from old full names to new short codes
    let stateCode = result.state;
    if (result.state === "Rajasthan") stateCode = "RJ";
    else if (result.state === "Maharashtra") stateCode = "MH";
    else if (result.state === "Uttar Pradesh") stateCode = "UP";
    else if (result.state === "Gujarat") stateCode = "GJ";
    else if (!STATE_DATA[result.state]) stateCode = "RJ"; // Default fallback

    setSelectedState(stateCode);
    setCurrentResult(result.outputValue);
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
      <SheetContent className="w-full sm:max-w-md p-4 sm:p-6 flex flex-col h-full overflow-hidden">
        <SheetHeader className="pb-2 sm:pb-4 flex-none">
          <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
            Land Converter
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-6 px-1 py-1">
          {/* Input Section */}
          <div className="space-y-4">

            {/* Input and State Row */}
            <div className="flex gap-2 items-end">
              <div className="flex-[0.8] basis-[80%] min-w-0 p-0.5">
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

              <div className="flex-[0.2] basis-[20%] min-w-[70px] p-0.5">
                <Label className="text-sm">State</Label>
                <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setCurrentResult(null); }}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(STATE_DATA).map((stateData) => (
                      <SelectItem key={stateData.name} value={stateData.name}>
                        {stateData.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
              <div>
                <Label className="text-sm">From</Label>
                <Select value={fromUnit} onValueChange={(v) => { setFromUnit(v); setCurrentResult(null); }}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableUnits(selectedState).map((key) => (
                      <SelectItem key={key} value={key}>
                        {UNIT_LABELS[key] || key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-[10px] text-muted-foreground mt-1 truncate">
                  1 {UNIT_LABELS[fromUnit]} = {formatNumber(getConversionFactor(fromUnit, selectedState))} sq m
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwapUnits}
                className="mb-6"
                title="Swap units"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>

              <div>
                <Label className="text-sm">To</Label>
                <Select value={toUnit} onValueChange={(v) => { setToUnit(v); setCurrentResult(null); }}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableUnits(selectedState).map((key) => (
                      <SelectItem key={key} value={key}>
                        {UNIT_LABELS[key] || key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-[10px] text-muted-foreground mt-1 truncate">
                  1 {UNIT_LABELS[toUnit]} = {formatNumber(getConversionFactor(toUnit, selectedState))} sq m
                </div>
              </div>
            </div>

            <Button onClick={handleConvert} className="w-full" disabled={!inputValue}>
              Convert
            </Button>

            {/* Current Result */}
            {currentResult !== null && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="text-center w-full overflow-hidden">
                    <div className="text-sm text-muted-foreground">Result</div>
                    <div className="text-2xl font-bold text-primary mt-1 break-words leading-tight">
                      {formatNumber(currentResult)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {UNIT_LABELS[toUnit]}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Based on {selectedState} standards
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* History Section */}
          <div>
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-background py-2 z-10">
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

            <div className="min-h-[100px]">
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
                <div className="pr-1">
                  {results.map((result) => (
                    <ResultItem
                      key={result.id}
                      result={result}
                      onRemove={() => removeResult(result.id)}
                      onSelect={handleSelectResult}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
