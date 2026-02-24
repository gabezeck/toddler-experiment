"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/app/lib/utils"
import { forwardRef } from "react"

export interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "outlined"
  padding?: "none" | "sm" | "md" | "lg"
}

const variantStyles = {
  default: "glass rounded-xl",
  elevated: "glass rounded-xl shadow-lg",
  outlined: "bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700",
}

const paddingStyles = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
}

/**
 * Card component with glassmorphism effect and hover animations.
 * Responsive padding and dark mode support included.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = "Card"
