import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform active:scale-[0.98] relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 hover:shadow-xl hover:-translate-y-0.5",
        outline: "border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:-translate-y-0.5",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg hover:from-blue-600 hover:to-emerald-600 hover:shadow-xl hover:-translate-y-0.5",
        "gradient-purple": "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:-translate-y-0.5",
        "gradient-orange": "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:from-orange-600 hover:to-red-600 hover:shadow-xl hover:-translate-y-0.5",
        glass: "glass-effect text-foreground hover:bg-white/50 hover:-translate-y-0.5",
        success: "bg-green-500 text-white shadow-lg hover:bg-green-600 hover:shadow-xl hover:-translate-y-0.5",
        warning: "bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 hover:shadow-xl hover:-translate-y-0.5",
        info: "bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-8 text-base font-semibold",
        xl: "h-16 rounded-2xl px-10 text-lg font-semibold",
        icon: "h-11 w-11 rounded-xl",
        "icon-sm": "h-9 w-9 rounded-lg",
        "icon-lg": "h-14 w-14 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Shine effect for gradient buttons */}
        {(variant === 'gradient' || variant === 'gradient-purple' || variant === 'gradient-orange') && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
          </div>
        )}
        <span className="relative z-10">{children}</span>
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }