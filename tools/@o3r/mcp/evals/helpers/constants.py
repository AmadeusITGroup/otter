"""Shared constants and paths for MCP eval tests."""

from __future__ import annotations

import os
from pathlib import Path

# Paths
EVALS_DIR = Path(__file__).resolve().parent.parent
MCP_PACKAGE_DIR = EVALS_DIR.parent
SERVER_ENTRY = MCP_PACKAGE_DIR / "dist" / "src" / "cli" / "index.js"
MONOREPO_ROOT = MCP_PACKAGE_DIR.parent.parent.parent  # tools/@o3r/mcp -> root
DATASETS_DIR = EVALS_DIR / "datasets"

# GitHub token availability (used to gate GitHub-dependent scenarios)
HAS_GITHUB_TOKEN = bool(os.environ.get("O3R_MCP_GITHUB_TOKEN"))

# Nx workspace detection — angular_schematics tool is skipped in Nx workspaces
IS_NX_WORKSPACE = (MONOREPO_ROOT / "nx.json").exists()

AGENT_SYSTEM_PROMPT = """\
You are an AI coding assistant integrated into the user's IDE.
The user is working on an Angular project that uses the Otter framework \
(@o3r packages) with TypeScript.

You have access to MCP tools provided by the Otter framework. Use them \
when the user's question is relevant to Otter — for example, asking about \
best practices, creating a project, migrating versions, generating \
components, or querying release information.

Do NOT use tools when the question is unrelated to the Otter framework \
(e.g. generic programming questions, general Angular questions that are \
not Otter-specific, or non-coding topics).
"""

# Minimal system prompt — no Otter-specific guidance.
# Used to test whether MCP tool descriptions alone are descriptive enough
# for the LLM to select the right tool without extra context.
GENERIC_SYSTEM_PROMPT = """\
You are an AI coding assistant integrated into the user's IDE.
You have access to tools. Use them when relevant to answer the user's question.
"""
