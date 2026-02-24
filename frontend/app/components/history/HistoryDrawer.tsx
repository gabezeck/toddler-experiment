'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Download, Trash2, Star } from 'lucide-react'
import { useState } from 'react'
import { useHistoryStore } from '../../stores/historyStore'
import { ConversationCard } from './ConversationCard'

interface HistoryDrawerProps {
	isOpen: boolean
	onClose: () => void
}

export function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
	const { conversations, favorites, searchConversations, deleteConversation, toggleFavorite } =
		useHistoryStore()
	const [searchQuery, setSearchQuery] = useState('')

	const filteredConversations = searchQuery
		? searchConversations(searchQuery)
		: conversations

	const favoriteConversations = filteredConversations.filter((c) => favorites.has(c.id))
	const otherConversations = filteredConversations.filter((c) => !favorites.has(c.id))

	const handleExport = (conversationId: string, format: 'json' | 'markdown') => {
		const content = useHistoryStore.getState().exportConversation(conversationId, format)
		const blob = new Blob([content], {
			type: format === 'json' ? 'application/json' : 'text/markdown'
		})
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `conversation.${format}`
		a.click()
		URL.revokeObjectURL(url)
	}

	const handleDelete = (conversationId: string) => {
		if (confirm('Are you sure you want to delete this conversation?')) {
			deleteConversation(conversationId)
		}
	}

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
					/>

					{/* Drawer */}
					<motion.aside
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 200 }}
						className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white/90 backdrop-blur-xl shadow-2xl dark:bg-slate-900/90"
					>
						<div className="flex h-full flex-col">
							{/* Header */}
							<div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
								<h2 className="text-xl font-bold text-gray-900 dark:text-white">
									Conversations
								</h2>
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									onClick={onClose}
									className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
								>
									<X className="h-5 w-5" />
								</motion.button>
							</div>

							{/* Search */}
							<div className="border-b border-gray-200 p-4 dark:border-gray-700">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
									<input
										type="text"
										placeholder="Search conversations..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-slate-800 dark:text-white"
									/>
								</div>
							</div>

							{/* Conversation List */}
							<div className="flex-1 overflow-y-auto p-4">
								{filteredConversations.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
										<p className="text-center">No conversations yet</p>
										<p className="mt-2 text-sm">Start a chat to see it here!</p>
									</div>
								) : (
									<>
										{/* Favorites */}
										{favoriteConversations.length > 0 && (
											<div className="mb-6">
												<div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
													<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
													Favorites
												</div>
												<div className="space-y-2">
													{favoriteConversations.map((conversation) => (
														<ConversationCard
															key={conversation.id}
															conversation={conversation}
															onExport={handleExport}
															onDelete={handleDelete}
															onToggleFavorite={toggleFavorite}
															isFavorite
														/>
													))}
												</div>
											</div>
										)}

										{/* All Conversations */}
										{otherConversations.length > 0 && (
											<div>
												<div className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
													All Conversations
												</div>
												<div className="space-y-2">
													{otherConversations.map((conversation) => (
														<ConversationCard
															key={conversation.id}
															conversation={conversation}
															onExport={handleExport}
															onDelete={handleDelete}
															onToggleFavorite={toggleFavorite}
															isFavorite={false}
														/>
													))}
												</div>
											</div>
										)}
									</>
								)}
							</div>
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	)
}
