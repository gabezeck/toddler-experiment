import { create } from 'zustand'
import type { Message } from '../types'

interface ConversationState {
	messages: Message[]
	isChatting: boolean
	currentRound: number
	maxRound: number
	isPaused: boolean
	currentSpeaker: string | null
	setMessages: (messages: Message[]) => void
	addMessage: (message: Message) => void
	setIsChatting: (isChatting: boolean) => void
	setCurrentRound: (round: number) => void
	setMaxRound: (max: number) => void
	setIsPaused: (isPaused: boolean) => void
	setCurrentSpeaker: (speaker: string | null) => void
	reset: () => void
}

const initialState = {
	messages: [],
	isChatting: false,
	currentRound: 0,
	maxRound: 10,
	isPaused: false,
	currentSpeaker: null,
}

export const useConversationStore = create<ConversationState>((set) => ({
	...initialState,

	setMessages: (messages) => set({ messages }),

	addMessage: (message) =>
		set((state) => ({
			messages: [...state.messages, message],
		})),

	setIsChatting: (isChatting) => set({ isChatting }),

	setCurrentRound: (currentRound) => set({ currentRound }),

	setMaxRound: (maxRound) => set({ maxRound }),

	setIsPaused: (isPaused) => set({ isPaused }),

	setCurrentSpeaker: (currentSpeaker) => set({ currentSpeaker }),

	reset: () => set(initialState),
}))
