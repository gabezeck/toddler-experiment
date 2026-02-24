"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/app/lib/utils"
import { useState, useEffect } from "react"
import { ChevronDown, Edit3, Check, Sparkles } from "lucide-react"
import { useConfigStore } from "@/app/stores/configStore"
import { Input } from "@/app/components/ui/Input"
import { Textarea } from "@/app/components/ui/Textarea"
import { Button } from "@/app/components/ui/Button"

const MAX_PROMPT_LENGTH = 2000
const AGENT_COLORS = {
	agent1: "var(--agent-1-color)",
	agent2: "var(--agent-2-color)",
}

const TEMPLATES = [
	{
		id: "debate",
		name: "Debate",
		description: "Two agents with opposing viewpoints",
		agent1Name: "Proponent",
		agent1Prompt: "You argue in favor of the given topic with compelling evidence and logic.",
		agent2Name: "Opponent",
		agent2Prompt: "You argue against the given topic with compelling counterarguments.",
		initialMessage: "Let's discuss: Should AI be regulated?",
	},
	{
		id: "teacher-student",
		name: "Teacher & Student",
		description: "Educational dialogue",
		agent1Name: "Teacher",
		agent1Prompt: "You are a patient, knowledgeable teacher who explains concepts clearly and encourages critical thinking.",
		agent2Name: "Student",
		agent2Prompt: "You are a curious student who asks questions and tries to understand the concepts being taught.",
		initialMessage: "Can you explain how photosynthesis works?",
	},
	{
		id: "creative",
		name: "Creative Collaboration",
		description: "Brainstorming and ideation",
		agent1Name: "Ideator",
		agent1Prompt: "You generate creative, bold ideas and think outside the box.",
		agent2Prompt: "You build upon ideas, adding practical details and refining the concepts.",
		agent2Name: "Refiner",
		initialMessage: "Let's brainstorm ideas for a sustainable city of the future.",
	},
]

interface ValidationErrors {
	agent1Name?: string
	agent1Prompt?: string
	agent2Name?: string
	agent2Prompt?: string
	initialMessage?: string
}

interface ConfigPanelProps {
	onStart?: () => void
	className?: string
}

/**
 * ConfigPanel - Collapsible configuration panel for DialogFlow AI
 * Features:
 * - Accordion-style panels with smooth animations
 * - Real-time character counting (max 2000 for prompts)
 * - Live validation with visual feedback
 * - Quick Edit mode for streamlined configuration
 * - Template suggestions for quick setup
 * - Color-coded headers per agent
 * - Glassmorphism design with backdrop blur
 */
