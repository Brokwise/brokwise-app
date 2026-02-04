"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ConversionResult {
  id: string;
  inputValue: number;
  inputUnit: string;
  outputUnit: string;
  outputValue: number;
  state: string;
  timestamp: number;
}

interface LandConverterState {
  results: ConversionResult[];
  isOpen: boolean;
}

interface LandConverterActions {
  addResult: (result: Omit<ConversionResult, "id" | "timestamp">) => void;
  clearResults: () => void;
  removeResult: (id: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

type LandConverterStore = LandConverterState & LandConverterActions;

const generateId = () =>
  `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const useLandConverterStore = create<LandConverterStore>()(
  persist(
    (set) => ({
      // State
      results: [],
      isOpen: false,

      // Actions
      addResult: (result) => {
        const newResult: ConversionResult = {
          ...result,
          id: generateId(),
          timestamp: Date.now(),
        };

        set((state) => ({
          results: [newResult, ...state.results].slice(0, 20), // Keep last 20 results
        }));
      },

      clearResults: () => {
        set({ results: [] });
      },

      removeResult: (id) => {
        set((state) => ({
          results: state.results.filter((r) => r.id !== id),
        }));
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },
    }),
    {
      name: "brokwise-land-converter",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist results, not UI state like isOpen
        results: state.results,
      }),
    }
  )
);
