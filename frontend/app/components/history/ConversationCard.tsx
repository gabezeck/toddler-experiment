'use client'

import { motion } from 'framer-motion'
import { Star, Download, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '../../lib/formatters'
import type { SavedConversation } from '../../types'

interface ConversationCardProps {
	conversation: SavedConversation
	onExport: (id: string, format: 'json' | 'markdown') => void
	onDelete: (id: string) => void
	onToggleFavorite: (id: string) => void
	isFavorite: boolean
}

export function ConversationCard({
	conversation,
	onExport,
	onDelete,
	onToggleFavorite,
	isFavorite
}: ConversationCardProps) {
	const handleExportClick = (e: React.MouseEvent, format: 'json' | 'markdown') => {
		e.stopPropagation()
		onExport(conversation.id, format)
	}

	const handleDeleteClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		onDelete(conversation.id)
	}

	const handleFavoriteClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		onToggleFavorite(conversation.id)
	}

	return (
		<motion.div
			whileHover={{ y: -2, scale: 1.01 }}
			className="group relative rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-slate-800"
		>
			{/* Header */}
			<div className="mb-2 flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-blue-500" />
						<span className="text-sm font-medium text-gray-900 dark:text-white">
							{conversation.agent1Name}
						</span>
						<span className="text-gray-400">↔</span>
						<div className="h-2 w-2 rounded-full bg-emerald-500" />
						<span className="text-sm font-medium text-gray-900 dark:text-white">
							{conversation.agent2Name}
						</span>
					</div>
					<div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
						{formatRelativeTime(conversation.timestamp)} • {conversation.messageCount} messages
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={handleFavoriteClick}
						className="rounded p-1 text-gray-400 hover:text-yellow-500"
						title={isFavorite ? 'Remove favorite' : 'Add favorite'}
					>
						<Star
							className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
						/>
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={(e) => handleExportClick(e, 'markdown')}
						className="rounded p-1 text-gray-400 hover:text-indigo-500"
						title="Export as Markdown"
					>
						<Download className="h-4 w-4" />
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={handleDeleteClick}
						className="rounded p-1 text-gray-400 hover:text-red-500"
						title="Delete"
					>
						<Trash2 className="h-4 w-4" />
					</motion.button>
				</div>
			</div>

			{/* Preview */}
			{conversation.messages.length > 0 && (
				<div className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
					{conversation.messages[0].content}
				</div>
			)}
		</motion.div>
	)
}
