"""Negative tests — LLM should NOT call tools for irrelevant prompts.

Validates that the LLM correctly avoids calling any MCP tool when the user
prompt is unrelated to the Otter framework.

Run:
    deepeval test run test_negative.py --verbose
"""

import pytest

from helpers import NO_TOOL_SCENARIOS


def _scenario_id(scenario):
    return scenario["id"]


@pytest.mark.llm
@pytest.mark.parametrize("scenario", NO_TOOL_SCENARIOS, ids=_scenario_id)
@pytest.mark.asyncio(loop_scope="session")
async def test_no_tool_for_irrelevant_prompt(agent_loop, scenario):
    """LLM should not call any MCP tool when the prompt is unrelated to Otter."""
    result = await agent_loop(scenario["user_prompt"])
    assert not result.tools_called, (
        f"LLM incorrectly called tools {[tc['name'] for tc in result.tools_called]} "
        f"for an unrelated prompt: {scenario['user_prompt']}"
    )
    assert result.final_response, (
        f"LLM should still provide a response even without tools "
        f"for: {scenario['user_prompt']}"
    )
