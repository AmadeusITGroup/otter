---
trigger: always_on
---

# Otter Framework - Documentation Requirements

## Code Documentation

- **Always write description comments** for exported constants, variables, functions, public classes, methods and properties
- **Use JSDoc format**: `/** Your comment */`
- **Document parameters and return types** for complex functions
- **Add `@deprecated` tag** when deprecating code, mentioning the major version for removal

## Example

```typescript
/**
 * Calculates the total price including tax.
 * @param basePrice The base price before tax
 * @param taxRate The tax rate as a decimal (e.g., 0.2 for 20%)
 * @deprecated Will be removed in v15. Use `calculatePriceWithTax()` instead.
 */
public calculateTotal(basePrice: number, taxRate: number): number {
  return basePrice * (1 + taxRate);
}
```