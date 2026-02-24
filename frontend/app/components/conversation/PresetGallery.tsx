'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { useConfigStore } from '@/app/stores/configStore'
import { PRESETS } from '@/app/lib/presets'
import type { Preset } from '@/app/lib/presets'

interface PresetGalleryProps {
	onPresetSelect?: (preset: Preset) => void
	className?: string
}

/**
 * PresetGallery - Pre-built scenario cards for one-click activation
 * Features:
 * - 5 built-in presets with diverse scenarios
 * - Hover animations on cards
 * - Visual selection indicator
 * - One-click activation
 */
export function PresetGallery({ onPresetSelect, className }: PresetGalleryProps) {
	const { selectedPreset, applyPreset } = useConfigStore()

	const handlePresetClick = (preset: Preset) => {
		applyPreset(preset)
		onPresetSelect?.(preset)
	}

	return (
		<div className={cn('space-y-4', className)}>
			{/* Header */}
			<div className="flex items-center gap-2">
				<Sparkles className="h-5 w-5 text-purple-400" />
				<h2 className="text-xl font-semibold text-white">Quick Start</h2>
			</div>

			{/* Preset Grid */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<AnimatePresence>
					{PRESETS.map((preset, index) => {
						const isSelected = selectedPreset === preset.id

						return (
							<motion.button
								key={preset.id}
								type="button"
								onClick={() => handlePresetClick(preset)}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
								whileHover={{ scale: 1.02, y: -2 }}
								whileTap={{ scale: 0.98 }}
								className={cn(
									'relative overflow-hidden rounded-xl border p-4 text-left transition-all',
									'backdrop-blur-xl',
									isSelected
										? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/25'
										: 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
								)}
							>
								{/* Selection Indicator */}
								{isSelected && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500"
									>
										<Check className="h-4 w-4 text-white" />
									</motion.div>
								)}

								{/* Icon */}
								<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
									<span className="text-2xl">{preset.icon}</span>
								</div>

								{/* Name */}
								<h3 className="mb-1 font-semibold text-white">{preset.name}</h3>

								{/* Description */}
								<p className="text-sm text-slate-400 line-clamp-2">
									{preset.description}
								</p>

								{/* Agent Preview */}
								<div className="mt-3 flex items-center gap-2 text-xs">
									<div
										className="flex h-6 items-center gap-1 rounded-full px-2"
										style={{
											backgroundColor: `${preset.agent1.color}20`,
											border: `1px solid ${preset.agent1.color}40`,
										}}
									>
										<div
											className="h-2 w-2 rounded-full"
											style={{ backgroundColor: preset.agent1.color }}
										/>
										<span className="text-slate-300">{preset.agent1.name}</span>
									</div>
									<span className="text-slate-500">vs</span>
									<div
										className="flex h-6 items-center gap-1 rounded-full px-2"
										style={{
											backgroundColor: `${preset.agent2.color}20`,
											border: `1px solid ${preset.agent2.color}40`,
										}}
									>
										<div
											className="h-2 w-2 rounded-full"
											style={{ backgroundColor: preset.agent2.color }}
										/>
										<span className="text-slate-300">{preset.agent2.name}</span>
									</div>
								</div>
							</motion.button>
						)
					})}
				</AnimatePresence>
			</div>

			{/* Custom Option */}
			<motion.button
				type="button"
				onClick={() => {
					// Clear preset selection to enable custom mode
					useConfigStore.getState().setSelectedPreset(null)
				}}
				whileHover={{ scale: 1.01 }}
				whileTap={{ scale: 0.99 }}
				className={cn(
					'w-full rounded-xl border p-4 text-left transition-all',
					'backdrop-blur-xl',
					selectedPreset === null
						? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25'
						: 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
				)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
							<Sparkles className="h-6 w-6 text-blue-400" />
						</div>
						<div>
							<h3 className="font-semibold text-white">Custom Configuration</h3>
							<p className="text-sm text-slate-400">
								Create your own agents from scratch
							</p>
						</div>
					</div>
					{selectedPreset === null && (
						<Check className="h-5 w-5 text-blue-400" />
					)}
				</div>
			</motion.button>
		</div>
	)
}
