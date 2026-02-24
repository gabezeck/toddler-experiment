'use client'

import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Download, Trash2, StopCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { useConversationStore } from '@/app/stores/conversationStore'
import { Button } from '../ui/Button'
import { useState } from 'react'

interface ConversationControlsProps {
	onStart?: () => void
	onPause?: () => void
	onResume?: () => void
	onStop?: () => void
	onClear?: () => void
	onExport?: () => void
	className?: string
}

/**
 * ConversationControls - Control panel for managing active conversations
 * Features:
 * - Play/Pause/Resume buttons
 * - Progress indicator (Round X of Y)
 * - Export to JSON/Markdown
 * - Clear conversation
 * - Visual feedback for current state
 */
export function ConversationControls({
	onStart,
	onPause,
	onResume,
	onStop,
	onClear,
	onExport,
	className,
}: ConversationControlsProps) {
	const { isChatting, isPaused, currentRound, maxRound, messages } =
		useConversationStore()
	const [showStopModal, setShowStopModal] = useState(false)

	const progress = ((currentRound / maxRound) * 100).toFixed(0)

	const handlePause = () => {
		useConversationStore.getState().setIsPaused(true)
		onPause?.()
	}

	const handleResume = () => {
		useConversationStore.getState().setIsPaused(false)
		onResume?.()
	}

	const handleStopClick = () => {
		// Show confirmation modal if there are messages
		if (messages.length > 0) {
			setShowStopModal(true)
		} else {
			handleStop()
		}
	}

	const handleStop = () => {
		useConversationStore.getState().setIsPaused(false)
		setShowStopModal(false)
		onStop?.()
	}

	const handleStopAndExport = () => {
		handleExport()
		handleStop()
	}

	const handleClear = () => {
		useConversationStore.getState().reset()
		onClear?.()
	}

	const handleExport = () => {
		// Default export to markdown if not specified
		const markdown = exportToMarkdown(messages)
		const blob = new Blob([markdown], { type: 'text/markdown' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `conversation-${new Date().toISOString().slice(0, 10)}.md`
		a.click()
		URL.revokeObjectURL(url)
		onExport?.()
	}

	return (
		<div
			className={cn(
				'glass rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4',
				className
			)}
		>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				{/* Left: Progress Indicator */}
				<div className="flex items-center gap-4">
					<div className="flex flex-col">
						<span className="text-sm font-medium text-white">Progress</span>
						<span className="text-xs text-slate-400">
							Round {currentRound} of {maxRound}
						</span>
					</div>

					{/* Progress Bar */}
					<div className="h-2 w-32 overflow-hidden rounded-full bg-slate-700">
						<motion.div
							className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
							initial={{ width: 0 }}
							animate={{ width: `${progress}%` }}
							transition={{ duration: 0.5 }}
						/>
					</div>

					<span className="text-sm font-semibold text-white">{progress}%</span>
				</div>

				{/* Right: Control Buttons */}
				<div className="flex flex-wrap items-center gap-2">
					{/* Start Button (only when not chatting) */}
					{!isChatting && messages.length === 0 && (
						<Button
							variant="primary"
							size="md"
							onClick={onStart}
							className="gap-2"
						>
							<Play className="h-4 w-4" />
							Start
						</Button>
					)}

					{/* Pause/Resume Buttons (when chatting) */}
					{isChatting && !isPaused && (
						<Button
							variant="secondary"
							size="md"
							onClick={handlePause}
							className="gap-2"
						>
							<Pause className="h-4 w-4" />
							Pause
						</Button>
					)}

					{isChatting && isPaused && (
						<Button
							variant="primary"
							size="md"
							onClick={handleResume}
							className="gap-2"
						>
							<Play className="h-4 w-4" />
							Resume
						</Button>
					)}

					{/* Stop Button (when chatting) */}
					{isChatting && (
						<Button
							variant="danger"
							size="md"
							onClick={handleStopClick}
							className="gap-2"
						>
							<StopCircle className="h-4 w-4" />
							Stop
						</Button>
					)}

					{/* Export Button (when has messages) */}
					{messages.length > 0 && (
						<Button
							variant="ghost"
							size="md"
							onClick={handleExport}
							className="gap-2"
						>
							<Download className="h-4 w-4" />
							Export
						</Button>
					)}

					{/* Clear Button (when has messages) */}
					{messages.length > 0 && (
						<Button
							variant="ghost"
							size="md"
							onClick={handleClear}
							className="gap-2"
						>
							<Trash2 className="h-4 w-4" />
							Clear
						</Button>
					)}
				</div>
			</div>

			{/* Stop Confirmation Modal */}
			{showStopModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="glass relative mx-4 max-w-md rounded-2xl border border-white/20 bg-slate-900/95 p-6 shadow-2xl"
					>
						{/* Header */}
						<div className="mb-4 flex items-start gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
								<AlertCircle className="h-6 w-6 text-red-400" />
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-white">
									Stop Conversation?
								</h3>
								<p className="mt-1 text-sm text-slate-400">
									This will end the current conversation. You have {messages.length}{' '}
									messages that will be lost unless you export them.
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className="flex flex-col gap-2">
							<Button
								variant="primary"
								size="md"
								onClick={handleStopAndExport}
								className="w-full gap-2"
							>
								<Download className="h-4 w-4" />
								Export & Stop
							</Button>
							<Button
								variant="danger"
								size="md"
								onClick={handleStop}
								className="w-full gap-2"
							>
								<StopCircle className="h-4 w-4" />
								Stop Without Saving
							</Button>
							<Button
								variant="ghost"
								size="md"
								onClick={() => setShowStopModal(false)}
								className="w-full"
							>
								Cancel
							</Button>
						</div>
					</motion.div>
				</div>
			)}
		</div>
	)
}

/**
 * Helper function to export conversation to Markdown format
 */
function exportToMarkdown(messages: any[]): string {
	const lines: string[] = []

	lines.push('# Conversation Export')
	lines.push(`\n**Date:** ${new Date().toLocaleString()}\n`)
	lines.push('---\n')

	let currentRound = 0

	for (const message of messages) {
		if (message.round !== undefined && message.round !== currentRound) {
			currentRound = message.round
			lines.push(`\n## Round ${currentRound}\n`)
		}

		const speakerName =
			message.speaker === 'agent1'
				? 'Speaker 1'
				: message.speaker === 'agent2'
					? 'Speaker 2'
					: message.speaker === 'web_surfer'
						? 'Web Surfer'
						: 'System'

		lines.push(`### ${speakerName}`)
		lines.push(`\n${message.content}\n`)

		if (message.thinking) {
			lines.push(`<details>`)
			lines.push(`<summary>Thinking Process</summary>`)
			lines.push(`\n${message.thinking}\n`)
			lines.push(`</details>\n`)
		}
	}

	return lines.join('\n')
}
