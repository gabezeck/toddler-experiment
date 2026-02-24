# DialogFlow AI

<div align="center">

![Watch AI Agents Think, Debate, and Create](https://img.shields.io/badge/Watch-AI_Agents_Think%2C_Debate%2C_and_Create-purple?style=for-the-badge)

**A beautifully crafted tool for exploring AI agent conversations with delightful UX**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue)](https://www.python.org/)

<!-- DEMO GIF PLACEHOLDER: Add your animated GIF here -->
<!-- 
<img src="public/demo.gif" alt="DialogFlow AI Demo" width="800">
-->
*[Demo GIF coming soon]*

</div>

---

## Features

### 🎭 Conversation Presets
Start exploring immediately with built-in scenarios:
- **Curious Toddlers** - Two 4-year-olds learning together
- **Tech vs Humanity** - Technocrat vs Humanist debate
- **Historical Figures** - Any two historical figures
- **Creative Partners** - Two writers brainstorming
- **Philosophy Salon** - Ethicists debating morality

### 💬 Real-Time Conversation View
- Watch agents think before they speak with expandable thought panels
- Smooth message entrance animations
- Typing indicators show when agents are generating
- Turn counter tracks conversation progress

### 🎨 Modern Design
- Beautiful glassmorphism UI with gradient accents
- Dark/light mode with smooth transitions
- Responsive mobile layout
- Custom scrollbars and polished interactions

### 📚 History & Export
- Auto-save conversations to browser storage
- Star favorites for quick access
- Export to JSON (full data) or Markdown (readable)
- Search through saved conversations

### ⚙️ Custom Configuration
- Create custom agent personalities
- Adjust conversation parameters
- Pause/resume conversations
- Create and save your own presets

---

## Quick Start

Get started in less than 30 seconds:

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/toddler-experiment.git
   cd toddler-experiment/frontend
   pnpm install
   ```

2. **Configure your API key**
   ```bash
   # Copy .env.example to .env and add your OpenAI API key
   cp ../.env.example .env
   # Edit .env and add: OPENAI_API_KEY=sk-your-key-here
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Select a preset and start chatting!**

---

## Installation

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Python** 3.9+ ([Download](https://www.python.org/))
- **OpenAI API key** ([Get one](https://platform.openai.com/api-keys))

### Frontend Setup
```bash
cd frontend
pnpm install
```

### Backend Setup
```bash
# From project root
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Install Playwright browsers (for web-surfing agent)
playwright install
```

### Environment Configuration
Create a `.env` file in the frontend directory:
```bash
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4
```

---

## Development

### Running Development Servers

**Frontend:**
```bash
cd frontend
pnpm dev
```
Opens at [http://localhost:3000](http://localhost:3000)

**Backend (Python):**
The backend is automatically started by the Next.js API when you begin a chat from the frontend.

### Verification Script
Run the setup verification to ensure everything is configured:
```bash
node scripts/verify-setup.js
```

### Project Structure
```
toddler-experiment/
├── frontend/              # Next.js frontend application
│   ├── app/              # App Router directory
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   └── stores/           # Zustand state management
├── main.py               # Backend Python script
├── config.json           # Agent configuration
├── requirements.txt      # Python dependencies
└── scripts/              # Setup and utility scripts
```

### Tech Stack
- **Frontend:** Next.js 16, React, TypeScript, Tailwind CSS, Framer Motion
- **State:** Zustand
- **Backend:** Python, pyautogen, Playwright
- **Styling:** Tailwind CSS v4 with custom design tokens

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Development setup
- Code style guidelines
- Pull request process
- Getting help

**Quick start for contributors:**
1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commits
4. Submit a pull request with a description

---

## Screenshots

<!-- 
Add screenshots here showing:
1. Preset selection screen
2. Active conversation with thinking panels
3. History drawer
4. Theme toggle

Example:
<img src="public/screenshot-1.png" alt="Preset Selection" width="400">
-->

*Screenshots coming soon*

---

## Troubleshooting

### "OpenAI API key not found"
- Ensure `.env` file exists in the `frontend/` directory
- Verify it contains `OPENAI_API_KEY=sk-...`
- Restart the development server after creating `.env`

### "Python not found"
- Ensure Python 3.9+ is installed and in your PATH
- On Windows, you may need to restart your terminal after installing Python

### "Playwright browser not found"
- Run `playwright install` from the project root
- This downloads the browser binaries needed for web-surfing

### "Port 3000 already in use"
- Either stop the process using port 3000, or
- Run `pnpm dev -- -p 3001` to use a different port

### Conversation freezes
- Check the browser console for errors
- Verify your OpenAI API key has credits available
- Try reducing `max_round` in the configuration

For more help, please [open an issue](https://github.com/yourusername/toddler-experiment/issues/new).

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Built with [pyautogen](https://github.com/microsoft/autogen) by Microsoft

---

<div align="center">

**Made with ❤️ for the AI community**

[⭐ Star us on GitHub](https://github.com/yourusername/toddler-experiment) • [🐛 Report a Bug](https://github.com/yourusername/toddler-experiment/issues/new) • [💡 Request a Feature](https://github.com/yourusername/toddler-experiment/issues/new)

</div>
