// components/ui/MultiSelectRadix.tsx

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const options = [
  "10th pass",
  "12th pass",
  "Undergraduate",
  "Postgraduate",
  "Diploma",
];

export function MultiSelectRadix({ value, onChange }: {
  value: string[],
  onChange: (val: string[]) => void
}) {
  const [open, setOpen] = useState(false);

  const toggleOption = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const removeOption = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div
          className="flex flex-wrap items-center min-h-[2.5rem] w-full rounded-md border px-2 py-1 text-sm cursor-pointer gap-1"
        >
          {value.length === 0 && <span className="text-muted-foreground">Select eligibility</span>}
          {value.map((item) => (
            <div
              key={item}
              className="flex items-center bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs"
            >
              {item}
              <button
                type="button"
                className="ml-1 hover:text-red-500"
                onClick={() => removeOption(item)}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <ChevronDown className="ml-auto w-4 h-4 text-muted-foreground" />
        </div>
      </Popover.Trigger>
      <Popover.Content
        className="z-50 w-[200px] rounded-md border bg-popover p-2 shadow-md"
        align="start"
      >
        {options.map((option) => (
          <div
            key={option}
            onClick={() => toggleOption(option)}
            className={cn(
              "flex items-center justify-between px-2 py-1 cursor-pointer rounded hover:bg-accent",
              value.includes(option) && "bg-accent"
            )}
          >
            {option}
            {value.includes(option) && <Check className="w-4 h-4" />}
          </div>
        ))}
      </Popover.Content>
    </Popover.Root>
  );
}
