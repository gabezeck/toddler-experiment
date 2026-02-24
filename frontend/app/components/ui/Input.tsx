"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/app/lib/utils"
import { forwardRef, useState } from "react"
import { AlertCircle } from "lucide-react"

export interface InputProps extends Omit<HTMLMotionProps<"input">, "ref"> {
  label?: string
  error?: string
  helperText?: string
  type?: "text" | "email" | "password" | "number" | "url"
}

/**
 * Input component with label, error state, and focus animations.
 * Includes accessible form controls and dark mode support.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      type = "text",
      id,
      animate,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    // Use the error shake animation if error exists, otherwise use passed animate prop
    const motionAnimate = error ? { x: [-5, 5, -5, 5, 0] } : animate

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <motion.input
            id={inputId}
            ref={ref as any}
            type={type}
            {...props}
            className={cn(
              "w-full rounded-lg border px-4 py-2.5 text-base",
              "bg-white dark:bg-slate-800",
              "text-slate-900 dark:text-slate-100",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "transition-colors duration-200",
              "focus-visible:outline-none",
              error
                ? "border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
                : "border-slate-300 dark:border-slate-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            animate={motionAnimate}
            transition={{ duration: 0.3 }}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
          />
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          )}
        </div>
        {error && (
          <motion.p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-slate-500 dark:text-slate-400"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
