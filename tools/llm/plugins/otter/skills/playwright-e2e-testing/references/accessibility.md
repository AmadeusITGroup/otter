# Accessibility Testing Reference

Accessibility coverage requirements and patterns for Playwright E2E tests.

## Coverage Requirements

For each scenario, add parallel accessibility coverage:

1. **Keyboard-only variant** — same journey navigated via Tab/Enter/Space
2. **Axe scan** — automated accessibility audit at key page states
3. **Focus management** — verify focus moves to expected elements after interactions

## Keyboard-Only Variants

Replicate the scenario journey using only keyboard navigation. Tag with `@a11y`.

### Example

```typescript
// scenarios/add-to-cart/add-to-cart-keyboard.e2e.spec.ts
test.describe('Add to Cart - Keyboard @happy-path @a11y', () => {
  test('complete flow via keyboard only', async ({ page }) => {
    // Given
    await actions.navigateToCatalog(page);
    await keyboardActions.focusSearchAndType(page, 'laptop');
    await keyboardActions.submitWithEnter(page);

    // When
    await keyboardActions.tabToAndActivate(page); // first result
    await keyboardActions.tabToAndActivate(page); // add-to-cart button

    // Then
    await checks.verifyItemInCart(page, 'Laptop');
  });
});
```

### Keyboard Navigation Patterns

| Action | Keys | Notes |
|--------|------|-------|
| Move to next interactive element | `Tab` | Forward navigation |
| Move to previous element | `Shift+Tab` | Backward navigation |
| Activate button/link | `Enter` | Triggers click |
| Toggle checkbox/radio | `Space` | Toggles state |
| Open dropdown | `Enter` or `Space` | Context-dependent |
| Navigate dropdown options | `Arrow Down` / `Arrow Up` | Within open dropdown |
| Select dropdown option | `Enter` | Confirms selection |
| Close modal/dialog | `Escape` | Should return focus |
| Navigate tabs | `Arrow Left` / `Arrow Right` | Within tablist |

## Axe Accessibility Scans

Run automated accessibility audits at key states in the journey.

### Setup with @axe-core/playwright

```typescript
test.describe('Catalog Page Accessibility @a11y', () => {
  test('catalog page meets WCAG 2.1 AA', async ({ page }) => {
    // Given
    await actions.navigateToCatalog(page);

    // Then
    await a11yChecks.verifyNoAxeViolations(page);
  });

  test('search results meet WCAG 2.1 AA', async ({ page }) => {
    // Given
    await actions.navigateToCatalog(page);

    // When
    await actions.searchProducts(page, { query: 'laptop' });

    // Then
    await a11yChecks.verifyNoAxeViolations(page);
  });
});
```

### When to Run Axe Scans

Run an axe scan at each significant page state transition:
- Initial page load
- After form submission
- After navigation to a new page/view
- After modal/dialog opens
- After dynamic content loads (search results, filtered lists)

### Handling Violations

When violations are found:
- Group by impact level (critical > serious > moderate > minor)
- Critical and serious violations must be fixed before merge
- Moderate violations should be tracked as tech debt
- Minor violations are informational

## Focus Management Checks

Verify that focus moves predictably after interactions.

### Common Focus Expectations

| Interaction | Expected Focus Target |
|-------------|----------------------|
| Modal opens | First focusable element in modal |
| Modal closes | Element that triggered the modal |
| Form submit (success) | Success message or next page first heading |
| Form submit (error) | First invalid field or error summary |
| Tab/accordion toggle | Content area of opened panel |
| Delete action | Next item in list, or empty state message |
| Page navigation | Main content heading (`h1`) |

### Example: Focus Check Helpers (Pure Assertions)

