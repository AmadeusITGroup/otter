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

## Post-Scaffolding Validation Checklist

After running a schematic, verify:

- [ ] Schematic ran without errors
