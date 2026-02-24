import { create } from 'zustand'
import type { Preset, ConversationConfig } from '../types'

interface AgentConfig {
	name: string
	prompt: string
	color: string
}

interface ConfigState {
	agent1: AgentConfig
	agent2: AgentConfig
	initialMessage: string
	selectedPreset: string | null
	setAgent1: (config: AgentConfig) => void
	setAgent2: (config: AgentConfig) => void
	setInitialMessage: (msg: string) => void
	setSelectedPreset: (preset: string | null) => void
	applyPreset: (preset: Preset) => void
	getConfig: () => ConversationConfig
	reset: () => void
}

const defaultAgent: AgentConfig = {
	name: '',
	prompt: '',
	color: '#3b82f6',
}

const initialState = {
	agent1: { ...defaultAgent, color: '#3b82f6' },
	agent2: { ...defaultAgent, color: '#10b981' },
	initialMessage: '',
	selectedPreset: null,
}

export const useConfigStore = create<ConfigState>((set, get) => ({
	...initialState,

	setAgent1: (agent1) => set({ agent1 }),

	setAgent2: (agent2) => set({ agent2 }),

	setInitialMessage: (initialMessage) => set({ initialMessage }),

	setSelectedPreset: (selectedPreset) => set({ selectedPreset }),

	applyPreset: (preset) =>
		set({
			agent1: {
				name: preset.agent1.name,
				prompt: preset.agent1.prompt,
				color: preset.agent1.color,
			},
			agent2: {
				name: preset.agent2.name,
				prompt: preset.agent2.prompt,
				color: preset.agent2.color,
			},
			initialMessage: preset.initialMessage,
			selectedPreset: preset.id,
		}),

	getConfig: () => {
		const { agent1, agent2, initialMessage } = get()
		return {
			agent1Name: agent1.name,
			agent1Prompt: agent1.prompt,
			agent2Name: agent2.name,
			agent2Prompt: agent2.prompt,
			initialMessage,
		}
	},

	reset: () => set(initialState),
}))