```typescript
// checks/a11y-checks.ts
export async function verifyFocusOnElement(
  page: Page,
  role: AriaRole,
  options?: { name?: string | RegExp }
): Promise<void> {
  const element = page.getByRole(role, options);
  await expect(element).toBeFocused();
}

export async function verifyFocusInsideContainer(
  page: Page,
  container: Locator
): Promise<void> {
  await expect(container.locator(':focus')).toHaveCount(1);
}

export async function verifyFocusReturnedTo(
  page: Page,
  element: Locator
): Promise<void> {
  await expect(element).toBeFocused();
}
```

### Example: Focus Management Actions (Interactions)

```typescript
// actions/keyboard-actions.ts
export async function tabThroughElements(page: Page, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Tab');
  }
}

export async function shiftTabThroughElements(page: Page, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Shift+Tab');
  }
}

export async function closeModalViaEscape(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
}
```

### Example: Focus Trap Scenario (Composing Actions + Checks)

```typescript
// scenarios/focus-trap/focus-trap.e2e.spec.ts
export async function focusTrapScenario(
  page: Page,
  container: Locator,
  focusableCount: number
): Promise<void> {
  // When: tab forward through all focusable elements
  for (let i = 0; i < focusableCount; i++) {
    await keyboardActions.tabThroughElements(page, 1);
    // Then: focus remains inside container
    await a11yChecks.verifyFocusInsideContainer(page, container);
  }

  // When: tab one more time (should cycle forward)
  await keyboardActions.tabThroughElements(page, 1);
  // Then: focus wraps back inside container
  await a11yChecks.verifyFocusInsideContainer(page, container);

  // When: shift+tab backward through all focusable elements
  for (let i = 0; i < focusableCount; i++) {
    await keyboardActions.shiftTabThroughElements(page, 1);
    // Then: focus remains inside container
    await a11yChecks.verifyFocusInsideContainer(page, container);
  }

  // When: shift+tab one more time (should cycle backward)
  await keyboardActions.shiftTabThroughElements(page, 1);
  // Then: focus wraps back inside container
  await a11yChecks.verifyFocusInsideContainer(page, container);
}

export async function modalFocusBehaviorScenario(
  page: Page,
  triggerName: string | RegExp,
  modalRole: AriaRole
): Promise<void> {
  const trigger = page.getByRole('button', { name: triggerName });
  const modal = page.getByRole(modalRole);

  // When: activate trigger via keyboard
  await trigger.focus();
  await page.keyboard.press('Enter');
  // Then: focus moves inside modal
  await a11yChecks.verifyFocusInsideContainer(page, modal);

  // When: close modal
  await keyboardActions.closeModalViaEscape(page);
  // Then: focus returns to trigger
  await a11yChecks.verifyFocusReturnedTo(page, trigger);
}
```

## Integrating Accessibility into Existing Scenarios

For each existing scenario, create a parallel accessibility file in the same directory:

```
scenarios/add-to-cart/
├── add-to-cart.e2e.spec.ts          ← functional test
├── add-to-cart-keyboard.e2e.spec.ts ← keyboard variant
└── add-to-cart-a11y.e2e.spec.ts     ← axe + focus checks
```

The accessibility scenario reuses the same flow but adds axe scans at key states and verifies focus management:

```typescript
// scenarios/add-to-cart/add-to-cart-a11y.e2e.spec.ts
test.describe('Add to Cart - Accessibility @happy-path @a11y', () => {
  test('meets WCAG 2.1 AA throughout flow', async ({ page }) => {
    // Given
    await actions.navigateToCatalog(page);
    await a11yChecks.verifyNoAxeViolations(page);

    // When
    await actions.searchProducts(page, { query: 'laptop' });
    await a11yChecks.verifyNoAxeViolations(page);

    // Then
    await actions.selectProduct(page, 0);
    await a11yChecks.verifyFocusOnElement(page, 'heading', { name: /laptop/i });
  });
});
```

## Tag Convention for Accessibility Tests

All accessibility tests must include `@a11y` in the title.

This enables filtering:
```bash
npx playwright test --grep "@a11y" # all accessibility tests
```
