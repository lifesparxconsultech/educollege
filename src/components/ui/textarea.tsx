import * as React from "react"

const cn = (...classes) => classes.filter(Boolean).join(" ");

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCharCount?: boolean;
  maxChars?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCharCount = false, maxChars, value, onChange, ...props }, ref) => {
    const isControlled = value !== undefined;

    const [internalValue, setInternalValue] = React.useState("");

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      if (maxChars && newValue.length > maxChars) return;

      if (!isControlled) {
        setInternalValue(newValue);
      }

      if (onChange) {
        onChange(e);
      }
    };

    const displayValue = isControlled ? value : internalValue;
    const currentLength = String(displayValue).length;

    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          value={String(displayValue)}
          onChange={handleChange}
          {...props}
        />
        {showCharCount && (
          <div className="text-right text-xs text-gray-500 mt-1">
            {currentLength} {maxChars && `/${maxChars}`}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
