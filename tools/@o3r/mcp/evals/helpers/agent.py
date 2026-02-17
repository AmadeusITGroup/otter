"""Agent loop — mimics GitHub Copilot Agent Mode for eval tests."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

from mcp import ClientSession, types

from .constants import AGENT_SYSTEM_PROMPT
from .mcp import call_mcp_tool, mcp_tools_to_openai_functions

if TYPE_CHECKING:
    from openai import AsyncAzureOpenAI


@dataclass
class AgentResult:
    """Result of an agent loop run."""
    final_response: str
    tools_called: list[dict[str, Any]] = field(default_factory=list)
    messages: list[dict] = field(default_factory=list)


async def run_agent_loop(
    client: AsyncAzureOpenAI,
    model: str,
    session: ClientSession,
    tools: list[types.Tool],
    user_prompt: str,
    max_turns: int = 10,
    prior_messages: list[dict[str, Any]] | None = None,
    system_prompt: str | None = None,
) -> AgentResult:
    """Run an agent loop mimicking GitHub Copilot Agent Mode.

    Sends the user prompt to the LLM with MCP tools available.
    When the LLM decides to call a tool, it is executed via the MCP session
    and the result is fed back. This loops until the LLM produces a final
    text response or max_turns is reached.

    Args:
        client: Azure OpenAI client instance.
        model: Azure deployment name.
        session: MCP ClientSession connected to the server.
        tools: List of MCP tool schemas.
        user_prompt: The user's question or request.
        max_turns: Maximum number of LLM round-trips.
        prior_messages: Optional list of prior conversation messages for
            multi-turn testing. The system prompt and new user prompt are
            appended automatically.
        system_prompt: Override the default system prompt. Useful for
            testing tool description quality without Otter-specific context.

    Returns:
        AgentResult with final_response, tools_called, and full messages.
    """
    openai_tools = mcp_tools_to_openai_functions(tools)
    prompt = system_prompt if system_prompt is not None else AGENT_SYSTEM_PROMPT
    if prior_messages:
        messages = list(prior_messages) + [
            {"role": "user", "content": user_prompt},
        ]
    else:
        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_prompt},
        ]
    tools_called = []

    for _ in range(max_turns):
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            tools=openai_tools,
            temperature=0,
        )

        choice = response.choices[0]
        message = choice.message

        # Append the assistant message to conversation history
        messages.append(message.model_dump(exclude_none=True))

        # If no tool calls, the LLM gave a final answer
        if not message.tool_calls:
            return AgentResult(
                final_response=message.content or "",
                tools_called=tools_called,
                messages=messages,
            )

        # Execute each tool call via MCP and feed results back
        for tool_call in message.tool_calls:
            try:
                args = json.loads(tool_call.function.arguments)
            except json.JSONDecodeError as e:
                raise ValueError(
                    f"LLM returned malformed JSON for tool '{tool_call.function.name}': "
                    f"{tool_call.function.arguments!r}"
                ) from e
            tool_output = await call_mcp_tool(
                session, tool_call.function.name, args
            )
            tools_called.append({
                "name": tool_call.function.name,
                "args": args,
            })
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": tool_output,
            })

    # Max turns reached — return what we have
    last_content = ""
    for msg in reversed(messages):
        if isinstance(msg, dict) and msg.get("role") == "assistant" and msg.get("content"):
            last_content = msg["content"]
            break
    return AgentResult(
        final_response=last_content,
        tools_called=tools_called,
        messages=messages,
    )


async def get_cached_agent_result(
    cache: dict[str, AgentResult],
    agent_loop_fn,
    scenario: dict[str, Any],
    **kwargs,
) -> AgentResult:
    """Return cached AgentResult, running the agent loop only on first call.

    Args:
        cache: The session-scoped cache dict (from agent_result_cache fixture).
        agent_loop_fn: The callable from the agent_loop fixture.
        scenario: Scenario dict with at least 'id' and 'user_prompt' keys.
        **kwargs: Additional keyword arguments forwarded to agent_loop_fn
                  (e.g. system_prompt). When kwargs are present, a separate
                  cache key is used to avoid collisions.

    Returns:
        Cached or freshly-computed AgentResult.
    """
    cache_key = scenario["id"]
    if kwargs:
        suffix = "|".join(f"{k}={v}" for k, v in sorted(kwargs.items()))
        cache_key = f"{cache_key}|{suffix}"

    if cache_key not in cache:
        cache[cache_key] = await agent_loop_fn(
            scenario["user_prompt"], **kwargs
        )
    return cache[cache_key]
