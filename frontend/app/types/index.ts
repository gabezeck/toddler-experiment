// Core types for DialogFlow AI

export interface Agent {
  name: string
  prompt: string
  color?: string
}

export interface Message {
  id: string
  speaker: string
  content: string
  thinking?: string
  timestamp: Date
  round?: number
}

export interface Preset {
  id: string
  name: string
  description: string
  icon: string
  agent1: {
    name: string
    prompt: string
    color: string
  }
  agent2: {
    name: string
    prompt: string
    color: string
  }
  initialMessage: string
  maxRounds?: number
}

export interface SavedConversation {
  id: string
  timestamp: Date
  agent1Name: string
  agent2Name: string
  messages: Message[]
  messageCount: number
  initialMessage: string
  isFavorite?: boolean
}

export interface ConversationConfig {
  agent1Name: string
  agent1Prompt: string
  agent2Name: string
  agent2Prompt: string
  initialMessage: string
  maxRounds?: number
}

export type Theme = 'light' | 'dark'
export type Speaker = 'agent1' | 'agent2' | 'web_surfer' | 'system'
