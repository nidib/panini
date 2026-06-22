"use client";

import { createContext, useContext } from "react";

import { Button } from "src/components/ui/button";
import { cn } from "src/lib/utils";

type ToggleGroupContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroup() {
  const context = useContext(ToggleGroupContext);

  if (!context) {
    throw new Error("ToggleGroupItem must be used within a ToggleGroup.");
  }

  return context;
}

export function ToggleGroup({
  value,
  onValueChange,
  children,
  className,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange }}>
      <div
        data-slot="button-group"
        className={cn(
          "inline-flex items-center justify-center gap-0 rounded-lg border p-1 shadow-sm",
          disabled && "opacity-60 pointer-events-none",
          className,
        )}
        role="radiogroup"
        aria-disabled={disabled}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

export function ToggleGroupItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { value: selectedValue, onValueChange } = useToggleGroup();
  const isActive = selectedValue === value;

  return (
    <Button
      type="button"
      aria-pressed={isActive}
      variant={isActive ? "default" : "ghost"}
      data-slot="button-group-item"
      onClick={() => onValueChange(value)}
      className={cn(
        "rounded-sm focus-visible:z-10",
        isActive && "shadow-sm",
        className,
      )}
    >
      {children}
    </Button>
  );
}
