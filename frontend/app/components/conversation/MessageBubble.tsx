'use client'

import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Message } from '../../types'
import { cn, formatRelativeTime } from '../../lib/utils'

interface MessageBubbleProps {
	message: Message
	index?: number
	isCurrentSpeaker?: boolean
}

const speakerConfig = {
	agent1: {
		align: 'justify-start',
		avatar: '🤖',
		color: 'var(--agent-1-color)',
		slideDirection: -1, // slide from left
	},
	agent2: {
		align: 'justify-end',
		avatar: '🧠',
		color: 'var(--agent-2-color)',
		slideDirection: 1, // slide from right
	},
	web_surfer: {
		align: 'justify-center',
		avatar: '🌐',
		color: 'var(--web-surfer-color)',
		slideDirection: 0, // fade in center
	},
	system: {
		align: 'justify-center',
		avatar: '⚙️',
		color: 'var(--text-secondary)',
		slideDirection: 0,
	},
} as const

export function MessageBubble({
	message,
	index = 0,
	isCurrentSpeaker = false,
}: MessageBubbleProps) {
	const [copied, setCopied] = useState(false)
	const speakerKey = message.speaker as keyof typeof speakerConfig
	const config = speakerConfig[speakerKey] || speakerConfig.system

	const handleCopy = async () => {
		await navigator.clipboard.writeText(message.content)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const isWebSurfer = message.speaker === 'web_surfer'
	const isAgent1 = message.speaker === 'agent1'

	// Animation variants
	const bubbleVariants = {
		hidden: {
			opacity: 0,
			x: config.slideDirection === -1 ? -50 : config.slideDirection === 1 ? 50 : 0,
		},
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				type: 'spring' as const,
				stiffness: 300,
				damping: 25,
				delay: index * 0.1, // Stagger animation
			},
		},
	}

	return (
		<motion.div
			className={cn(
				'flex w-full mb-6',
				config.align,
				isWebSurfer && 'max-w-2xl mx-auto'
			)}
			variants={bubbleVariants}
			initial="hidden"
			animate="visible"
		>
			<div
				className={cn(
					'flex gap-3 max-w-[85%] lg:max-w-[75%]',
					isAgent1 ? 'flex-row' : !isWebSurfer ? 'flex-row-reverse' : 'flex-row justify-center'
				)}
			>
				{/* Avatar */}
				<div
					className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md"
					style={{
						backgroundColor: `${config.color}20`,
						border: `2px solid ${config.color}`,
					}}
				>
					{config.avatar}
				</div>

				{/* Message Content */}
				<div
					className={cn(
						'flex flex-col gap-1',
						isWebSurfer ? 'items-center text-center' : ''
					)}
				>
					{/* Speaker Name */}
					<div className="flex items-center gap-2">
						<span
							className="text-sm font-semibold"
							style={{ color: config.color }}
						>
							{message.speaker === 'agent1'
								? 'Speaker 1'
								: message.speaker === 'agent2'
									? 'Speaker 2'
									: message.speaker === 'web_surfer'
										? 'Web Surfer'
										: 'System'}
						</span>
						{message.round !== undefined && (
							<span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-foreground-muted border border-white/10">
								Round {message.round}
							</span>
						)}
					</div>

					{/* Bubble */}
					<div
						className={cn(
							'glass rounded-2xl px-4 py-3 shadow-md relative group',
							isAgent1 && 'rounded-tl-none',
							!isAgent1 && !isWebSurfer && 'rounded-tr-none',
							isWebSurfer && 'rounded-lg'
						)}
					>
						{/* Copy Button */}
						<button
							onClick={handleCopy}
							className={cn(
								'absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity',
								'hover:bg-white/10 active:scale-95 transition-transform',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--agent-1-color)]'
							)}
							aria-label="Copy message"
						>
							{copied ? (
								<Check
									className="w-4 h-4"
									style={{ color: 'var(--success-color)' }}
								/>
							) : (
								<Copy className="w-4 h-4 text-foreground-muted" />
							)}
						</button>

						{/* Markdown Content */}
						<div className="prose prose-sm max-w-none">
							<ReactMarkdown
								components={{
									p: ({ children }) => (
										<p className="mb-2 last:mb-0 leading-relaxed">
											{children}
										</p>
									),
									code: ({ node, className, children, ...props }: any) => {
										const inline = !className
										if (inline) {
											return (
												<code
													className="px-1.5 py-0.5 rounded bg-white/10 text-foreground-muted text-sm font-mono"
													{...props}
												>
													{children}
												</code>
											)
										}
										return (
											<code
												className={cn(
													'block p-3 rounded-lg bg-black/30 text-foreground font-mono text-sm overflow-x-auto',
													className
												)}
												{...props}
											>
												{children}
											</code>
										)
									},
									pre: ({ children }) => (
										<pre className="bg-transparent p-0 m-0 overflow-x-auto">
											{children}
										</pre>
									),
									ul: ({ children }) => (
										<ul className="list-disc list-inside mb-2">
											{children}
										</ul>
									),
									ol: ({ children }) => (
										<ol className="list-decimal list-inside mb-2">
											{children}
										</ol>
									),
									li: ({ children }) => (
										<li className="mb-1">{children}</li>
									),
									a: ({ href, children }) => (
										<a
											href={href}
											className="text-[var(--agent-1-color)] hover:underline"
											target="_blank"
											rel="noopener noreferrer"
										>
											{children}
										</a>
									),
									blockquote: ({ children }) => (
										<blockquote className="border-l-4 border-white/20 pl-4 italic text-foreground-muted">
											{children}
										</blockquote>
									),
								}}
							>
								{message.content}
							</ReactMarkdown>
						</div>
					</div>

					{/* Timestamp */}
					<span className="text-xs text-foreground-muted px-1">
						{formatRelativeTime(message.timestamp)}
					</span>
				</div>
			</div>
		</motion.div>
	)
}
