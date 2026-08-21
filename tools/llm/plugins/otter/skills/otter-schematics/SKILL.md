---
name: otter-schematics
description: This skill should be used when the user asks to "create a component", "generate a library", "scaffold a service", "add a fixture", or when creating any Angular artifact in an Otter workspace. Ensures schematics are used over manual file creation.
---

# Otter Schematics

Otter (`@o3r/`) is an Angular framework extension. When creating or modifying components, libraries, or services, Otter schematics **must** be used instead of manually creating file structures. This ensures consistent code generation and prevents ad-hoc layouts that drift from conventions.

## When to Use

- Creating any new Angular artifact (component, library, service, fixture)
- Scaffolding structure for a new feature

## Core Rule: Schematics Over Manual File Creation

If a schematic exists for the artifact type, use it. Manual file creation is only acceptable when no schematic covers the case.

Use the `@o3r/mcp` MCP server to discover available schematics for the project and their options. If the MCP server is not available, invoke the `otter-mcp-setup` skill to guide installation, then re-run this skill.

Preview before committing to a run: `ng g <schematic> --dry-run` lists the files that would be created or modified, and `--help` lists the current options.

## When a Schematic Cannot Be Run

A schematic may fail or be unavailable — a version mismatch, a workspace the generator does not recognise, a broken install. **Do not hand-write the files from memory, and do not invent a layout.** Read what the schematic would have done and reproduce it:

1. Locate the schematic in the installed package. Its `collection.json` maps each schematic name to a factory; the factory's directory holds the rules and the templates.
2. Read the factory and its templates. They are the source of truth for file names, folder layout, decorators, imports, and any file the generator also modifies (barrels, module registration, styling entry points).
3. Apply the same changes by hand, keeping exactly the naming and structure the templates dictate.
4. Report that the schematic failed, why, and what was reproduced manually, so a reviewer knows the layout was derived rather than generated.

This is the same approach the `otter-migration` agent uses for migration schematics: read the bundled code, then apply the equivalent changes.

## Post-Scaffolding Validation Checklist

After running a schematic, verify:

- [ ] Schematic ran without errors — or, if it could not be run, its templates were read and reproduced by hand
