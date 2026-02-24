'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Menu, History } from 'lucide-react'
import { HeroSection } from './components/conversation/HeroSection'
import { PresetGallery } from './components/conversation/PresetGallery'
import { ConfigPanel } from './components/conversation/ConfigPanel'
import { ConversationView } from './components/conversation/ConversationView'
import { ConversationControls } from './components/conversation/ConversationControls'
import { HistoryDrawer } from './components/history/HistoryDrawer'
import { ThemeToggle } from './components/ui'
import { ToastContainer, toast, type Toast } from './components/ui/Toast'
import { useConversationStore } from './stores/conversationStore'
import { useConfigStore } from './stores/configStore'
import { useHistoryStore } from './stores/historyStore'
import type { Message } from './types'

export default function Home() {
	const [configExpanded, setConfigExpanded] = useState(false)
	const [historyOpen, setHistoryOpen] = useState(false)
	const [toasts, setToasts] = useState<Toast[]>([])
	const abortControllerRef = useRef<AbortController | null>(null)

	const {
		messages,
		currentRound,
		setIsChatting,
		setCurrentRound,
		setCurrentSpeaker,
		addMessage,
		reset: resetConversation,
	} = useConversationStore()

	const { getConfig } = useConfigStore()
	const { addConversation } = useHistoryStore()

	// Toast management
	const showToast = (message: string, variant: 'success' | 'error' | 'info' = 'info') => {
		const id = Math.random().toString(36).substring(2, 11)
		setToasts((prev) => [...prev, { id, message, variant }])
	}

	const dismissToast = (id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id))
	}

	// Validate configuration before starting
	const validateConfig = (): boolean => {
		const config = getConfig()
		if (!config.agent1Name || !config.agent1Prompt) {
			showToast('Please configure Agent 1', 'error')
			setConfigExpanded(true)
			return false
		}
		if (!config.agent2Name || !config.agent2Prompt) {
			showToast('Please configure Agent 2', 'error')
			setConfigExpanded(true)
			return false
		}
		if (!config.initialMessage) {
			showToast('Please provide an initial message', 'error')
			setConfigExpanded(true)
			return false
		}
		return true
	}

	// Start conversation
	const startChat = async () => {
		if (!validateConfig()) return

		setIsChatting(true)
		resetConversation()
		setCurrentRound(0)

		const config = getConfig()
		abortControllerRef.current = new AbortController()

		try {
			const response = await fetch('/api/start-chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(config),
				signal: abortControllerRef.current.signal,
			})

			if (!response.ok) {
				throw new Error('Failed to start chat')
			}

			const reader = response.body?.getReader()
			if (!reader) {
				throw new Error('Failed to get reader')
			}

			const decoder = new TextDecoder()
			let buffer = ''

			while (true) {
				const { value, done } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split('\n')
				buffer = lines.pop() || '' // Keep incomplete line in buffer

				for (const line of lines) {
					if (line.trim()) {
						const parsed = parseMessage(line, currentRound + 1)
						if (parsed) {
							addMessage(parsed)
							setCurrentSpeaker(parsed.speaker)
							setCurrentRound(parsed.round || currentRound + 1)
						}
					}
				}
			}

			showToast('Conversation completed', 'success')

			// Save to history
			const finalConfig = getConfig()
			addConversation({
				id: `conv-${Date.now()}`,
				timestamp: new Date(),
				agent1Name: finalConfig.agent1Name,
				agent2Name: finalConfig.agent2Name,
				messages: messages,
				messageCount: messages.length,
				initialMessage: finalConfig.initialMessage,
				isFavorite: false,
			})
		} catch (error: any) {
			if (error.name === 'AbortError') {
				showToast('Conversation stopped', 'info')
			} else {
				console.error('Chat error:', error)
				showToast('Error during conversation', 'error')
			}
		} finally {
			setIsChatting(false)
			setCurrentSpeaker(null)
			abortControllerRef.current = null
		}
	}

	// Stop conversation
	const stopChat = async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}
		await fetch('/api/stop-chat', { method: 'POST' })
		setIsChatting(false)
		setCurrentSpeaker(null)
	}

	// Parse message from backend
	const parseMessage = (msg: string, round: number): Message | null => {
		try {
			const speakerMatch = msg.match(/^(.*?)\s*\(to chat_manager\):/)
			const thinkMatch = msg.match(/<think>(.*?)<\/think>/s)

			const speaker = speakerMatch ? speakerMatch[1].trim() : 'System'
			const thinking = thinkMatch ? thinkMatch[1].trim() : undefined
			const content = msg
				.replace(/^(.*?)\s*\(to chat_manager\):/, '')
				.replace(/<think>(.*?)<\/think>/s, '')
				.trim()

			if (!content) return null

			return {
				id: `msg-${Date.now()}-${Math.random()}`,
				speaker,
				content,
				thinking,
				timestamp: new Date(),
				round,
			}
		} catch {
			return null
		}
	}

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	}, [])

	return (
		<div className="relative min-h-screen bg-background">
			{/* Fixed Header */}
			<motion.header
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 backdrop-blur-xl"
			>
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={() => setHistoryOpen(true)}
							className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 transition-colors hover:bg-white/20"
							aria-label="Open history"
						>
							<History className="h-5 w-5 text-white" />
						</button>
						<h1 className="text-lg font-semibold text-white">DialogFlow AI</h1>
					</div>

					<div className="flex items-center gap-2">
						<ThemeToggle />
					</div>
				</div>
			</motion.header>

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-4 pt-20 pb-8">
				<div className="space-y-8">
					{/* Hero Section */}
					<HeroSection />

					{/* Preset Gallery */}
					<motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="glass rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
					>
						<PresetGallery
							onPresetSelect={() => {
								showToast('Preset applied!', 'success')
								setConfigExpanded(false)
							}}
						/>

						{/* Toggle Config Panel Button */}
						<button
							type="button"
							onClick={() => setConfigExpanded(!configExpanded)}
							className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
						>
							<Menu className="h-4 w-4" />
							{configExpanded ? 'Hide' : 'Show'} Configuration
						</button>

						{/* Config Panel (Collapsible) */}
						{configExpanded && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: 'auto', opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="mt-4 overflow-hidden"
							>
								<ConfigPanel />
							</motion.div>
						)}
					</motion.section>

					{/* Conversation Controls */}
					<motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<ConversationControls
							onStart={startChat}
							onStop={stopChat}
							onClear={() => {
								resetConversation()
								showToast('Conversation cleared', 'info')
							}}
							onExport={() => {
								showToast('Conversation exported!', 'success')
							}}
						/>
					</motion.section>

					{/* Conversation View */}
					<motion.section
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="glass rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
					>
						<ConversationView />
					</motion.section>
				</div>
			</main>

			{/* History Drawer */}
			<HistoryDrawer isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />

			{/* Toast Container */}
			<ToastContainer toasts={toasts} onDismiss={dismissToast} />
		</div>
	)
}
