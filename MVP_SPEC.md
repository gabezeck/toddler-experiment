# DialogFlow AI - MVP Specification

## Executive Summary

Transform "Toddler Experiment" from functional prototype into **DialogFlow AI** - a polished, open-source tool for exploring AI agent conversations with delightful UX and professional presentation.

## Product Vision

> "Watch AI Agents Think, Debate, and Create"

A beautifully crafted tool where users can configure agent personalities, watch them reason in real-time with smooth animations, and save interesting conversations.

## Success Metrics

- **Time to first conversation**: < 30 seconds (via presets)
- **Visual polish**: Animations on all interactions
- **Feature completeness**: Presets, history, export, themes
- **Open-source readiness**: Professional documentation

---

## Feature Specifications

### 1. Conversation Presets System

**Problem**: Empty forms create friction - users don't know what to write.

**Solution**: Pre-built scenarios with one-click activation.

**Requirements**:
- 5 built-in presets with diverse scenarios
- Preset cards showing: name, description, participant icons
- One-click activation (replaces all config)
- "Custom" option for manual configuration
- Create/save custom presets

**Presets**:
1. **Curious Toddlers** (default) - Two 4-year-olds learning together
2. **Tech vs Humanity** - Technocrat vs Humanist debate
3. **Historical Figures** - Any two historical figures
4. **Creative Partners** - Two writers brainstorming
5. **Philosophy Salon** - Ethicists debating morality

**Acceptance**:
- User can start a conversation within 2 clicks
- Preset cards have hover animations
- Preset application is instant

### 2. Enhanced Conversation Interface

**Problem**: Plain text list lacks visual hierarchy and feedback.

**Solution**: Animated message bubbles with speaker differentiation.

**Requirements**:
- Agent avatars with personality-matching colors
- Typing indicator when agent is generating
- Message entrance animations (staggered fade-in, slide from side)
- Collapsible thinking panel with smooth height transition
- Syntax highlighting for code blocks
- Copy button on each message
- Timestamps with relative time ("2 min ago")
- Turn counter ("Round 3 of 20")
- Current speaker highlighting (animated border)

**Acceptance**:
- Each message animates in smoothly
- Typing indicator shows before message appears
- Thinking panel expands/collapses without layout shift

### 3. Conversation Management

**Problem**: Only export to .txt; no way to revisit past conversations.

**Solution**: Full history system with favorites and export.

**Requirements**:
- Auto-save to localStorage every message
- History drawer showing saved conversations
- Metadata: date, agent names, message count
- Star/favorite for quick access
- Export to JSON (full data) or Markdown (readable)
- Search through saved conversations
- Delete with confirmation modal

**Acceptance**:
- Conversations persist across browser sessions
- Can search and find old conversations
- Export produces readable Markdown

### 4. Visual Design System

**Problem**: Generic gray/white Tailwind defaults, no brand identity.

**Solution**: Modern glassmorphism with gradient accents.

**Requirements**:
- Gradient hero section with animated background
- Glassmorphism: semi-transparent panels with blur
- Dark/light mode toggle with smooth transition
- Agent-specific color coding
- Custom scrollbar styling
- Responsive mobile layout
- Smooth page transitions

**Design Tokens**:

```css
/* Light Mode */
--bg-primary: #f8fafc
--bg-card: rgba(255, 255, 255, 0.8)
--accent-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--agent-1-color: #3b82f6 (blue)
--agent-2-color: #10b981 (emerald)
--web-surfer-color: #f59e0b (amber)

/* Dark Mode */
--bg-primary: #0f172a
--bg-card: rgba(30, 41, 59, 0.8)
--accent-gradient: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)
```

**Acceptance**:
- Theme toggle works smoothly
- All components are responsive
- Custom scrollbar visible

### 5. Configuration UX Improvements

**Problem**: Long forms always visible, overwhelming for first-time users.

**Solution**: Progressive disclosure with accordion panels.

**Requirements**:
- Preset selection first (no empty state)
- "Configure" button reveals agent details (accordion)
- Character counters (e.g., "472/2000")
- Validation: can't start with empty prompts
- Template suggestions dropdown
- "Quick Edit" mode during conversations

**Acceptance**:
- New user sees presets, not empty forms
- Validation prevents starting with missing config
- Character counter updates in real-time

### 6. Controls & Feedback

**Problem**: No indication of conversation progress or state.

**Solution**: Comprehensive controls and visual feedback.

**Requirements**:
- Current speaker highlighted with animated pulse
- Progress indicator: "Round 3 of 20"
- Pause button (halts between turns)
- Resume button
- Clear "Chat ended" message when complete
- Toast notifications for actions (saved, exported, error)
- Speed control (1x, 2x for development)

