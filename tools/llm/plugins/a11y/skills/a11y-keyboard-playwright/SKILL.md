---
name: a11y-keyboard-playwright
description: "Write keyboard-only test variants and focus management checks using Playwright: navigation patterns, focus expectations, helpers, and file structure conventions."
---

# Skill: Keyboard and Focus Tests with Playwright

## Keyboard-Only Variants

Replicate each E2E scenario using only keyboard navigation. Tag with `@a11y`.

### Keyboard Navigation Patterns

| Action | Keys | Notes |
|---|---|---|
| Move to next interactive element | `Tab` | Forward navigation |
| Move to previous element | `Shift+Tab` | Backward navigation |
| Activate button/link | `Enter` | Triggers click |
| Toggle checkbox/radio | `Space` | Toggles state |
| Open dropdown | `Enter` or `Space` | Context-dependent |
| Navigate dropdown options | `Arrow Down` / `Arrow Up` | Within open dropdown |
| Select dropdown option | `Enter` | Confirms selection |
| Close modal/dialog | `Escape` | Should return focus |
| Navigate tabs | `Arrow Left` / `Arrow Right` | Within tablist |

### Example

```typescript
// scenarios/add-to-cart/add-to-cart-keyboard.e2e.spec.ts
test.describe('Add to Cart - Keyboard @happy-path @a11y', () => {
  test('complete flow via keyboard only', async ({ page }) => {
    await actions.navigateToCatalog(page);
    await keyboardActions.focusSearchAndType(page, 'laptop');
    await keyboardActions.submitWithEnter(page);
    await keyboardActions.tabToAndActivate(page); // first result
    await keyboardActions.tabToAndActivate(page); // add-to-cart button
    await checks.verifyItemInCart(page, 'Laptop');
  });
});
```

### Keyboard Actions Helpers

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

---

## Focus Management Checks

Verify that focus moves predictably after interactions.

### Common Focus Expectations

| Interaction | Expected Focus Target |
|---|---|
| Modal opens | First focusable element in modal |
| Modal closes | Element that triggered the modal |
| Form submit (success) | Success message or next page first heading |
| Form submit (error) | First invalid field or error summary |
| Tab/accordion toggle | Content area of opened panel |
| Delete action | Next item in list, or empty state message |
| Page navigation | Main content heading (`h1`) |

### Focus Check Helpers

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

### Focus Trap Scenario

```typescript
// scenarios/focus-trap/focus-trap.e2e.spec.ts
export async function focusTrapScenario(
  page: Page,
  container: Locator,
  focusableCount: number
): Promise<void> {
  for (let i = 0; i < focusableCount; i++) {
    await keyboardActions.tabThroughElements(page, 1);
    await a11yChecks.verifyFocusInsideContainer(page, container);
  }
  await keyboardActions.tabThroughElements(page, 1);
  await a11yChecks.verifyFocusInsideContainer(page, container); // wraps forward

  for (let i = 0; i < focusableCount; i++) {
    await keyboardActions.shiftTabThroughElements(page, 1);
    await a11yChecks.verifyFocusInsideContainer(page, container);
  }
  await keyboardActions.shiftTabThroughElements(page, 1);
  await a11yChecks.verifyFocusInsideContainer(page, container); // wraps backward
}

export async function modalFocusBehaviorScenario(
  page: Page,
  triggerName: string | RegExp,
  modalRole: AriaRole
): Promise<void> {
  const trigger = page.getByRole('button', { name: triggerName });
  const modal = page.getByRole(modalRole);

  await trigger.focus();
  await page.keyboard.press('Enter');
  await a11yChecks.verifyFocusInsideContainer(page, modal);

  await keyboardActions.closeModalViaEscape(page);
  await a11yChecks.verifyFocusReturnedTo(page, trigger);
}
```

---

## File Structure Convention

For each E2E scenario, create parallel accessibility files in the same directory:

```
scenarios/add-to-cart/
├── add-to-cart.e2e.spec.ts          ← functional test
├── add-to-cart-keyboard.e2e.spec.ts ← keyboard variant
└── add-to-cart-a11y.e2e.spec.ts     ← focus checks
```

The accessibility scenario reuses the same flow and verifies focus management:

```typescript
// scenarios/add-to-cart/add-to-cart-a11y.e2e.spec.ts
test.describe('Add to Cart - Accessibility @happy-path @a11y', () => {
  test('focus moves correctly throughout flow', async ({ page }) => {
    await actions.navigateToCatalog(page);

    await actions.searchProducts(page, { query: 'laptop' });

    await actions.selectProduct(page, 0);
    await a11yChecks.verifyFocusOnElement(page, 'heading', { name: /laptop/i });
  });
});
```

## Tag Convention

All accessibility tests must include `@a11y` in the title. This enables filtering:

```bash
npx playwright test --grep "@a11y"
```