export function ConfigPanel({ onStart, className }: ConfigPanelProps) {
	const { agent1, agent2, initialMessage, setAgent1, setAgent2, setInitialMessage } =
		useConfigStore()

	const [openPanels, setOpenPanels] = useState<Set<string>>(new Set(["agent1"]))
	const [quickEditMode, setQuickEditMode] = useState(false)
	const [showTemplates, setShowTemplates] = useState(false)
	const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
	const [isValid, setIsValid] = useState(false)
	const [touched, setTouched] = useState({
		agent1Name: false,
		agent1Prompt: false,
		agent2Name: false,
		agent2Prompt: false,
		initialMessage: false,
	})

	// Toggle accordion panel
	const togglePanel = (panelId: string) => {
		setOpenPanels((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(panelId)) {
				newSet.delete(panelId)
			} else {
				newSet.add(panelId)
			}
			return newSet
		})
	}

	// Validate fields
	useEffect(() => {
		const errors: ValidationErrors = {}

		if (touched.agent1Name && !agent1.name.trim()) {
			errors.agent1Name = "Agent 1 name is required"
		}
		if (touched.agent1Prompt && !agent1.prompt.trim()) {
			errors.agent1Prompt = "Agent 1 prompt is required"
		}
		if (touched.agent2Name && !agent2.name.trim()) {
			errors.agent2Name = "Agent 2 name is required"
		}
		if (touched.agent2Prompt && !agent2.prompt.trim()) {
			errors.agent2Prompt = "Agent 2 prompt is required"
		}
		if (touched.initialMessage && !initialMessage.trim()) {
			errors.initialMessage = "Initial message is required"
		}

		setValidationErrors(errors)

		const valid = Boolean(
			agent1.name.trim() &&
			agent1.prompt.trim() &&
			agent2.name.trim() &&
			agent2.prompt.trim() &&
			initialMessage.trim()
		)

		setIsValid(valid)
	}, [agent1, agent2, initialMessage, touched])

	// Handle field change with touch tracking
	const handleFieldChange = (
		field: keyof typeof touched,
		value: string,
		setter: (val: any) => void
	) => {
		setter(value)
		setTouched((prev) => ({ ...prev, [field]: true }))
	}

	// Apply template
	const applyTemplate = (template: (typeof TEMPLATES)[0]) => {
		setAgent1({
			name: template.agent1Name,
			prompt: template.agent1Prompt,
			color: "#3b82f6",
		})
		setAgent2({
			name: template.agent2Name,
			prompt: template.agent2Prompt,
			color: "#10b981",
		})
		setInitialMessage(template.initialMessage)
		setTouched({
			agent1Name: true,
			agent1Prompt: true,
			agent2Name: true,
			agent2Prompt: true,
			initialMessage: true,
		})
		setShowTemplates(false)
	}

	// Handle start
	const handleStart = () => {
		// Mark all as touched for validation
		setTouched({
			agent1Name: true,
			agent1Prompt: true,
			agent2Name: true,
			agent2Prompt: true,
			initialMessage: true,
		})

		if (isValid && onStart) {
			onStart()
		}
	}

	// Accordion item component
	interface AccordionItemProps {
		id: string
		title: string
		color: string
		isOpen: boolean
		children: React.ReactNode
	}

	const AccordionItem = ({ id, title, color, isOpen, children }: AccordionItemProps) => (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl"
		>
			<motion.button
				type="button"
				onClick={() => togglePanel(id)}
				className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
				style={{
					borderLeft: `4px solid ${color}`,
				}}
			>
				<span className="font-medium text-white">{title}</span>
				<motion.div
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={{ duration: 0.2 }}
					className="ml-2"
				>
					<ChevronDown className="h-5 w-5 text-slate-400" />
				</motion.div>
			</motion.button>
			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={{ height: 0 }}
						animate={{ height: "auto" }}
						exit={{ height: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<div className="px-4 pb-4 pt-2">{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)

	return (
		<div className={cn("space-y-4", className)}>
			{/* Header with Quick Edit and Templates */}
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-white">Configuration</h2>
				<div className="flex gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowTemplates(!showTemplates)}
						className="gap-1.5"
					>
						<Sparkles className="h-4 w-4" />
						Templates
					</Button>
					<Button
						variant={quickEditMode ? "primary" : "secondary"}
						size="sm"
						onClick={() => setQuickEditMode(!quickEditMode)}
						className="gap-1.5"
					>
						<Edit3 className="h-4 w-4" />
						{quickEditMode ? "Quick Edit" : "Standard"}
					</Button>
				</div>
			</div>

			{/* Template Suggestions Dropdown */}
			<AnimatePresence>
				{showTemplates && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl"
					>
						<div className="p-4 space-y-2">
							<p className="text-sm font-medium text-slate-300">Quick Start Templates</p>
							{TEMPLATES.map((template) => (
								<motion.button
									key={template.id}
									type="button"
									onClick={() => applyTemplate(template)}
									className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left transition-all hover:border-white/20 hover:bg-white/10"
									whileHover={{ scale: 1.01 }}
									whileTap={{ scale: 0.99 }}
								>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-white">{template.name}</p>
											<p className="text-sm text-slate-400">{template.description}</p>
										</div>
										<Check className="h-5 w-5 text-slate-500" />
									</div>
								</motion.button>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Quick Edit Mode */}
			{quickEditMode ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="space-y-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4"
				>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Input
								label="Agent 1 Name"
								value={agent1.name}
								onChange={(e) =>
									handleFieldChange("agent1Name", e.target.value, (val) =>
										setAgent1({ ...agent1, name: val })
									)
								}
								placeholder="Enter agent name"
								error={validationErrors.agent1Name}
							/>
							<Textarea
								label="Agent 1 Prompt"
								value={agent1.prompt}
								onChange={(e) =>
									handleFieldChange("agent1Prompt", e.target.value, (val) =>
										setAgent1({ ...agent1, prompt: val })
									)
								}
								placeholder="Enter agent prompt"
								showCharacterCount
								maxLength={MAX_PROMPT_LENGTH}
								rows={4}
								className="mt-3"
								error={validationErrors.agent1Prompt}
							/>
						</div>
						<div>
							<Input
								label="Agent 2 Name"
								value={agent2.name}
								onChange={(e) =>
									handleFieldChange("agent2Name", e.target.value, (val) =>
										setAgent2({ ...agent2, name: val })
									)
								}
								placeholder="Enter agent name"
								error={validationErrors.agent2Name}
							/>
							<Textarea
								label="Agent 2 Prompt"
								value={agent2.prompt}
								onChange={(e) =>
									handleFieldChange("agent2Prompt", e.target.value, (val) =>
										setAgent2({ ...agent2, prompt: val })
									)
								}
								placeholder="Enter agent prompt"
								showCharacterCount
								maxLength={MAX_PROMPT_LENGTH}
								rows={4}
								className="mt-3"
								error={validationErrors.agent2Prompt}
							/>
						</div>
					</div>
					<Textarea
						label="Initial Message"
						value={initialMessage}
						onChange={(e) =>
							handleFieldChange("initialMessage", e.target.value, setInitialMessage)
						}
						placeholder="Enter the opening message to start the conversation"
						rows={3}
						error={validationErrors.initialMessage}
					/>
				</motion.div>
			) : (
				/* Standard Accordion Mode */
				<div className="space-y-2">
					<AccordionItem
						id="agent1"
						title="Agent 1 Configuration"
						color={AGENT_COLORS.agent1}
						isOpen={openPanels.has("agent1")}
					>
						<div className="space-y-3">
							<Input
								label="Agent Name"
								value={agent1.name}
								onChange={(e) =>
									handleFieldChange("agent1Name", e.target.value, (val) =>
										setAgent1({ ...agent1, name: val })
									)
								}
								placeholder="Enter agent name"
								error={validationErrors.agent1Name}
							/>
							<Textarea
								label="System Prompt"
								value={agent1.prompt}
								onChange={(e) =>
									handleFieldChange("agent1Prompt", e.target.value, (val) =>
										setAgent1({ ...agent1, prompt: val })
									)
								}
								placeholder="Enter agent prompt"
								showCharacterCount
								maxLength={MAX_PROMPT_LENGTH}
								rows={6}
								error={validationErrors.agent1Prompt}
								helperText="Describe the agent's personality, role, and behavior"
							/>
						</div>
					</AccordionItem>

					<AccordionItem
						id="agent2"
						title="Agent 2 Configuration"
						color={AGENT_COLORS.agent2}
						isOpen={openPanels.has("agent2")}
					>
						<div className="space-y-3">
							<Input
								label="Agent Name"
								value={agent2.name}
								onChange={(e) =>
									handleFieldChange("agent2Name", e.target.value, (val) =>
										setAgent2({ ...agent2, name: val })
									)
								}
								placeholder="Enter agent name"
								error={validationErrors.agent2Name}
							/>
							<Textarea
								label="System Prompt"
								value={agent2.prompt}
								onChange={(e) =>
									handleFieldChange("agent2Prompt", e.target.value, (val) =>
										setAgent2({ ...agent2, prompt: val })
									)
								}
								placeholder="Enter agent prompt"
								showCharacterCount
								maxLength={MAX_PROMPT_LENGTH}
								rows={6}
								error={validationErrors.agent2Prompt}
								helperText="Describe the agent's personality, role, and behavior"
							/>
						</div>
					</AccordionItem>

					<AccordionItem
						id="initialMessage"
						title="Initial Message"
						color="#f59e0b"
						isOpen={openPanels.has("initialMessage")}
					>
						<Textarea
							label="Opening Message"
							value={initialMessage}
							onChange={(e) =>
								handleFieldChange("initialMessage", e.target.value, setInitialMessage)
							}
							placeholder="Enter the opening message to start the conversation"
							rows={4}
							error={validationErrors.initialMessage}
							helperText="This message will start the dialogue between the two agents"
						/>
					</AccordionItem>
				</div>
			)}

			{/* Start Button with Validation */}
			<div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
				<div>
					<p className="font-medium text-white">Ready to start?</p>
					<p className="text-sm text-slate-400">
						{isValid
							? "All fields are configured"
							: "Please fill in all required fields"}
					</p>
				</div>
				<Button
					variant="primary"
					size="lg"
					onClick={handleStart}
					disabled={!isValid}
					className="gap-2"
				>
					{isValid ? (
						<>
							<Check className="h-5 w-5" />
							Start Conversation
						</>
					) : (
						<>
							<Edit3 className="h-5 w-5" />
							Complete Configuration
						</>
					)}
				</Button>
			</div>

			{/* Validation Summary */}
			{!isValid && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
				>
					<p className="text-sm font-medium text-red-400">Required fields missing:</p>
					<ul className="mt-2 space-y-1 text-sm text-red-300">
						{!agent1.name.trim() && <li>• Agent 1 name</li>}
						{!agent1.prompt.trim() && <li>• Agent 1 prompt</li>}
						{!agent2.name.trim() && <li>• Agent 2 name</li>}
						{!agent2.prompt.trim() && <li>• Agent 2 prompt</li>}
						{!initialMessage.trim() && <li>• Initial message</li>}
					</ul>
				</motion.div>
			)}
		</div>
	)
}
