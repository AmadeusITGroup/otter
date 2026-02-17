"""Pytest fixtures for MCP server deepeval testing.

Provides:
- MCP server subprocess management (session-scoped for efficiency)
- MCP client connection helper
- Agent loop mimicking GitHub Copilot Agent Mode (LLM + MCP tool execution)
- Configurable agent model via EVAL_AGENT_MODEL env var

Non-fixture logic lives in the ``helpers`` sub-package:
- helpers/constants.py — paths, prompts, environment flags
- helpers/datasets.py  — dataset loading and scenario filtering
- helpers/azure.py     — Azure OpenAI credential helpers
- helpers/mcp.py       — MCP tool calling and schema conversion
- helpers/agent.py     — AgentResult dataclass, agent loop, and result cache
"""

from __future__ import annotations

import os
from contextlib import AsyncExitStack
from typing import Any

import pytest
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from helpers import (
    MONOREPO_ROOT,
    SERVER_ENTRY,
    TOOL_SELECTION_SCENARIOS,
    AgentResult,
    azure_token_provider,
    get_eval_agent_model,
    require_azure_env,
    run_agent_loop,
    scenario_available,
)


# ---------------------------------------------------------------------------
# MCP client fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def mcp_server_params():
    """StdioServerParameters pointing to the built MCP server.

    Uses 'yarn node' to enable Yarn PnP resolution of workspace dependencies.
    The cwd is set to the monorepo root so PnP can find all packages.
    """
    if not SERVER_ENTRY.exists():
        pytest.fail(
            f"MCP server not built. Run 'yarn nx build mcp' first.\n"
            f"Expected: {SERVER_ENTRY}"
        )
    return StdioServerParameters(
        command="yarn",
        args=["node", str(SERVER_ENTRY)],
        env={
            **os.environ,
            "O3R_MCP_LOG_LEVEL": "silent",
        },
        cwd=str(MONOREPO_ROOT),
    )


@pytest.fixture(scope="session")
async def mcp_client(mcp_server_params):
    """Session-scoped MCP ClientSession connected to the server.

    Yields a tuple of (session, tools_list).
    Requires asyncio_default_fixture_loop_scope=session in pytest.ini.
    """
    exit_stack = AsyncExitStack()
    read, write = await exit_stack.enter_async_context(
        stdio_client(mcp_server_params)
    )
    session = await exit_stack.enter_async_context(
        ClientSession(read, write)
    )
    await session.initialize()
    tools_result = await session.list_tools()
    yield session, tools_result.tools
    # Teardown: suppress anyio cancel-scope errors that occur when
    # pytest-asyncio finalizes the session-scoped async generator in a
    # different task than the one that created it.
    # See: https://github.com/pytest-dev/pytest-asyncio/issues/1191
    # This workaround is fragile (relies on error message string matching)
    # and may need updating if anyio/pytest-asyncio change their error messages.
    try:
        await exit_stack.aclose()
    except RuntimeError as e:
        if "cancel scope" in str(e).lower() or "different task" in str(e).lower():
            pass
        else:
            raise


@pytest.fixture(scope="session")
def available_tools(mcp_client):
    """List of tool schemas from the MCP server."""
    _session, tools = mcp_client
    return tools


@pytest.fixture(scope="session")
def tool_names(available_tools):
    """Set of tool names registered on the server."""
    return {t.name for t in available_tools}


# ---------------------------------------------------------------------------
# Azure OpenAI client fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def eval_agent_model():
    """Provide the configured agent model string."""
    return get_eval_agent_model()


@pytest.fixture(scope="session")
def openai_client():
    """Session-scoped Azure OpenAI client using Azure CLI credentials."""
    endpoint, api_version = require_azure_env()
    from openai import AsyncAzureOpenAI
    return AsyncAzureOpenAI(
        azure_endpoint=endpoint,
        azure_ad_token_provider=azure_token_provider(),
        api_version=api_version,
    )


@pytest.fixture(scope="session")
def deepeval_azure_model(eval_agent_model):
    """Azure OpenAI model for deepeval metrics (judge model).

    Uses AzureCliCredential so that deepeval metrics route LLM-judged
    evaluations through Azure OpenAI instead of direct OpenAI.
    """
    endpoint, api_version = require_azure_env()
    from deepeval.models import AzureOpenAIModel
    return AzureOpenAIModel(
        deployment_name=eval_agent_model,
        model=eval_agent_model,
        base_url=endpoint,
        api_version=api_version,
        azure_ad_token_provider=azure_token_provider(),
    )


# ---------------------------------------------------------------------------
# Agent loop fixture
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def agent_loop(openai_client, eval_agent_model, mcp_client):
    """Fixture returning an async callable that runs the agent loop.

    Usage in tests:
        result = await agent_loop("What are Otter best practices?")
        assert result.tools_called[0]["name"] == "get_best_practices"
    """
    session, tools = mcp_client

    async def _run(
        user_prompt: str,
        max_turns: int = 10,
        prior_messages: list[dict[str, Any]] | None = None,
        system_prompt: str | None = None,
    ) -> AgentResult:
        return await run_agent_loop(
            openai_client, eval_agent_model, session, tools,
            user_prompt, max_turns=max_turns,
            prior_messages=prior_messages,
            system_prompt=system_prompt,
        )

    return _run


# ---------------------------------------------------------------------------
# Shared result cache — avoids redundant LLM + MCP calls across test files
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def agent_result_cache():
    """Session-scoped cache for agent loop results.

    Shared across all test files to avoid redundant LLM + MCP calls.
    Tests for the same scenario (correctness, arguments, hallucination)
    all reuse the same cached AgentResult.
    """
    return {}


# ---------------------------------------------------------------------------
# Scenario filtering fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def available_scenarios():
    """Tool selection scenarios filtered by environment availability."""
    return [s for s in TOOL_SELECTION_SCENARIOS if scenario_available(s)]
