"""Shared fixtures for MCP server deepeval tests.

Provides:
- MCP server subprocess management (start/stop via stdio transport)
- MCP client connection helper
- Tool call wrapper for test cases
- Configurable LLM judge model
"""

from __future__ import annotations

import asyncio
import os
from pathlib import Path
from typing import Any

import pytest
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Path to the built MCP server entry point
MCP_SERVER_DIR = Path(__file__).resolve().parent.parent
MCP_SERVER_ENTRY = MCP_SERVER_DIR / "dist" / "src" / "cli" / "index.js"
# Workspace root (needed for Yarn PnP module resolution)
# MCP_SERVER_DIR = tools/@o3r/mcp → .parent = tools/@o3r → .parent = tools → .parent = <workspace root>
WORKSPACE_ROOT = MCP_SERVER_DIR.parent.parent.parent


def get_deepeval_model():
    """Return the deepeval model string based on environment configuration.

    Supports:
    - DEEPEVAL_MODEL env var (e.g., "gpt-4o", "claude-3-5-sonnet", "ollama/llama3")
    - Defaults to "gpt-4o" if not set
    """
    return os.environ.get("DEEPEVAL_MODEL", "gpt-4o")


def run_async(coro, timeout: int = 60):
    """Run an async coroutine synchronously with a timeout.

    Args:
        coro: The coroutine to run.
        timeout: Maximum seconds to wait before raising asyncio.TimeoutError.
    """
    return asyncio.run(asyncio.wait_for(coro, timeout=timeout))


def get_server_env() -> dict[str, str]:
    """Build environment variables for the MCP server subprocess.

    Copies the full parent environment because ``yarn node`` with Yarn PnP
    needs various system and Yarn-specific variables to resolve modules.
    """
    env = os.environ.copy()
    env.setdefault("O3R_MCP_LOG_LEVEL", "error")
    return env


@pytest.fixture(scope="session")
def mcp_server_params() -> StdioServerParameters:
    """Provide MCP server connection parameters for stdio transport.

    Uses `yarn node` to launch the server with Yarn PnP module resolution,
    and sets cwd to the workspace root so workspace dependencies resolve.
    """
    if not MCP_SERVER_ENTRY.exists():
        pytest.skip(
            f"MCP server not built. Run 'yarn nx build mcp' first. "
            f"Expected: {MCP_SERVER_ENTRY}"
        )
    return StdioServerParameters(
        command="yarn",
        args=["node", str(MCP_SERVER_ENTRY)],
        env=get_server_env(),
        cwd=str(WORKSPACE_ROOT),
    )


class McpTestClient:
    """Wrapper around MCP ClientSession for use in deepeval test cases.

    Usage:
        async with McpTestClient(server_params) as client:
            result = await client.call_tool("get_best_practices", {})
    """

    def __init__(self, server_params: StdioServerParameters):
        self.server_params = server_params
        self._session: ClientSession | None = None
        self._cm = None
        self._session_cm = None

    async def __aenter__(self) -> "McpTestClient":
        self._cm = stdio_client(self.server_params)
        read_stream, write_stream = await self._cm.__aenter__()
        self._session_cm = ClientSession(read_stream, write_stream)
        self._session = await self._session_cm.__aenter__()
        await self._session.initialize()
        return self

    async def __aexit__(self, *args):
        if self._session_cm:
            await self._session_cm.__aexit__(*args)
        if self._cm:
            await self._cm.__aexit__(*args)

    async def call_tool(self, name: str, arguments: dict[str, Any] | None = None) -> dict[str, Any]:
        """Call an MCP tool and return the result as a dict.

        Args:
            name: Tool name (e.g., "get_best_practices")
            arguments: Tool arguments dict

        Returns:
            Dict with 'content' key containing the tool response
        """
        result = await self._session.call_tool(name, arguments or {})
        return {
            "content": [
                {"type": c.type, "text": getattr(c, "text", None), "uri": getattr(c, "uri", None)}
                for c in result.content
            ],
            "isError": result.isError if hasattr(result, "isError") else False,
        }

    async def list_tools(self) -> list[dict[str, Any]]:
        """List all available MCP tools."""
        result = await self._session.list_tools()
        return [
            {
                "name": t.name,
                "description": t.description,
                "inputSchema": t.inputSchema if hasattr(t, "inputSchema") else None,
            }
            for t in result.tools
        ]

    async def list_resources(self) -> list[dict[str, Any]]:
        """List all available MCP resources."""
        result = await self._session.list_resources()
        return [
            {"uri": str(r.uri), "name": r.name}
            for r in result.resources
        ]

    async def get_tool_text_output(self, name: str, arguments: dict[str, Any] | None = None) -> str:
        """Call an MCP tool and return concatenated text content.

        Convenience method for tests that only need the text output.
        """
        result = await self.call_tool(name, arguments)
        return "\n".join(
            c["text"] for c in result["content"] if c.get("text")
        )


@pytest.fixture(scope="session")
def deepeval_model() -> str:
    """Provide the configured deepeval model string."""
    return get_deepeval_model()
