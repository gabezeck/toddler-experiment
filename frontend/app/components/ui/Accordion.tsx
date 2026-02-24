"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/app/lib/utils"
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

export interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

export interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  defaultOpen?: string[]
  className?: string
}

/**
 * Accordion component with smooth Framer Motion height animations.
 * Supports multiple panels open simultaneously and keyboard navigation.
 */
export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen))

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        if (allowMultiple) {
          newSet.add(id)
        } else {
          newSet.clear()
          newSet.add(id)
        }
      }
      return newSet
    })
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    id: string,
    index: number
  ) => {
    switch (e.key) {
      case " ":
      case "Enter":
        e.preventDefault()
        toggleItem(id)
        break
      case "ArrowDown":
        e.preventDefault()
        const nextButton = document.querySelector(
          `[data-accordion-button][data-index="${index + 1}"]`
        ) as HTMLButtonElement
        nextButton?.focus()
        break
      case "ArrowUp":
        e.preventDefault()
        const prevButton = document.querySelector(
          `[data-accordion-button][data-index="${index - 1}"]`
        ) as HTMLButtonElement
        prevButton?.focus()
        break
      case "Home":
        e.preventDefault()
        const firstButton = document.querySelector(
          `[data-accordion-button][data-index="0"]`
        ) as HTMLButtonElement
        firstButton?.focus()
        break
      case "End":
        e.preventDefault()
        const lastButton = document.querySelector(
          `[data-accordion-button][data-index="${items.length - 1}"]`
        ) as HTMLButtonElement
        lastButton?.focus()
        break
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
          onKeyDown={(e) => handleKeyDown(e, item.id, index)}
          index={index}
        />
      ))}
    </div>
  )
}

interface AccordionItemProps {
  item: AccordionItem
  isOpen: boolean
  onToggle: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void
  index: number
}

function AccordionItem({ item, isOpen, onToggle, onKeyDown, index }: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | "auto">(0)

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        setHeight(contentRef.current.scrollHeight)
      }
    }
  }, [isOpen])

  const handleTransitionEnd = () => {
    if (isOpen && contentRef.current) {
      setHeight("auto")
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <motion.button
        type="button"
        data-accordion-button
        data-index={index}
        onClick={onToggle}
        onKeyDown={onKeyDown}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-left",
          "text-slate-900 dark:text-slate-100",
          "hover:bg-slate-50 dark:hover:bg-slate-800",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
        )}
        aria-expanded={isOpen}
        aria-controls={`${item.id}-content`}
      >
        <span className="font-medium">{item.title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-2"
        >
          <ChevronDown className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </motion.div>
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${item.id}-content`}
            ref={contentRef}
            initial={{ height: 0 }}
            animate={{ height: height }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onTransitionEnd={handleTransitionEnd}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 text-slate-700 dark:text-slate-300">
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
