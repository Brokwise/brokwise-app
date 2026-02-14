"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, History, MapPin, Ruler, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader } from "@/components/ui/layout";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  STATE_DATA,
  UNIT_LABELS,
  STANDARD_UNITS,
  convertLandUnit,
  formatNumber,
  formatDate,
  getConversionFactor,
} from "@/lib/landConverter";
import {
  useLandConverterStore,
  ConversionResult,
} from "@/stores/landConverterStore";
import { DisclaimerNotice } from "@/components/ui/disclaimer-notice";
import { DISCLAIMER_TEXT } from "@/constants/disclaimers";

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
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm leading-tight">
            <span className="font-medium break-words text-wrap">
              {formatNumber(result.inputValue)} {UNIT_LABELS[result.inputUnit]}
            </span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRightLeft className="w-3 h-3 flex-shrink-0 hidden sm:block" />
              <span className="text-xs sm:hidden">to</span>
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

export default function LandConvertorPage() {
  const { results, addResult, clearResults, removeResult } = useLandConverterStore();

  const [selectedState, setSelectedState] = useState<string>("RJ");
  const [fromUnit, setFromUnit] = useState<string>("sq_ft");
  const [toUnit, setToUnit] = useState<string>("sq_m");
  const [inputValue, setInputValue] = useState<string>("");
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

  const handleSwap = () => {
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
    <PageShell className="max-w-3xl mx-auto">
      <PageHeader
        title="Land Area Converter"
        description="Convert between Indian and global land area units instantly."
      />
      <DisclaimerNotice text={DISCLAIMER_TEXT.landConverter} />

      <div className="space-y-8 mt-6">
        {/* Main Converter Card */}
        <div className="border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-8">
          {/* Input and State Row */}
          <div className="flex flex-col-reverse md:flex-row gap-4 md:items-end">
            <div className="w-full md:flex-[0.75] min-w-0">
              <Label htmlFor="land-value" className="text-base font-medium text-muted-foreground ml-1 mb-2 block">
                Value
              </Label>
              <Input
                id="land-value"
                type="number"
                placeholder="Enter land area"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="h-14 bg-background border-input rounded-xl text-lg px-4 w-full"
                min="0"
                step="any"
              />
            </div>

            <div className="w-full md:flex-[0.25] md:min-w-[140px]">
              <Label className="text-base font-medium text-muted-foreground ml-1 mb-2 block">State</Label>
              <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setCurrentResult(null); }}>
                <SelectTrigger className="h-14 bg-background border-input rounded-xl w-full text-lg px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(STATE_DATA).map((stateData) => (
                    <SelectItem key={stateData.name} value={stateData.name} className="text-base">
                      {stateData.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
            <div className="w-full space-y-2">
              <label className="text-base font-medium text-muted-foreground ml-1">
                From
              </label>
              <Select value={fromUnit} onValueChange={(v) => { setFromUnit(v); setCurrentResult(null); }}>
                <SelectTrigger className="w-full h-14 bg-background border-input rounded-xl text-lg px-4">
                  <SelectValue placeholder="Unit" className="truncate" />
                </SelectTrigger>
                <SelectContent className="h-80">
                  {getAvailableUnits(selectedState).map((key) => (
                    <SelectItem key={key} value={key} className="text-base">
                      {UNIT_LABELS[key] || key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground ml-1 truncate">
                1 {UNIT_LABELS[fromUnit]} = {formatNumber(getConversionFactor(fromUnit, selectedState))} sq m
              </div>
            </div>

            <div className="flex justify-center md:block md:mb-8">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 hover:scale-105 transition-all rotate-90 md:rotate-0"
                onClick={handleSwap}
              >
                <ArrowRightLeft className="h-5 w-5" />
              </Button>
            </div>

            <div className="w-full space-y-2">
              <label className="text-base font-medium text-muted-foreground ml-1">
                To
              </label>
              <Select value={toUnit} onValueChange={(v) => { setToUnit(v); setCurrentResult(null); }}>
                <SelectTrigger className="w-full h-14 bg-background border-input rounded-xl text-lg px-4">
                  <SelectValue placeholder="Unit" className="truncate" />
                </SelectTrigger>
                <SelectContent className="h-80">
                  {getAvailableUnits(selectedState).map((key) => (
                    <SelectItem key={key} value={key} className="text-base">
                      {UNIT_LABELS[key] || key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground ml-1 truncate">
                1 {UNIT_LABELS[toUnit]} = {formatNumber(getConversionFactor(toUnit, selectedState))} sq m
              </div>
            </div>
          </div>

          <Button
            onClick={handleConvert}
            className="w-full h-14 rounded-xl text-xl font-semibold shadow-md hover:shadow-lg transition-all"
            disabled={!inputValue}
          >
            Convert
          </Button>

          {/* Result */}
          {currentResult !== null && (
            <div className="mt-8 p-8 rounded-xl bg-primary/5 border border-primary/10 text-center overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <p className="text-base font-medium text-muted-foreground mb-3">Result</p>
              <p className="text-4xl md:text-5xl font-bold text-primary break-words leading-tight tracking-tight">{formatNumber(currentResult)}</p>
              <p className="text-xl font-medium text-muted-foreground mt-3">{UNIT_LABELS[toUnit]}</p>
              <div className="text-sm text-muted-foreground mt-4 bg-background/80 inline-block px-4 py-1.5 rounded-full border shadow-sm">
                Based on {STATE_DATA[selectedState]?.label || selectedState} standards
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="mt-8 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-full">
                <History className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-xl font-semibold">Recent Conversions</span>
              {results.length > 0 && (
                <span className="text-sm font-medium text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                  {results.length}
                </span>
              )}
            </div>
            {results.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearResults}
                className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          <div className="min-h-[100px]">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border border-dashed hover:border-solid transition-colors">
                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                  <Ruler className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  No conversions yet
                </p>
                <p className="text-muted-foreground mt-2 max-w-[250px]">
                  Your conversion history will appear here automatically
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
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
    </PageShell>
  );
}
