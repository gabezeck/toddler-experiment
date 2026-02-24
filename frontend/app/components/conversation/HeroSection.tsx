'use client'

import { motion } from 'framer-motion'
import { Sparkles, MessageSquare } from 'lucide-react'
import { cn } from '@/app/lib/utils'

interface HeroSectionProps {
	className?: string
}

/**
 * HeroSection - Animated gradient hero section with title and tagline
 * Features:
 * - Animated gradient background
 * - Floating particle effects
 * - Smooth entrance animations
 * - Responsive layout
 */
export function HeroSection({ className }: HeroSectionProps) {
	return (
		<motion.section
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className={cn(
				'relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-12 text-center shadow-2xl',
				className
			)}
		>
			{/* Animated background gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 opacity-50">
				<motion.div
					className="h-full w-full"
					animate={{
						backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: 'linear',
					}}
					style={{
						background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
						backgroundSize: '200% 200%',
					}}
				/>
			</div>

			{/* Floating particles */}
			{[...Array(6)].map((_, i) => (
				<motion.div
					key={i}
					className="absolute rounded-full bg-white/10"
					initial={{
						x: Math.random() * 100 + '%',
						y: Math.random() * 100 + '%',
						scale: 0,
					}}
					animate={{
						y: [null, -30, null],
						scale: [0, 1, 0],
						opacity: [0, 0.5, 0],
					}}
					transition={{
						duration: 3 + Math.random() * 2,
						repeat: Infinity,
						delay: Math.random() * 2,
					}}
					style={{
						width: `${10 + Math.random() * 20}px`,
						height: `${10 + Math.random() * 20}px`,
						left: `${Math.random() * 100}%`,
						top: `${Math.random() * 100}%`,
					}}
				/>
			))}

			{/* Content */}
			<div className="relative z-10">
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
					className="mb-6 flex justify-center gap-4"
				>
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
						<MessageSquare className="h-8 w-8 text-white" />
					</div>
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
						<Sparkles className="h-8 w-8 text-white" />
					</div>
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="mb-4 text-5xl font-bold text-white sm:text-6xl lg:text-7xl"
				>
					DialogFlow AI
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="mx-auto max-w-2xl text-xl text-white/90 sm:text-2xl"
				>
					Watch AI Agents Think, Debate, and Create
				</motion.p>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="mx-auto mt-4 max-w-xl text-sm text-white/70"
				>
					Configure agent personalities, watch them reason in real-time, and save interesting conversations
				</motion.p>
			</div>
		</motion.section>
	)
}
