# AI Agent Context Files

This directory contains context-specific documentation for AI coding agents, split by task type to optimize token usage.

## Structure

The main `AGENTS.md` file in the repository root provides a quick start guide and references these detailed context files. AI agents should:

1. Always read `AGENTS.md` first (lightweight, ~100 lines)
2. Load only the specific context files needed for their current task

## Context Files

### Always Relevant
- **`overview.md`** - Repository structure, tech stack, and package scopes

### Task-Specific Context

**Building & Development:**
- **`build.md`** - Build system, commands, and Nx targets (~60 lines)
- **`runtime.md`** - Runtime requirements and setup (~40 lines)

**Code Quality:**
- **`testing.md`** - Unit, integration, and E2E testing guidelines (~80 lines)
- **`linting.md`** - ESLint configuration and linting commands (~30 lines)
- **`code-style.md`** - TypeScript conventions, JSDoc, and best practices (~50 lines)

**Version Control:**
- **`git-workflow.md`** - Git workflow, commit messages, protected branches, and CI/CD rules (~70 lines)

**Contributing:**
- **`contributing.md`** - Contribution rules, PR process, and quality requirements (~40 lines)

**Agent Tasks (runnable prompts):**
- **`fix-audit.md`** - Fix critical audit vulnerabilities for a given PR number (used by `/fix-audit` in Claude Code and `fix-audit.prompt.md` in Copilot)

**Advanced Features:**
- **`advanced.md`** - Otter-specific concepts, metadata extraction, core modules (~30 lines)
- **`tools.md`** - Verdaccio, documentation generation, VSCode integration (~50 lines)

## Benefits of This Approach

- **Reduced Token Usage:** Load only relevant context (typical: 100-200 lines vs full 500+ line file)
- **Faster Processing:** Less content to parse per interaction
- **Better Focus:** AI agents get precisely the information they need
- **Easier Maintenance:** Update specific sections without affecting others
- **Scalability:** Easy to add new context files as the project grows

## Usage Examples

**Example 1: Writing Tests**
Load: `AGENTS.md` + `testing.md` + `code-style.md` (~230 lines)

**Example 2: Building Code**
Load: `AGENTS.md` + `build.md` + `runtime.md` (~200 lines)

**Example 3: Creating PR**
Load: `AGENTS.md` + `git-workflow.md` + `contributing.md` (~210 lines)

**Example 4: Full Context**
Load all files (~600 lines total, still better organized than one large file)

## Maintaining These Files

- Keep files focused on their specific domain
- Update when significant changes occur in that domain
- Keep consistent formatting across all files
- Link to main repository docs (CONTRIBUTING.md, etc.) for additional details
- AI agents with edit permissions can update these files as they discover changes
