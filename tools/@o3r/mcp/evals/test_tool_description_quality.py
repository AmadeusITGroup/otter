"""Tool description quality tests (requires Azure OpenAI credentials).

Tests whether MCP tool descriptions alone (without Otter-specific system prompt
guidance) are descriptive enough for the LLM to select the correct tool.

Run:
    deepeval test run test_tool_description_quality.py --verbose
"""

import pytest

from helpers import (
    GENERIC_SYSTEM_PROMPT,
    HAS_GITHUB_TOKEN,
    TOOL_SELECTION_SCENARIOS,
    get_cached_agent_result,
)

# Use a subset of straightforward scenarios to test if tool descriptions
# alone are good enough for tool selection, without any Otter-specific
# guidance in the system prompt.
_TOOL_DESC_SCENARIOS = [
    s for s in TOOL_SELECTION_SCENARIOS
    if s["id"] in {
        "best_practices_query",
        "create_monorepo_query",
        "migrate_version_query",
        "angular_schematics_query",
    }
    and (not s.get("requires_github_token") or HAS_GITHUB_TOKEN)
]


def _scenario_id(scenario):
    return scenario["id"]


@pytest.mark.llm
@pytest.mark.parametrize("scenario", _TOOL_DESC_SCENARIOS, ids=_scenario_id)
@pytest.mark.asyncio(loop_scope="session")
async def test_tool_description_quality(
    agent_loop, agent_result_cache, scenario,
):
    """MCP tool descriptions should be descriptive enough for the LLM to
    select the right tool without Otter-specific system prompt guidance."""
    result = await get_cached_agent_result(
        agent_result_cache, agent_loop, scenario,
        system_prompt=GENERIC_SYSTEM_PROMPT,
    )

    expected_tools = scenario["expected_tools"]
    actual_names = [tc["name"] for tc in result.tools_called]

    matched = [n for n in actual_names if n in expected_tools]
    assert matched, (
        f"With a generic system prompt, LLM failed to select the right tool. "
        f"Expected one of {expected_tools}, got {actual_names}. "
        f"This suggests the MCP tool descriptions need improvement for: "
        f"{scenario['user_prompt']}"
    )
