'use client'

import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/app/stores/uiStore'
import { cn } from '@/app/lib/utils'

interface ThemeToggleProps {
	className?: string
}

/**
 * ThemeToggle - Animated button to toggle between light and dark mode
 * Features:
 * - Smooth icon transition
 * - Syncs with uiStore
 * - Persists preference to localStorage
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
	const { theme, setTheme } = useUIStore()

	const toggleTheme = () => {
		setTheme(theme === 'light' ? 'dark' : 'light')
	}

	return (
		<motion.button
			type="button"
			onClick={toggleTheme}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			className={cn(
				'relative flex h-10 w-10 items-center justify-center rounded-xl',
				'bg-white/10 backdrop-blur-xl',
				'border border-white/20',
				'transition-colors hover:bg-white/20',
				className
			)}
			aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
		>
			<motion.div
				initial={false}
				animate={{
					scale: theme === 'light' ? 1 : 0,
					opacity: theme === 'light' ? 1 : 0,
					rotate: theme === 'light' ? 0 : 180,
				}}
				transition={{ duration: 0.3 }}
				className="absolute"
			>
				<Sun className="h-5 w-5 text-yellow-500" />
			</motion.div>

			<motion.div
				initial={false}
				animate={{
					scale: theme === 'dark' ? 1 : 0,
					opacity: theme === 'dark' ? 1 : 0,
					rotate: theme === 'dark' ? 0 : -180,
				}}
				transition={{ duration: 0.3 }}
				className="absolute"
			>
				<Moon className="h-5 w-5 text-blue-400" />
			</motion.div>
		</motion.button>
	)
}
