# Coding Standards Reference

Complete code examples and patterns for the Actions / Checks / Scenarios architecture.

## Action Helpers

Action helpers encapsulate user interactions. They live in `actions/<journey>-actions.ts`.

### Rules

- `Page` as first argument (consistent signature across all helpers)
- Wait for resulting UI state after each interaction (not hardcoded timeouts)
- Return `void`
- Name describes user intent (`addItemToCart` not `clickButton`)
- No assertions — never use `expect()` in actions (that belongs in checks)
- No side effects beyond UI interaction

### Example: Product Catalog Actions

```typescript
// actions/catalog-actions.ts
export async function navigateToCatalog(page: Page): Promise<void> {
  await page.goto('/products');
  await page.waitForLoadState('networkidle');
}

export async function searchProducts(
  page: Page,
  params: { query: string; category?: string }
): Promise<void> {
  await page.getByLabel('Search').fill(params.query);
  if (params.category) {
    await page.getByRole('combobox', { name: /category/i }).selectOption(params.category);
  }
  await page.getByRole('button', { name: /search/i }).click();
  await page.waitForLoadState('networkidle');
}

export async function selectProduct(page: Page, index: number): Promise<void> {
  await page.getByRole('listitem').nth(index).getByRole('link').click();
  await page.waitForLoadState('networkidle');
}

export async function addToCart(page: Page): Promise<void> {
  await page.getByRole('button', { name: /add to cart/i }).click();
  await page.waitForLoadState('networkidle');
}

export async function fillShippingDetails(
  page: Page,
  details: { firstName: string; lastName: string; email: string }
): Promise<void> {
  await page.getByLabel('First name').fill(details.firstName);
  await page.getByLabel('Last name').fill(details.lastName);
  await page.getByLabel('Email').fill(details.email);
}
```

## Check Helpers

Check helpers encapsulate assertions. They live in `checks/<journey>-checks.ts`.

### Rules

- `Page` as first argument
- `expect()` assertions only — no interactions
- Name describes expected state (`verifyItemInCart` not `checkListItem`)
- Composable — multiple checks can be combined in different scenarios
- No waiting for state transitions (that belongs in actions)

### Example: Product Catalog Checks

```typescript
// checks/catalog-checks.ts
export async function verifySearchResultsDisplayed(
  page: Page,
  expectedCount?: number
): Promise<void> {
  const results = page.getByRole('listitem');
  await expect(results.first()).toBeVisible();
  if (expectedCount !== undefined) {
    await expect(results).toHaveCount(expectedCount);
  }
}

export async function verifyProductDetailPage(
  page: Page,
  productName: string
): Promise<void> {
  await expect(page.getByRole('heading', { name: productName })).toBeVisible();
  await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
}

export async function verifyItemInCart(
  page: Page,
  itemName: string
): Promise<void> {
  await expect(page.getByRole('region', { name: /cart/i })).toContainText(itemName);
}

export async function verifyOrderConfirmation(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /order confirmed/i })).toBeVisible();
  await expect(page.getByText(/order number/i)).toBeVisible();
}

export async function verifyErrorMessage(
  page: Page,
  message: string | RegExp
): Promise<void> {
  await expect(page.getByRole('alert')).toContainText(message);
}
```

## Scenario Composition (Given-When-Then)

Scenarios wire actions and checks into readable journeys. They live in `scenarios/<feature>/`.

### Rules

- No raw Playwright calls — only action/check helpers
- Comments mark Given/When/Then boundaries
- One journey per scenario file

### Example: Generic Scenario

```typescript
// scenarios/add-to-cart/add-to-cart.e2e.spec.ts
export async function addToCartScenario(page: Page): Promise<void> {
  // Given
  await actions.navigateToCatalog(page);
  await actions.searchProducts(page, { query: 'laptop' });
  await actions.selectProduct(page, 0);

  // When
  await actions.addToCart(page);

  // Then
  await checks.verifyItemInCart(page, 'Laptop');
}
```

## Selector Strategy — Extended Examples

### Role-based (preferred)

```typescript
page.getByRole('button', { name: /submit/i });
page.getByRole('link', { name: 'Home' });
page.getByRole('heading', { level: 1 });
page.getByRole('combobox', { name: /country/i });
page.getByRole('tab', { name: /details/i });
page.getByRole('dialog');
```

### Label-based (form fields)

```typescript
page.getByLabel('Email address');
page.getByLabel('Password');
page.getByPlaceholder('Search...');
```

### Test ID (when no accessible role)

```typescript
page.getByTestId('product-card-0');
page.getByTestId('price-breakdown');
```

### Text (visible content)

```typescript
page.getByText('No results found');
page.getByText(/total: \$\d+/i);
```

## Wait Strategy Patterns

```typescript
// After navigation
await page.goto('/products');
await page.waitForLoadState('networkidle');

// After click that triggers navigation
await page.getByRole('link', { name: 'Details' }).click();
await page.waitForURL('**/details/**');

// After interaction that reveals content
await page.getByRole('button', { name: /expand/i }).click();
await expect(page.getByRole('region', { name: /details/i })).toBeVisible();

// After form submit
await page.getByRole('button', { name: /submit/i }).click();
await expect(page.getByText(/success/i)).toBeVisible();

// Waiting for API response
const responsePromise = page.waitForResponse('**/api/orders');
await page.getByRole('button', { name: /place order/i }).click();
await responsePromise;
```
