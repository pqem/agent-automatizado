# GitHub Copilot Instructions

## Project: agent-automatizado
CLI framework for generating AI agent contracts (AGENTS.md) and modular skills.

## Tech Stack
- Node.js 18+ with ES Modules
- Commander.js (CLI)
- Ink + React (interactive UI)
- js-yaml (YAML parsing)

## Code Style

### Language
- Code comments in Spanish
- Commit messages in Spanish
- Variable names in English

### Modules
- Use `import/export` (ES Modules)
- Never use `require()`
- Async/await over callbacks

### File Structure
```
src/cli.js        - CLI entry point
lib/*.js          - Business logic
scripts/*.cjs     - Auxiliary scripts (CommonJS)
templates/        - AGENTS.md templates
skills/           - Active skills
```

## Commit Format
```
feat(scope): description
fix(scope): description
refactor(scope): description
docs: description
```

## Do NOT
- Add unnecessary documentation files
- Add obvious comments
- Modify package.json without reason
- Create test files unless requested

## Key Commands
```bash
node src/cli.js init        # Initialize project
node src/cli.js skill-sync  # Sync skills to AGENTS.md
node src/cli.js add-skill   # Create new skill
```
