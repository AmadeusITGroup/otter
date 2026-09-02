---
name: playwright-e2e-testing
description: This skill should be used when the user asks to "create an E2E test", "write a Playwright scenario", "add a Playwright test", "generate e2e tests", "create actions and checks", "write playwright checks", "add scenario for feature", or when modifying, reviewing, or debugging Playwright E2E test files in the workspace.
---

# Playwright E2E Testing

Standardized architecture and creation process for Playwright end-to-end tests. Enforces a three-layer separation (Actions / Checks / Scenarios), a mandatory 3-gate creation workflow, and consistent coding standards across all UI teams.

## Tooling: Playwright CLI vs Playwright MCP

Use the right tool for each phase of the workflow:

| Phase | Tool | Why |
|-------|------|-----|
| **Exploring the app** (understanding UI, discovering selectors, navigating flows) | **Playwright MCP** | Designed for exploratory automation — headed mode, structured accessibility snapshots in context |
| **Writing & running tests** (authoring test code, debugging failures, CI) | **Playwright CLI** (`@playwright/cli`) | Designed for coding agents in large codebases — lower token cost, headless, concise output |

### Playwright MCP — for exploration

Use Playwright MCP tools when you need to:
- Navigate the application to understand its structure before writing tests
- Discover available roles, labels, and test IDs on a page
- Verify a user journey works interactively before codifying it

### Playwright CLI — for test authoring

Use the CLI when you need to:
- Verify test behavior during development (`playwright-cli open <url> --headed`)
- Debug failing selectors by inspecting snapshots (`playwright-cli snapshot`)
- Prototype interactions before writing test code (`playwright-cli click <ref>`, `playwright-cli fill <ref> <text>`)
- Run tests in headless mode for validation

## Architecture: Actions / Checks / Scenarios

All E2E test code follows a strict separation of concerns:

| Layer | Directory | Contains | Rules |
|-------|-----------|----------|-------|
| **Actions** | `actions/<journey>-actions.ts` | User interactions (clicks, types, navigations) | No assertions. No side effects beyond UI interaction. Reusable across scenarios. |
| **Checks** | `checks/<journey>-checks.ts` | Assertions (visibility, text, state) | No interactions. Pure verification. Composable. |
| **Scenarios** | `scenarios/<feature>/` | Composers wiring actions + checks | Readable as Given-When-Then. One journey per scenario. |

**Why this separation matters:**
- Actions are reusable across scenarios (same interaction, different assertions)
- Checks are composable (combine for smoke vs. full regression)
- Scenarios read as requirements documentation
- Flaky tests are isolated to one layer (broken selector? fix in one action)

### File structure

```
e2e-playwright/
├── actions/<journey>-actions.ts
├── checks/<journey>-checks.ts
├── scenarios/<feature>/
│   └── <name>.e2e.spec.ts
```

## 3-Gate Creation Process (Mandatory)

Before generating any scenario file, pass all 3 gates in order. Skipping any gate is a violation.

### Gate 1: Confirm Inputs

Present the following to the user for explicit approval:
- Feature name
- Scenario name

Do NOT proceed without explicit user confirmation.

### Gate 2: Deduplication Check

Search existing scenarios for overlap:

1. Search all files under `scenarios/`, `actions/`, and `checks/` for the primary action/feature keywords
2. For each match, compute: `shared_steps / max(existing_steps, new_steps) * 100`
3. Present results with recommendation:
   - **>=70%** overlap: complement existing scenario with missing steps, do not create new
   - **40-70%** overlap: extract shared steps into helper, create new scenario
   - **<40%** overlap: create new scenario (with user approval)

### Gate 3: Flow Approval

Present the planned sequence of actions and checks to the user as a step-by-step flow (Given/When/Then). The user confirms it matches the expected behavior. Only after all 3 gates pass, generate files.

## Coding Standards Summary

Action helpers: `Page` as first argument, wait for resulting UI state, return `void`, name describes user intent.

Check helpers: `Page` as first argument, `expect()` assertions only, name describes expected state.

Scenario composition: No raw Playwright calls — only action/check helpers. Comments mark Given/When/Then boundaries. One journey per file.

### Selector Priority

1. Role-based: `getByRole('button', { name: /submit/i })` (preferred)
2. Label-based: `getByLabel('Email address')` (form fields)
3. Test ID: `getByTestId('item-0')` (when no accessible role)
4. Text: `getByText('Continue')` (visible content)
5. CSS (last resort): `page.locator('.item')` (avoid)

Never use XPath, auto-generated class names, or DOM position without semantic meaning.

### Wait Strategy

- After navigation: `waitForLoadState('networkidle')` or `waitForURL()`
- After interaction: `expect(element).toBeVisible()` or `toBeEnabled()`
- After form submit: wait for response or next page indicator
- Never use `waitForTimeout()` with hardcoded values

### Tagging

Use tags to categorize tests by kind for filtering:

```typescript
test.describe('Feature Name @happy-path', () => {
  test('should complete the main flow', async ({ page }) => { ... });
  test('should display correctly @visual', async ({ page }) => { ... });
});
```

Common tags: `@happy-path`, `@visual`, `@edge-case`, `@regression`.

## Anti-Patterns (Hard Rules)

- Assertions inside action helpers (mixing concerns)
- Raw `page.click()` / `page.fill()` in scenario files (bypasses action layer)
- Hardcoded `waitForTimeout()` (slow, flaky)
- CSS/XPath selectors when role-based available
- Skipping dedup check (creates maintenance burden)
- Missing tags in test titles (breaks filtering)
- Mock wiring logic in scenario (breaks reusability)
- Testing implementation details (CSS classes, internal state)
- Extracting actions/checks into shared `actions/` or `checks/` directories before a second scenario needs them (premature abstraction — keep scenario-specific helpers as local functions in the spec file until reuse is needed)

## Stop Rules

Halt and request user input if:
- Any of the 3 gates has not passed
- Deduplication check was skipped
- Architecture violation detected (assertions in actions, raw selectors in scenarios)

## Additional Resources

### Reference Files

For detailed patterns, code examples, and advanced techniques:
- **`references/coding-standards.md`** — Complete action, check, and scenario code examples with patterns
- **`references/creation-process.md`** — Detailed 3-gate process with deduplication scoring examples
- **`references/accessibility.md`** — Accessibility testing coverage requirements and patterns
