import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff, Search, AlertCircle, CheckCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg border bg-background text-foreground transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border hover:border-border-strong focus:border-primary",
        filled: "bg-muted border-transparent hover:bg-muted/80 focus:bg-background focus:border-primary",
        ghost: "border-transparent hover:bg-muted/50 focus:bg-background focus:border-primary",
        destructive: "border-destructive/50 focus:border-destructive",
        success: "border-success/50 focus:border-success",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-4 text-base",
        lg: "h-12 px-5 text-lg",
      },
      state: {
        default: "",
        error: "border-destructive focus:border-destructive",
        success: "border-success focus:border-success",
        warning: "border-warning focus:border-warning",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

// Create a clean interface that avoids HTML attribute conflicts
type InputVariantProps = VariantProps<typeof inputVariants>

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariantProps['variant']
  size?: InputVariantProps['size']
  state?: InputVariantProps['state']
  label?: string
  description?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type,
    variant,
    size,
    state,
    label,
    description,
    error,
    success,
    leftIcon,
    rightIcon,
    containerClassName,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type
    
    // Determine state based on error/success props
    const inputState = error ? "error" : success ? "success" : state

    const inputId = props.id || `input-${React.useId()}`

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-body-sm font-medium text-foreground mb-2"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant, size, state: inputState }),
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              className
            )}
            ref={ref}
            id={inputId}
            aria-describedby={
              description ? `${inputId}-description` : 
              error ? `${inputId}-error` : 
              success ? `${inputId}-success` : undefined
            }
            aria-invalid={error ? "true" : undefined}
            {...props}
          />
          
          {/* Right side icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {inputState === "error" && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            {inputState === "success" && (
              <CheckCircle className="h-4 w-4 text-success" />
            )}
            {rightIcon && !isPassword && (
              <div className="text-muted-foreground">
                {rightIcon}
              </div>
            )}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus-ring"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Help text, error, or success message */}
        {(description || error || success) && (
          <div className="mt-2 space-y-1">
            {description && !error && !success && (
              <p id={`${inputId}-description`} className="text-caption text-muted-foreground">
                {description}
              </p>
            )}
            {error && (
              <p id={`${inputId}-error`} className="text-caption text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {success && !error && (
              <p id={`${inputId}-success`} className="text-caption text-success flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {success}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Professional Search Input Component
interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void
  clearable?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, clearable = true, className, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value || "")
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      onSearch?.(newValue)
      props.onChange?.(e)
    }

    const handleClear = () => {
      setValue("")
      onSearch?.("")
    }

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={clearable && value ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus-ring"
            aria-label="Clear search"
          >
            ×
          </button>
        ) : undefined}
        value={value}
        onChange={handleChange}
        placeholder="Search..."
        className={cn("search-cancel:appearance-none", className)}
        {...props}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"

// Professional Textarea Component - clean separation
interface TextareaProps 
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: InputVariantProps['variant']
  size?: InputVariantProps['size'] 
  state?: InputVariantProps['state']
  label?: string
  description?: string
  error?: string
  success?: string
  resize?: "none" | "vertical" | "horizontal" | "both"
  containerClassName?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className,
    variant = "default",
    size = "default", 
    state,
    label,
    description,
    error,
    success,
    resize = "vertical",
    containerClassName,
    ...props 
  }, ref) => {
    const textareaId = props.id || `textarea-${React.useId()}`
    const inputState = error ? "error" : success ? "success" : state

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-body-sm font-medium text-foreground mb-2"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        <textarea
          className={cn(
            inputVariants({ variant, size, state: inputState }),
            "min-h-[80px] py-3",
            {
              "resize-none": resize === "none",
              "resize-y": resize === "vertical", 
              "resize-x": resize === "horizontal",
              "resize": resize === "both",
            },
            className
          )}
          ref={ref}
          id={textareaId}
          aria-describedby={
            description ? `${textareaId}-description` : 
            error ? `${textareaId}-error` : 
            success ? `${textareaId}-success` : undefined
          }
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
        
        {(description || error || success) && (
          <div className="mt-2 space-y-1">
            {description && !error && !success && (
              <p id={`${textareaId}-description`} className="text-caption text-muted-foreground">
                {description}
              </p>
            )}
            {error && (
              <p id={`${textareaId}-error`} className="text-caption text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {success && !error && (
              <p id={`${textareaId}-success`} className="text-caption text-success flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {success}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Input, SearchInput, Textarea, inputVariants }
