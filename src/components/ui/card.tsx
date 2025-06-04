import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border shadow-sm",
        elevated: "card-elevated border",
        floating: "card-floating border-0",
        prominent: "card-prominent border-0",
        ghost: "border-0 shadow-none",
        outline: "border-2 border-border shadow-none hover:border-border-strong",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer selectable",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      interactive: false,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, interactive, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-heading-3 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-body-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Professional Content Card Component
interface ContentCardProps extends CardProps {
  selected?: boolean
  badge?: React.ReactNode
  actions?: React.ReactNode
  status?: "default" | "success" | "warning" | "error"
}

const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  ({ className, selected, badge, actions, status = "default", children, ...props }, ref) => {
    const statusStyles = {
      default: "",
      success: "border-l-4 border-l-green-500",
      warning: "border-l-4 border-l-yellow-500", 
      error: "border-l-4 border-l-red-500",
    }

    return (
      <Card
        ref={ref}
        variant="elevated"
        interactive
        className={cn(
          "group relative overflow-hidden",
          selected && "selected ring-2 ring-primary ring-offset-2",
          statusStyles[status],
          className
        )}
        {...props}
      >
        {badge && (
          <div className="absolute top-4 right-4 z-10">
            {badge}
          </div>
        )}
        
        {children}
        
        {actions && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {actions}
          </div>
        )}
        
        {/* Gradient overlay for selected state */}
        {selected && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        )}
      </Card>
    )
  }
)
ContentCard.displayName = "ContentCard"

// Professional Stats Card Component
interface StatsCardProps extends Omit<CardProps, 'children'> {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ className, title, value, subtitle, trend, icon, ...props }, ref) => (
    <Card
      ref={ref}
      variant="elevated"
      className={cn("text-center", className)}
      {...props}
    >
      <CardContent className="p-6">
        {icon && (
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              {icon}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-body-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          
          {subtitle && (
            <p className="text-caption text-muted-foreground">{subtitle}</p>
          )}
          
          {trend && (
            <div className="flex items-center justify-center gap-1">
              <span className={cn(
                "text-caption font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-caption text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
)
StatsCard.displayName = "StatsCard"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  ContentCard,
  StatsCard,
  cardVariants
}
