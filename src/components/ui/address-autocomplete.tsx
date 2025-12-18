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
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
};

export function AddressAutocomplete({
  valueLabel,
  valueId,
  onSelect,
  onClear,
  placeholder = "Search address and select…",
  searchPlaceholder = "Type an address…",
  className,
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 400);

  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<AddressSuggestion[]>([]);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!debouncedQuery || debouncedQuery.trim().length < 3) {
        setItems([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/places?q=${encodeURIComponent(debouncedQuery.trim())}&limit=5`,
          { cache: "no-store" }
        );
        const data = (await res.json()) as { features?: AddressSuggestion[] };
        if (!cancelled) setItems(data.features ?? []);
      } catch {
        if (!cancelled) setItems([]);
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
    <div className={cn("flex items-center gap-2", className)}>
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
              !valueLabel && "text-muted-foreground"
            )}
          >
            <span className="truncate">{showLabel}</span>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[520px] p-0" align="start">
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
              {!loading && items.length === 0 && query.trim().length > 2 && (
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
