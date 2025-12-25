"use client";

import * as React from "react";
import { Check, Loader2, MapPin, Search, X } from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type AddressSuggestion = {
  id: string;
  place_name: string;
  center?: [number, number];
  context?: { id: string; text: string }[];
};

type Props = {
  valueLabel: string;
  valueId: string;
  onSelect: (item: AddressSuggestion) => void;
  onClear?: () => void;
  onSearchError?: (message: string) => void;
  placeholder?: string;
  /** Class applied to the clickable trigger control (button). */
  className?: string;
  /** Class applied to the outer wrapper (useful when composing layout). */
  containerClassName?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
};

export function AddressAutocomplete({
  valueLabel,
  valueId,
  onSelect,
  onClear,
  onSearchError,
  placeholder = "Search address and select…",
  searchPlaceholder = "Type an address…",
  className,
  containerClassName,
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 400);

  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<AddressSuggestion[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const lastEmittedErrorRef = React.useRef<string | null>(null);
  const onSearchErrorRef = React.useRef(onSearchError);

  React.useEffect(() => {
    onSearchErrorRef.current = onSearchError;
  }, [onSearchError]);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!debouncedQuery || debouncedQuery.trim().length < 3) {
        setItems([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/places?q=${encodeURIComponent(debouncedQuery.trim())}&limit=5`,
          { cache: "no-store" }
        );
        let data: { features?: AddressSuggestion[]; error?: string } = {};
        try {
          data = (await res.json()) as {
            features?: AddressSuggestion[];
            error?: string;
          };
        } catch {
          data = {};
        }

        if (!res.ok) {
          const msg =
            data?.error ||
            `Address search failed (${res.status}). Please enter manually.`;
          if (!cancelled) {
            setItems([]);
            setError(msg);
            const cb = onSearchErrorRef.current;
            if (cb && lastEmittedErrorRef.current !== msg) {
              lastEmittedErrorRef.current = msg;
              cb(msg);
            }
          }
          return;
        }

        if (!cancelled) setItems(data.features ?? []);
      } catch {
        const msg = "Address search failed. Please enter manually.";
        if (!cancelled) {
          setItems([]);
          setError(msg);
          const cb = onSearchErrorRef.current;
          if (cb && lastEmittedErrorRef.current !== msg) {
            lastEmittedErrorRef.current = msg;
            cb(msg);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const showLabel = valueLabel?.trim() ? valueLabel.trim() : placeholder;

  return (
    <div className={cn("flex items-center gap-2", containerClassName)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !valueLabel && "text-muted-foreground",
              className
            )}
          >
            <span className="truncate">{showLabel}</span>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(520px,calc(100vw-2rem))] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {loading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto h-4 w-4 animate-spin mb-2" />
                  Searching…
                </div>
              )}
              {!loading && !!error && (
                <div className="py-4 px-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {!loading && !error && items.length === 0 && query.trim().length > 2 && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
              <CommandGroup>
                {items.map((item) => {
                  const selected = !!valueId && item.id === valueId;
                  return (
                    <CommandItem
                      key={item.id}
                      value={item.place_name}
                      onSelect={() => {
                        onSelect(item);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      <span className="flex-1">{item.place_name}</span>
                      {selected && (
                        <Check className="ml-2 h-4 w-4 opacity-70" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {!!valueId && !!onClear && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClear}
          disabled={disabled}
          aria-label="Clear selected address"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
