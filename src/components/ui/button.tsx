import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-ring touch-target [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border-2 border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-border-strong hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 active:translate-y-0",
        link: 
          "text-primary underline-offset-4 hover:underline hover:text-primary/80 p-0 h-auto",
        premium:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg border border-white/20",
        success:
          "bg-success text-success-foreground shadow-md hover:bg-success/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        warning:
          "bg-warning text-warning-foreground shadow-md hover:bg-warning/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-12 w-12",
      },
      loading: {
        true: "cursor-not-allowed opacity-80",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false,
    loadingText,
    children,
    disabled,
    asChild = false, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const isDisabled = disabled || loading
    
    return (
      <Comp
        className={cn(buttonVariants({ 
          variant, 
          size, 
          loading,
          className 
        }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {loading && loadingText ? loadingText : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

// Professional Icon Button Component
const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "ghost", size = "icon", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn("rounded-lg", className)}
        {...props}
      />
    )
  }
)
IconButton.displayName = "IconButton"

// Professional Button Group Component
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "outline"
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          variant === "outline" && "border border-border rounded-lg p-1",
          variant === "default" && "gap-1",
          className
        )}
        role="group"
        {...props}
      >
        {children}
      </div>
    )
  }
)
ButtonGroup.displayName = "ButtonGroup"

export { Button, IconButton, ButtonGroup, buttonVariants }
