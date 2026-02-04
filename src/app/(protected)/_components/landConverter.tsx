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
import {
  STATE_DATA,
  UNIT_LABELS,
  STANDARD_UNITS,
  convertLandUnit,
  formatNumber,
  formatDate,
  getConversionFactor,
} from "@/lib/landConverter";

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
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-0.5 text-sm leading-snug">
            <span className="font-medium break-words text-wrap">
              {formatNumber(result.inputValue)} {UNIT_LABELS[result.inputUnit]}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs py-0.5">
              <ArrowRightLeft className="w-3 h-3 flex-shrink-0" />
              <span>to</span>
            </div>
            <span className="font-semibold text-primary break-words text-wrap">
              {formatNumber(result.outputValue)} {UNIT_LABELS[result.outputUnit]}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded whitespace-nowrap">
              <MapPin className="w-3 h-3" />
              {STATE_DATA[result.state]?.label || result.state}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
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
          className="h-7 w-7 flex-shrink-0 -mr-1 -mt-1"
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
            <div className="flex flex-col-reverse sm:flex-row gap-4 items-end">
              <div className="w-full sm:flex-[0.75] min-w-0 p-0.5">
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

              <div className="w-full sm:flex-[0.25] sm:min-w-[80px] p-0.5">
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

            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-2 items-end">
              <div className="w-full">
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

              <div className="flex justify-center sm:block sm:mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSwapUnits}
                  className="rotate-90 sm:rotate-0"
                  title="Swap units"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
              </div>

              <div className="w-full">
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
