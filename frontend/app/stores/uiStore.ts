import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '../types'

interface ToastState {
	show: boolean
	message: string
	type: 'success' | 'error' | 'info'
}

interface UIState {
	theme: Theme
	sidebarOpen: boolean
	thinkingVisibility: Record<string, boolean>
	toast: ToastState
	setTheme: (theme: Theme) => void
	setSidebarOpen: (open: boolean) => void
	toggleSidebar: () => void
	toggleThinking: (messageId: string) => void
	setThinkingVisibility: (messageId: string, visible: boolean) => void
	showToast: (message: string, type?: 'success' | 'error' | 'info') => void
	hideToast: () => void
}

export const useUIStore = create<UIState>()(
	persist(
		(set) => ({
			theme: 'dark',
			sidebarOpen: true,
			thinkingVisibility: {},
			toast: {
				show: false,
				message: '',
				type: 'info',
			},
			setTheme: (theme) => set({ theme }),
			setSidebarOpen: (open) => set({ sidebarOpen: open }),
			toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
			toggleThinking: (messageId) =>
				set((state) => ({
					thinkingVisibility: {
						...state.thinkingVisibility,
						[messageId]: !state.thinkingVisibility[messageId],
					},
				})),
			setThinkingVisibility: (messageId, visible) =>
				set((state) => ({
					thinkingVisibility: {
						...state.thinkingVisibility,
						[messageId]: visible,
					},
				})),
			showToast: (message, type = 'info') =>
				set({
					toast: {
						show: true,
						message,
						type,
					},
				}),
			hideToast: () =>
				set((state) => ({
					toast: {
						...state.toast,
						show: false,
					},
				})),
		}),
		{
			name: 'dialogflow-ui',
			partialize: (state) => ({
				theme: state.theme,
				sidebarOpen: state.sidebarOpen,
				thinkingVisibility: state.thinkingVisibility,
			}),
		},
	),
)
