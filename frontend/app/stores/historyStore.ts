import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SavedConversation, Message } from '../types'

interface HistoryState {
	conversations: SavedConversation[]
	favorites: Set<string>
	addConversation: (conv: SavedConversation) => void
	deleteConversation: (id: string) => void
	toggleFavorite: (id: string) => void
	searchConversations: (query: string) => SavedConversation[]
	exportConversation: (id: string, format: 'json' | 'markdown') => string
	getFavoriteIds: () => string[]
}

const serializeSet = (set: Set<string>): string[] => Array.from(set)
const deserializeSet = (arr: string[]): Set<string> => new Set(arr)

export const useHistoryStore = create<HistoryState>()(
	persist(
		(set, get) => ({
			conversations: [],
			favorites: new Set<string>(),

			addConversation: (conversation) =>
				set((state) => ({
					conversations: [conversation, ...state.conversations],
				})),

			deleteConversation: (id) =>
				set((state) => ({
					conversations: state.conversations.filter((c) => c.id !== id),
					favorites: new Set(
						Array.from(state.favorites).filter((favId) => favId !== id),
					),
				})),

			toggleFavorite: (id) =>
				set((state) => {
					const newFavorites = new Set(state.favorites)
					if (newFavorites.has(id)) {
						newFavorites.delete(id)
					} else {
						newFavorites.add(id)
					}
					return {
						favorites: newFavorites,
						conversations: state.conversations.map((c) =>
							c.id === id ? { ...c, isFavorite: newFavorites.has(id) } : c,
						),
					}
				}),

			searchConversations: (query) => {
				const { conversations } = get()
				const lowerQuery = query.toLowerCase()
				return conversations.filter(
					(c) =>
						c.agent1Name.toLowerCase().includes(lowerQuery) ||
						c.agent2Name.toLowerCase().includes(lowerQuery) ||
						c.messages.some((m) =>
							m.content.toLowerCase().includes(lowerQuery),
						),
				)
			},

			exportConversation: (id, format) => {
				const { conversations } = get()
				const conversation = conversations.find((c) => c.id === id)
				if (!conversation) {
					throw new Error(`Conversation with id ${id} not found`)
				}

				if (format === 'json') {
					return JSON.stringify(conversation, null, 2)
				}

				// Markdown format
				let markdown = `# ${conversation.agent1Name} vs ${conversation.agent2Name}\n\n`
				markdown += `**Date:** ${new Date(conversation.timestamp).toLocaleString()}\n\n`
				markdown += `**Initial Message:** ${conversation.initialMessage}\n\n`
				markdown += `---\n\n`

				for (const message of conversation.messages) {
					markdown += `### ${message.speaker}\n\n`
					markdown += `${message.content}\n\n`
					if (message.thinking) {
						markdown += `*Thinking: ${message.thinking}*\n\n`
					}
					markdown += `---\n\n`
				}

				return markdown
			},

			getFavoriteIds: () => {
				return Array.from(get().favorites)
			},
		}),
		{
			name: 'dialogflow-history',
			partialize: (state) => ({
				conversations: state.conversations,
				favoriteIds: serializeSet(state.favorites),
			}),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.favorites = deserializeSet((state as any).favoriteIds || [])
					delete (state as any).favoriteIds
				}
			},
		},
	),
)
