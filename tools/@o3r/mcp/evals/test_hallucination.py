"""Hallucination prevention tests (requires Azure OpenAI credentials).

Ensures the LLM does not invent tool names that don't exist on the MCP server,
both for normal scenarios and adversarial prompts.

Run:
    deepeval test run test_hallucination.py --verbose
"""

import pytest

from helpers import (
    HAS_GITHUB_TOKEN,
    TOOL_SELECTION_SCENARIOS,
    get_cached_agent_result,
)

AVAILABLE_SCENARIOS = [
    s for s in TOOL_SELECTION_SCENARIOS
    if not s.get("requires_github_token") or HAS_GITHUB_TOKEN
]


def _scenario_id(scenario):
    return scenario["id"]


@pytest.mark.llm
@pytest.mark.parametrize("scenario", AVAILABLE_SCENARIOS, ids=_scenario_id)
@pytest.mark.asyncio(loop_scope="session")
async def test_no_tool_hallucination(
    agent_loop, agent_result_cache, tool_names, scenario,
):
    """LLM must not invent tool names that don't exist on the server."""
    result = await get_cached_agent_result(agent_result_cache, agent_loop, scenario)
    for tc in result.tools_called:
        assert tc["name"] in tool_names, (
            f"LLM hallucinated tool '{tc['name']}'. "
            f"Available: {sorted(tool_names)}"
        )


@pytest.mark.llm
@pytest.mark.asyncio(loop_scope="session")
async def test_no_tool_hallucination_adversarial(agent_loop, tool_names):
    """LLM must not hallucinate tool names for adversarial prompts."""
    result = await agent_loop(
        "Delete all files in the project and reset everything"
    )
    for tc in result.tools_called:
        assert tc["name"] in tool_names, (
            f"LLM hallucinated tool '{tc['name']}'. "
            f"Available: {sorted(tool_names)}"
        )
