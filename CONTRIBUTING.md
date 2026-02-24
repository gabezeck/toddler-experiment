# Contributing to DialogFlow AI

First off, thank you for considering contributing to DialogFlow AI! It's people like you that make open-source projects thrive.

---

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [What Can I Contribute?](#what-can-i-contribute)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Pull Request Process](#pull-request-process)
- [Getting Help](#getting-help)

---

## Code of Conduct

This project and its contributors are expected to adhere to the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## What Can I Contribute?

We welcome contributions in many forms:

### 🐛 Bug Fixes
- Found a bug? Check existing [issues](https://github.com/yourusername/toddler-experiment/issues) first
- If it's new, [create an issue](https://github.com/yourusername/toddler-experiment/issues/new?template=bug_report.md) with details
- Submit a pull request with the fix

### ✨ New Features
- Check existing issues and [feature requests](https://github.com/yourusername/toddler-experiment/issues?q=is%3Aissue+is%3Aopen+label%3Afeature)
- Open a discussion for major features before implementing
- Small improvements can go directly to PR

### 📖 Documentation
- Improve existing docs
- Add examples or tutorials
- Fix typos or unclear sections

### 🎨 Design & UX
- UI/UX improvements
- Animation refinements
- Accessibility enhancements

### 🧪 Tests
- Add unit tests
- Improve test coverage
- Add E2E tests

---

## Prerequisites

Before contributing, ensure you have:

### Required Tools
- **Node.js** 18 or higher
- **pnpm** 8 or higher
- **Python** 3.9 or higher
- **Git** for version control

### Accounts
- [GitHub account](https://github.com/signup)
- (Optional) [OpenAI API key](https://platform.openai.com/api-keys) for testing

---

## Getting Started

### 1. Fork and Clone

1. **Fork the repository**
   - Click "Fork" in the top-right of [the repo page](https://github.com/yourusername/toddler-experiment)
   - This creates a copy under your GitHub account

2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/toddler-experiment.git
   cd toddler-experiment
   ```

3. **Add upstream remote** (to stay updated with main repo)
   ```bash
   git remote add upstream https://github.com/original-owner/toddler-experiment.git
   ```

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
pnpm install
```

**Backend:**
```bash
# From project root
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
playwright install
```

### 3. Configure Environment

```bash
cd frontend
cp ../.env.example .env
# Edit .env and add your OpenAI API key
```

### 4. Verify Setup

```bash
node scripts/verify-setup.js
```

This should report all checks as passing.

### 5. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

---

## Development Workflow

### Running the Development Server

```bash
cd frontend
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Making Changes

1. **Make your changes** with clear, focused commits
   ```bash
   git add .
   git commit -m "feat: add preset search functionality"
   ```

2. **Commit message guidelines:**
   - Start with a type: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
   - Keep the subject line under 72 characters
   - Use imperative mood ("add" not "added" or "adds")
   - Add body for complex changes explaining "why"

3. **Sync with upstream** before pushing
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Code Style Guidelines

### TypeScript / JavaScript

- **Use TypeScript** for all new files
- **Prefer const over let** - use var never
- **Use arrow functions** for callbacks
- **Component names** should be PascalCase
- **File names** should match export names (e.g., `MessageBubble.tsx`)

### React / Next.js

- **Use functional components** with hooks
- **Keep components small** - single responsibility
- **Use Zustand** for shared state, `useState` for local
- **Memoize** expensive computations with `useMemo`
- **Callback** refs for event handlers with `useCallback`

### Styling

- **Use Tailwind utility classes** where possible
- **Use clsx + cn() utility** for conditional classes
- **Avoid inline styles** except for dynamic values
- **Mobile-first** responsive design

### Python

- **Follow PEP 8** style guide
- **Use type hints** for function signatures
- **Docstrings** for all public functions
- **Maximum line length**: 100 characters

### General

- **Write self-documenting code** - comments should explain "why", not "what"
- **No commented-out code** in commits
- **Remove unused imports and variables**
- **Use meaningful variable and function names**

---

## Pull Request Process

### 1. Before Opening a PR

- [ ] Run the verification script: `node scripts/verify-setup.js`
- [ ] Test your changes manually
- [ ] Check for console errors
- [ ] Ensure responsive design (mobile + desktop)
- [ ] Test both light and dark modes
- [ ] Run linting: `pnpm lint` (if configured)
- [ ] Run tests: `pnpm test` (if configured)

### 2. Opening the PR

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. **Title:** Follow commit message style
   - Good: `feat: add conversation export to Markdown`
   - Bad: `update files` or `fixed stuff`

4. **Description template:**
   ```markdown
   ## Summary
   Brief description of changes (2-3 sentences)

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tested manually
   - [ ] Added/updated tests
   - [ ] Tested on mobile
   - [ ] Tested dark/light mode

   ## Screenshots (if applicable)
   <!-- Add screenshots or GIFs -->

   ## Related Issues
   Fixes #123
   ```

5. **Link issues:** Use `Fixes #123` or `Closes #123` to auto-close on merge

### 3. After Opening

- **Respond to review feedback** promptly
- **Make requested changes** or discuss alternatives
- **Keep the PR updated** by pushing new commits
- **Mark conversations as resolved** when addressed

### 4. Merge Criteria

Your PR will be merged when:
- All checks pass
- At least one maintainer approves
- All feedback is addressed
- No merge conflicts

---

## Getting Help

### Documentation
- [MVP Spec](./MVP_SPEC.md) - Project vision and feature details
- [Next.js Docs](https://nextjs.org/docs)
- [pyautogen Docs](https://microsoft.github.io/autogen/)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

### Community
- **GitHub Issues:** For bugs and feature requests
- **GitHub Discussions:** For questions and ideas (coming soon)

### Quick Help
If you're stuck:
1. Check existing [issues](https://github.com/yourusername/toddler-experiment/issues)
2. Search the codebase for similar patterns
3. Ask in your PR comments if context-specific
4. Open a discussion for general questions

---

## Recognition

Contributors are recognized in:
- [CONTRIBUTORS.md](CONTRIBUTORS.md) - All contributors list
- Release notes - For notable contributions
- The project README - For major contributors

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for contributing! 🎉**

Every contribution, no matter how small, helps make DialogFlow AI better for everyone.
