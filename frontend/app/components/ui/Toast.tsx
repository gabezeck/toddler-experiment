"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/app/lib/utils"
import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Info, X } from "lucide-react"

export type ToastVariant = "success" | "error" | "info"

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
  duration?: number
}

/**
 * Individual Toast component with slide-in animation and progress bar.
 */
function Toast({ toast, onDismiss, duration = 3000 }: ToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const interval = 50
    const step = 100 / (duration / interval)
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer)
          return 0
        }
        return prev - step
      })
    }, interval)

    const dismissTimer = setTimeout(() => {
      onDismiss(toast.id)
    }, duration)

    return () => {
      clearInterval(timer)
      clearTimeout(dismissTimer)
    }
  }, [toast.id, duration, onDismiss])

  const variantStyles = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100",
    error: "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-900 dark:text-blue-100",
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={cn(
        "relative overflow-hidden rounded-lg border-l-4 p-4 shadow-lg",
        variantStyles[toast.variant]
      )}
      role="alert"
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icons[toast.variant]}</div>
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-20">
        <motion.div
          className="h-full"
          style={{ width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: "linear" }}
        />
      </div>
    </motion.div>
  )
}

export interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
  duration?: number
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  className?: string
}

const positionStyles = {
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
}

/**
 * ToastContainer component that manages and displays toast notifications.
 * Handles multiple toasts in a queue with auto-dismiss functionality.
 */
export function ToastContainer({
  toasts,
  onDismiss,
  duration = 3000,
  position = "bottom-right",
  className,
}: ToastContainerProps) {
  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-2 pointer-events-none",
        positionStyles[position],
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={onDismiss} duration={duration} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Convenience hooks for using toasts

let toastListeners: Set<(toasts: Toast[]) => void> = new Set()
let toastState: Toast[] = []

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toastState]))
}

export const toast = {
  show(message: string, variant: ToastVariant = "info") {
    const id = Math.random().toString(36).substr(2, 9)
    toastState.push({ id, message, variant })
    notifyListeners()
    return id
  },
  success(message: string) {
    return this.show(message, "success")
  },
  error(message: string) {
    return this.show(message, "error")
  },
  info(message: string) {
    return this.show(message, "info")
  },
  dismiss(id: string) {
    toastState = toastState.filter((t) => t.id !== id)
    notifyListeners()
  },
}
