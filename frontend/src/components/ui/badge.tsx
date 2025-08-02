import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success:
          "border-transparent bg-green-500 text-white shadow-sm hover:bg-green-600",
        warning:
          "border-transparent bg-yellow-500 text-white shadow-sm hover:bg-yellow-600",
        info:
          "border-transparent bg-blue-500 text-white shadow-sm hover:bg-blue-600",
        gradient:
          "border-transparent bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-sm hover:from-blue-600 hover:to-emerald-600",
        "gradient-purple":
          "border-transparent bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm hover:from-purple-600 hover:to-pink-600",
        glass:
          "glass-effect text-foreground border-white/20",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }