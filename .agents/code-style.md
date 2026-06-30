# Code Style Guidelines

## General Formatting

All formatting rules (charset, indentation, line endings, etc.) are defined in `.editorconfig` at the repository root.

## TypeScript/JavaScript Conventions

### Documentation

- **Always write JSDoc comments** for exported constants, variables, functions, public classes, methods and properties
- Use `/** ... */` pattern
- Document parameters and return types for complex functions
- Add `@deprecated` tag when deprecating code, mentioning the major version for removal

**Example:**

```typescript
/**
 * Calculates the total price including tax.
 * @param basePrice The base price before tax
 * @param taxRate The tax rate as a decimal (e.g., 0.2 for 20%)
 * @returns The total price with tax applied
 * @deprecated Will be removed in v15. Use `calculatePriceWithTax()` instead.
 */
public calculateTotal(basePrice: number, taxRate: number): number {
  return basePrice * (1 + taxRate);
}
```

### Type Safety

**Properties must have the most restricted type possible:**

```typescript
// ❌ Bad
private type: string;

// ✅ Good
private type: 'A' | 'B';
```

### Best Practices

- **Use `const` by default**, `let` only when reassignment is needed, never `var`
- **Imports must be at the top of the file** - never in the middle of code
- **One class/interface per file** when possible
- **Keep files focused** - split large files into smaller, focused modules
- **Follow existing ESLint rules** defined in `packages/@o3r/eslint-config`

## Experimental APIs

APIs marked with `@experimental` JSDoc tag are unstable and may change without warning. When using experimental APIs, pin package versions explicitly.
