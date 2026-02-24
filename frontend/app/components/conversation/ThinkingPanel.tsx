'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Brain } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { useState } from 'react'

interface ThinkingPanelProps {
	thinking: string
	speaker?: string
	className?: string
}

/**
 * ThinkingPanel - Collapsible panel for showing agent reasoning/thinking
 * Features:
 * - Smooth expand/collapse animation
 * - Brain icon indicator
 * - Speaker color coding
 * - Syntax highlighting for structured thoughts
 */
export function ThinkingPanel({ thinking, speaker, className }: ThinkingPanelProps) {
	const [isExpanded, setIsExpanded] = useState(false)

	// Determine color based on speaker
	const getSpeakerColor = () => {
		switch (speaker) {
			case 'agent1':
				return 'var(--agent-1-color)'
			case 'agent2':
				return 'var(--agent-2-color)'
			case 'web_surfer':
				return 'var(--web-surfer-color)'
			default:
				return 'var(--text-secondary)'
		}
	}

	const speakerColor = getSpeakerColor()

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className={cn('mt-2', className)}
		>
			{/* Toggle Button */}
			<motion.button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className={cn(
					'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
					'hover:bg-white/5',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
				)}
				style={{
					color: speakerColor,
					backgroundColor: isExpanded ? `${speakerColor}10` : 'transparent',
				}}
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
			>
				<Brain className="h-4 w-4" />
				<span>Thinking</span>
				<AnimatePresence mode="wait">
					<motion.span
						key={isExpanded ? 'up' : 'down'}
						initial={{ rotate: -90, opacity: 0 }}
						animate={{ rotate: 0, opacity: 1 }}
						exit={{ rotate: 90, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						{isExpanded ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</motion.span>
				</AnimatePresence>
			</motion.button>

			{/* Collapsible Content */}
			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{
							height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
							opacity: { duration: 0.2 },
						}}
						className="overflow-hidden"
					>
						<motion.div
							initial={{ y: -10 }}
							animate={{ y: 0 }}
							className={cn(
								'mt-2 rounded-lg border p-3 text-sm',
								'backdrop-blur-xl',
								'border-white/10 bg-white/5'
							)}
							style={{
								borderLeftColor: speakerColor,
								borderLeftWidth: '3px',
							}}
						>
							<div className="prose prose-sm max-w-none dark:prose-invert">
								{/* Format thinking content */}
								<div className="whitespace-pre-wrap text-slate-300">
									{thinking}
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}
