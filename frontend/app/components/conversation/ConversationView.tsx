'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { Bot, Loader2 } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { useConversationStore } from '@/app/stores/conversationStore'
import { MessageBubble } from './MessageBubble'
import { ThinkingPanel } from './ThinkingPanel'

interface ConversationViewProps {
	className?: string
}

/**
 * ConversationView - Main conversation display orchestrator
 * Features:
 * - Auto-scroll to latest message
 * - Typing indicator animation
 * - Smooth message entrance animations
 * - Integrated thinking panels
 * - Empty state when no messages
 */
export function ConversationView({ className }: ConversationViewProps) {
	const { messages, isChatting, currentSpeaker } = useConversationStore()
	const scrollRef = useRef<HTMLDivElement>(null)

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTo({
				top: scrollRef.current.scrollHeight,
				behavior: 'smooth',
			})
		}
	}, [messages])

	return (
		<div className={cn('flex flex-col', className)}>
			{/* Messages Container */}
			<div
				ref={scrollRef}
				className="flex-1 space-y-6 overflow-y-auto px-4 py-6"
				style={{
					maxHeight: 'calc(100vh - 400px)',
					minHeight: '300px',
				}}
			>
				<AnimatePresence mode="popLayout">
					{messages.length === 0 ? (
						/* Empty State */
						<motion.div
							key="empty"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							className="flex h-full flex-col items-center justify-center text-center"
						>
							<motion.div
								animate={{
									y: [0, -10, 0],
									rotate: [0, 5, -5, 0],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: 'easeInOut',
								}}
								className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"
							>
								<Bot className="h-10 w-10 text-purple-400" />
							</motion.div>
							<h3 className="mb-2 text-xl font-semibold text-white">
								Ready to Start
							</h3>
							<p className="max-w-md text-slate-400">
								Select a preset or configure your agents, then click "Start
								Conversation" to begin the AI dialogue.
							</p>
						</motion.div>
					) : (
						/* Messages */
						messages.map((message, index) => {
							const isLastMessage = index === messages.length - 1
							const isCurrentSpeaker =
								isLastMessage && isChatting && message.speaker === currentSpeaker

							return (
								<motion.div
									key={message.id}
									layout="position"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{
										layout: { duration: 0.3 },
										opacity: { duration: 0.2 },
										y: { type: 'spring', stiffness: 300, damping: 25 },
									}}
								>
									<MessageBubble
										message={message}
										index={index}
										isCurrentSpeaker={isCurrentSpeaker}
									/>

									{/* Thinking Panel for messages with thinking */}
									{message.thinking && (
										<ThinkingPanel
											thinking={message.thinking}
											speaker={message.speaker}
											className="ml-16 mt-2"
										/>
									)}
								</motion.div>
							)
						})
					)}
				</AnimatePresence>

				{/* Typing Indicator */}
				<AnimatePresence>
					{isChatting && currentSpeaker && (
						<motion.div
							key="typing"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							className="flex items-center gap-3 px-4 py-3"
						>
							{/* Avatar */}
							<div
								className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl shadow-md"
								style={{
									backgroundColor:
										currentSpeaker === 'agent1'
											? 'var(--agent-1-color)20'
											: currentSpeaker === 'agent2'
												? 'var(--agent-2-color)20'
												: 'var(--web-surfer-color)20',
									border: `2px solid ${
										currentSpeaker === 'agent1'
											? 'var(--agent-1-color)'
											: currentSpeaker === 'agent2'
												? 'var(--agent-2-color)'
												: 'var(--web-surfer-color)'
									}`,
								}}
							>
								{currentSpeaker === 'web_surfer' ? '🌐' : '🤖'}
							</div>

							{/* Typing Animation */}
							<div className="glass rounded-2xl px-4 py-3">
								<div className="flex items-center gap-1">
									{[0, 1, 2].map((i) => (
										<motion.span
											key={i}
											className="h-2 w-2 rounded-full bg-slate-400"
											animate={{
												scale: [1, 1.5, 1],
												opacity: [0.5, 1, 0.5],
											}}
											transition={{
												duration: 1.2,
												repeat: Infinity,
												delay: i * 0.2,
											}}
										/>
									))}
								</div>
							</div>

							{/* Spinning loader */}
							<motion.div
								animate={{ rotate: 360 }}
								transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
							>
								<Loader2 className="h-5 w-5 text-slate-400" />
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}
