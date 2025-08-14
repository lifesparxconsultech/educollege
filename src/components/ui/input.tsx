import * as React from "react"
import { X, Plus } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ')

interface InputProps extends React.ComponentProps<"input"> {
  showCharCount?: boolean;
  maxChars?: number;
  displayMultipleInput?: boolean;
  onMultipleChange?: (values: string[]) => void;
  multipleValue?: string[];
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    showCharCount = false,
    maxChars,
    value,
    onChange,
    displayMultipleInput = false,
    onMultipleChange,
    multipleValue = [''],
    placeholder,
    ...props
  }, ref) => {
    const [singleValue, setSingleValue] = React.useState(value || "")
    const [items, setItems] = React.useState(multipleValue.length > 0 ? multipleValue : [''])

    React.useEffect(() => {
      if (displayMultipleInput && multipleValue) {
        setItems(multipleValue.length > 0 ? multipleValue : [''])
      }
    }, [multipleValue, displayMultipleInput])

    const currentValue = value !== undefined ? value : singleValue
    const currentLength = String(currentValue).length

    // Single input handler
    const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (maxChars && newValue.length > maxChars) return

      if (value === undefined) {
        setSingleValue(newValue)
      }
      onChange?.(e)
    }

    // Multiple input handlers
    const canAddItem = () => {
      return items.length > 0 && items[items.length - 1].trim() !== ''
    }

    const addItem = () => {
      const newItems = [...items, '']
      setItems(newItems)
    }

    const removeItem = (index) => {
      if (items.length > 1) {
        const newItems = items.filter((_, i) => i !== index)
        setItems(newItems)
        // Only send non-empty values to parent
        const filteredItems = newItems.filter(item => item.trim() !== '')
        onMultipleChange?.(filteredItems)
      }
    }

    const updateItem = (index, val) => {
      if (maxChars && val.length > maxChars) return
      const newItems = [...items]
      newItems[index] = val
      setItems(newItems)
      // Only send non-empty values to parent
      const filteredItems = newItems.filter(item => item.trim() !== '')
      onMultipleChange?.(filteredItems)
    }

    // Multiple input mode
    if (displayMultipleInput) {
      return (
        <div className="w-full">
          {items.map((item, index) => {
            const itemLength = String(item).length
            return (
              <div key={index} className="mb-2">
                <div className="flex gap-2">
                  <input
                    type={type}
                    className={cn(
                      "flex h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50",
                      className
                    )}
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder={placeholder}
                    {...props}
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!canAddItem()}
                    className={`p-2 rounded ${canAddItem()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500'
                      }`}
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className={`p-2 rounded ${items.length === 1
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                  >
                    <X size={12} />
                  </button>
                </div>
                {showCharCount && (
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {itemLength}{maxChars && `/${maxChars}`}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )
    }

    // Single input mode
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50",
            className
          )}
          ref={ref}
          value={currentValue}
          onChange={handleSingleChange}
          placeholder={placeholder}
          {...props}
        />
        {showCharCount && (
          <div className="text-right text-xs text-gray-500 mt-1">
            {currentLength}{maxChars && `/${maxChars}`}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
export { Input }



