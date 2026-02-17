"""MCP client helpers for eval tests."""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from mcp import ClientSession, types


async def call_mcp_tool(
    session: ClientSession,
    tool_name: str,
    args: dict[str, Any] | None = None,
    timeout: float = 30.0,
) -> str:
    """Call an MCP tool and return concatenated text content.

    Handles TextContent directly, and includes placeholders for
    non-text content types (images, embedded resources, resource links).
    Raises RuntimeError if the MCP server reports an error.
    Raises TimeoutError if the tool does not respond within *timeout* seconds.
    """
    logger = logging.getLogger(__name__)

    result = await asyncio.wait_for(
        session.call_tool(tool_name, arguments=args or {}),
        timeout=timeout,
    )
    if result.isError:
        raise RuntimeError(
            f"MCP tool '{tool_name}' returned an error: "
            + "\n".join(
                c.text for c in result.content
                if isinstance(c, types.TextContent)
            )
        )
    texts = []
    for content in result.content:
        if isinstance(content, types.TextContent):
            texts.append(content.text)
        elif isinstance(content, types.ImageContent):
            texts.append(f"[image: {content.mimeType}]")
        elif isinstance(content, types.EmbeddedResource):
            if isinstance(content.resource, types.TextResourceContents):
                texts.append(content.resource.text)
            else:
                texts.append(f"[embedded resource: {content.resource.uri}]")
        elif isinstance(content, types.ResourceLink):
            texts.append(f"[resource link: {content.uri}]")
        else:
            logger.warning("Unhandled MCP content type: %s", type(content).__name__)
    return "\n".join(texts)


def mcp_tools_to_openai_functions(tools: list[types.Tool]) -> list[dict[str, Any]]:
    """Convert MCP tool schemas to OpenAI function-calling tool definitions."""
    openai_tools: list[dict[str, Any]] = []
    for tool in tools:
        parameters = {"type": "object", "properties": {}, "required": []}
        if tool.inputSchema and isinstance(tool.inputSchema, dict):
            parameters = tool.inputSchema
        openai_tools.append({
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description or "",
                "parameters": parameters,
            },
        })
    return openai_tools
