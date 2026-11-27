# Accessibility Testing Reference

Accessibility test patterns (axe scans, keyboard-only variants, focus management) have moved to the **a11y-axe-playwright** skill in the **Accessibility collection**.

## Getting the Accessibility Collection

**Claude Code (CLI or VS Code extension)**
```
/plugin marketplace add AmadeusITGroup/otter
/plugin install accessibility
```

**VS Code (GitHub Copilot)**

Add to your user `settings.json`:
```json
"chat.plugins.marketplaces": {
  "AmadeusITGroup/otter": true
}
```
Then run **Chat: Install Plugin From Source** from the Command Palette and select the **Accessibility** collection.

**AI Primitives Hub**

Search for **Accessibility** in the Hub and add the collection to your workspace. The `a11y-axe-playwright` skill will become available immediately.