**Acceptance**:
- Always know which agent is active
- Can pause mid-conversation
- Toast appears on save/error

### 7. Open Source Professionalization

**Problem**: Generic metadata, poor onboarding for contributors.

**Solution**: Professional open-source project presentation.

**Requirements**:
- Professional README with screenshots/GIF
- Contributing guidelines with dev setup
- GitHub issue/PR templates
- Code of conduct
- Environment variable examples (.env.example)
- Setup verification script
- Troubleshooting section
- Clear license (MIT)

**Deliverables**:
- `README.md` (rewrite)
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `.env.example`
- `.github/ISSUE_TEMPLATE/`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `scripts/verify-setup.js`

### 8. Technical Improvements

**Requirements**:
- Proper TypeScript types throughout
- Error boundaries for graceful failure
- Loading states for all async operations
- Refactored Python to support pause/resume
- Better error messages (user-friendly)
- React Hook Form for config
- Playwright for E2E tests

---

## Technical Architecture

### Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **State**: Zustand
- **Icons**: Lucide React
- **Markdown**: react-markdown + remark-gfm

### Component Structure

```
/app
  /page.tsx (main controller)
  /layout.tsx (theme provider)
  /globals.css (design tokens)
  /components
    /ui
      - Button.tsx
      - Card.tsx
      - Input.tsx
      - Textarea.tsx
      - Accordion.tsx
      - Toast.tsx
    /conversation
      - HeroSection.tsx
      - PresetGallery.tsx
      - ConfigPanel.tsx
      - ConversationView.tsx
      - MessageBubble.tsx
      - ThinkingPanel.tsx
      - ConversationControls.tsx
    /history
      - HistoryDrawer.tsx
      - ConversationCard.tsx
  /stores
    - conversationStore.ts
    - configStore.ts
    - historyStore.ts
    - uiStore.ts
  /lib
    - utils.ts
    - presets.ts
    - storage.ts
  /types
    - index.ts
```

### State Management (Zustand)

```typescript
// conversationStore.ts
interface ConversationState {
  messages: Message[]
  isChatting: boolean
  currentRound: number
  maxRound: number
  isPaused: boolean
  // actions...
}

// configStore.ts
interface ConfigState {
  agent1Name: string
  agent1Prompt: string
  agent2Name: string
  agent2Prompt: string
  initialMessage: string
  selectedPreset: string | null
  // actions...
}

// historyStore.ts
interface HistoryState {
  conversations: SavedConversation[]
  favorites: Set<string>
  // actions...
}

// uiStore.ts
interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  thinkingVisibility: Record<number, boolean>
  // actions...
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Days 1-2)
- Install dependencies (framer-motion, zustand, lucide-react, clsx, tailwind-merge, date-fns)
- Set up Zustand stores
- Create base UI components (Button, Card, Input, Textarea)
- Implement theme provider (dark/light mode)
- Create utility functions (cn, formatters)

### Phase 2: Visual Core (Days 3-4)
- Build HeroSection with gradient
- Create PresetGallery with preset cards
- Build ConfigPanel with accordion
- Create MessageBubble component with entrance animations
- Implement glassmorphism styling system
- Custom scrollbar

### Phase 3: Conversation Features (Days 5-6)
- Typing indicator animation
- Progress tracking (round counter)
- ThinkingPanel with expand/collapse
- MessageActions (copy, timestamp)
- Pause/resume controls
- Toast notifications

### Phase 4: History & Export (Days 7-8)
- localStorage persistence layer
- HistoryDrawer component
- ConversationCard with metadata
- Save/delete/favorite functionality
- Export to JSON/Markdown
- Search through conversations

### Phase 5: Polish & Professionalization (Days 9-10)
- Error boundaries
- Loading states
- Form validation
- Rewrite README.md
- Create CONTRIBUTING.md
- Add GitHub templates
- Create setup verification script
- Generate screenshots/GIF

---

## Dependencies to Add

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "zustand": "^5.0.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "date-fns": "^3.0.0"
  }
}
```

---

## Open Source Checklist

- [ ] Professional README with hero GIF
- [ ] Contributing guidelines
- [ ] Code of conduct
- [ ] MIT License (confirm existing)
- [ ] .env.example
- [ ] Issue templates
- [ ] PR template
- [ ] Setup verification script
- [ ] Screenshots for README
- [ ] Demo GIF/video

---

## Definition of Done

A feature is complete when:
- [ ] Requirements implemented
- [ ] Animations smooth
- [ ] Responsive on mobile
- [ ] Dark/light mode works
- [ ] TypeScript types correct
- [ ] No console errors
- [ ] Loading states present
- [ ] Error handling graceful

---

*Version 1.0 - Prepared for implementation*
