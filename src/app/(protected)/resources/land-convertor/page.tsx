"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const UNIT_FACTORS: Record<string, number> = {
  "Square Meter": 1,
  "Square Feet": 0.092903,
  "Square Yard": 0.836127,
  Acre: 4046.86,
  Hectare: 10000,
  "Square Kilometer": 1000000,
  "Square Mile": 2589988.11,
  "Square Inch": 0.00064516,
  Guntha: 101.17,
  Bigha: 2529.28, // Standard Rajasthan Pucca Bigha approx
  Biswa: 126.46, // 1/20 of Bigha
  Katha: 66.89,
  Chatak: 4.18,
  Killa: 4046.86,
  Decimal: 40.47,
  Cent: 40.47,
  "Square Karam": 2.81,
  Lessa: 6.69,
  Pura: 10117.14, // Approx 4 Bighas in some contexts, needs verification but using placeholder based on common ratios
};

const UNITS = Object.keys(UNIT_FACTORS).sort();

export default function LandConvertorPage() {
  const [region, setRegion] = useState("Rajasthan");
  const [fromUnit, setFromUnit] = useState("Square Meter");
  const [toUnit, setToUnit] = useState("Square Feet");
  const [inputValue, setInputValue] = useState<string>("1");
  const [result, setResult] = useState<string>("");
  const convert = useCallback(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setResult("Invalid Input");
      return;
    }

    const fromFactor = UNIT_FACTORS[fromUnit];
    const toFactor = UNIT_FACTORS[toUnit];

    if (!fromFactor || !toFactor) {
      setResult("Unit not supported");
      return;
    }

    // Convert to Square Meter first
    const valInSqMeter = val * fromFactor;
    // Convert from Square Meter to Target Unit
    const finalVal = valInSqMeter / toFactor;

    // Format result to avoid long decimals but keep precision
    const formatted = parseFloat(finalVal.toFixed(6));
    setResult(`${val} ${fromUnit} = ${formatted} ${toUnit}`);
  }, [inputValue, fromUnit, toUnit]);

  useEffect(() => {
    convert();
  }, [inputValue, fromUnit, toUnit, convert]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="flex items-center justify-center min-h-full bg-background p-4">
      <div className="w-full max-w-lg p-6 rounded-3xl bg-card border border-border shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-normal mb-2">Land Area Converter</h1>
          <p className="text-muted-foreground text-sm">
            Convert between Indian and global land area units instantly.
          </p>
        </div>

        <div className="space-y-6">
          {/* Region Selection */}
          <div className="space-y-2">
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full h-12 bg-background border-input rounded-xl">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                <SelectItem value="General">General (Standard)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">
                From
              </label>
              <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger className="w-full h-12 bg-background border-input rounded-xl">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="h-60">
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pb-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 bg-primary/20 border-primary/20 text-primary-foreground hover:bg-primary/30"
                onClick={handleSwap}
              >
                <ArrowRightLeft className="h-4 w-4 text-primary" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">
                To
              </label>
              <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger className="w-full h-12 bg-background border-input rounded-xl">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="h-60">
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">
              Value
            </label>
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-12 bg-background border-input rounded-xl"
            />
          </div>

          <div className="mt-8 p-4 rounded-xl bg-primary/20 border border-primary/20 text-center">
            <p className="text-lg font-semibold text-primary">{result}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
