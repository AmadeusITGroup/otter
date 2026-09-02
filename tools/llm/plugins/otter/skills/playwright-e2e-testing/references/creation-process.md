# Scenario Creation Process — Detailed Reference

Complete reference for the 3-gate creation workflow, including deduplication scoring examples and decision trees.

## Gate 1: Confirm Inputs — Detailed

Present the following to the user for explicit approval:

| Field | Value | Notes |
|-------|-------|-------|
| Feature | `<feature-name>` | Specific feature being tested |
| Scenario name | `<descriptive-name>` | Used for file/directory naming |

### Naming Conventions

- Feature: kebab-case, describes what is being tested (`add-to-cart`, `login-form`, `payment-validation`)
- Scenario: kebab-case, describes the specific test case (`add-to-cart`, `error-invalid-email`)

Do NOT proceed without explicit user confirmation.

## Gate 2: Deduplication Check — Detailed

### Step-by-step Process

1. **Search for existing scenarios** that cover the same feature — search all files under `scenarios/` and `actions/` for the primary action/feature keywords.

2. **For each matching scenario**, list the steps it performs:
   - Read the scenario file
   - Extract the sequence of action + check calls
   - Compare with the planned new scenario steps

3. **Compute overlap score**:

```
overlap = shared_steps / max(existing_steps, new_steps) * 100
```

Where:
- `shared_steps` = number of action/check calls that appear in both scenarios
- `existing_steps` = total action/check calls in the existing scenario
- `new_steps` = total action/check calls in the planned new scenario

### Scoring Examples

**Example 1: High overlap (>=70%) — Extend existing**

Existing scenario `add-to-cart.e2e.spec.ts`:
```
1. actions.navigateToCatalog
2. actions.searchProducts
3. actions.selectProduct
4. actions.addToCart
5. checks.verifyItemInCart
```

Proposed new scenario `add-to-cart-with-quantity.e2e.spec.ts`:
```
1. actions.navigateToCatalog
2. actions.searchProducts
3. actions.selectProduct
4. actions.setQuantity
5. actions.addToCart
6. checks.verifyItemInCart
```

Score: 5 shared / max(5, 6) = 5/6 = **83%** → Extend existing scenario with quantity step.

**Example 2: Medium overlap (40-70%) — Extract shared steps**

Existing scenario `checkout-happy-path.e2e.spec.ts`:
```
1. actions.navigateToCatalog
2. actions.searchProducts
3. actions.selectProduct
4. actions.addToCart
5. actions.proceedToCheckout
6. checks.verifyOrderConfirmation
```

Proposed new scenario `checkout-cancel-flow.e2e.spec.ts`:
```
1. actions.navigateToCatalog
2. actions.searchProducts
3. actions.selectProduct
4. actions.addToCart
5. actions.cancelOrder
6. checks.verifyCancellationConfirmed
```

Score: 4 shared / max(6, 6) = 4/6 = **67%** → Extract shared browse+add steps into a helper, create new scenario.

**Example 3: Low overlap (<40%) — Create new**

Existing scenario `login-happy-path.e2e.spec.ts`:
```
1. actions.navigateToLogin
2. actions.fillCredentials
3. actions.submitLogin
4. checks.verifyDashboard
```

Proposed new scenario `product-filter.e2e.spec.ts`:
```
1. actions.navigateToCatalog
2. actions.applyFilter('in-stock')
3. actions.applyFilter('price-low-high')
4. actions.searchProducts
5. checks.verifyFilteredResults
6. checks.verifyResultOrder
```

Score: 0 shared / max(4, 6) = 0/6 = **0%** → Create new scenario.

### Decision Presentation

Present findings to the user in this format:

```
Deduplication Check Results:

Found 2 existing scenarios with potential overlap:

1. add-to-cart.e2e.spec.ts — 83% overlap
   Shared steps: navigateToCatalog, searchProducts, selectProduct, addToCart,
                 verifyItemInCart
   Recommendation: EXTEND existing scenario with new steps

2. checkout-complete.e2e.spec.ts — 33% overlap
   Shared steps: navigateToCatalog, searchProducts
   Recommendation: No conflict, safe to create new

Overall recommendation: Extend add-to-cart.e2e.spec.ts rather than creating a new file.
Proceed? [user must confirm]
```

## Gate 3: Flow Approval — Detailed

Present the planned sequence of actions and checks to the user as a step-by-step flow (Given/When/Then):

```
Resolved Action Mapping for: <scenario-name>

Feature: <feature>

Steps:
  Given:
    1. actions.navigateToCatalog(page)
    2. actions.searchProducts(page, { query: 'laptop' })
    3. actions.selectProduct(page, 0)

  When:
    4. actions.addToCart(page)

  Then:
    5. checks.verifyItemInCart(page, 'Laptop')

New helpers needed:
  - None (all actions/checks already exist)

  OR

  - NEW ACTION: actions.applyFilter(page, filterName) — in actions/catalog-actions.ts
  - NEW CHECK: checks.verifyFilteredResults(page, expectedCount) — in checks/catalog-checks.ts

Files to create:
  - scenarios/add-to-cart/add-to-cart.e2e.spec.ts

Confirm this mapping matches expectations? [user must confirm]
```

The user confirms it matches the expected behavior. Only after all 3 gates pass, generate files.

## Post-Gate File Generation

After all 3 gates pass, generate files in this order:

1. **New action helpers** (if any) — add to existing action file or create new
2. **New check helpers** (if any) — add to existing check file or create new
3. **Scenario file** — wiring actions + checks into Given/When/Then

### File generation checklist

- [ ] Action helpers have no assertions
- [ ] Check helpers have no interactions
- [ ] Scenario uses only action/check helpers (no raw Playwright calls)
- [ ] Given/When/Then comments present
- [ ] Tags in test title (e.g., `@happy-path`, `@visual`, `@edge-case`, `@regression`)
- [ ] File names follow kebab-case convention
- [ ] Proper import paths (relative, no aliases unless configured)

## Extending Existing Scenarios (>=70% overlap)

When extending rather than creating new:

1. **Add new checks** to the existing scenario's "Then" block
2. **Add new test cases** within the same `test.describe` block if testing variants
3. **Create new action/check helpers** if the extension requires new interactions or assertions
4. **Update tags** if the extension broadens scope (e.g., adding `@a11y` coverage)

Do NOT:
- Duplicate the existing scenario's setup in a new file
- Create a "v2" of an existing scenario
- Modify the existing scenario's happy path without user approval
