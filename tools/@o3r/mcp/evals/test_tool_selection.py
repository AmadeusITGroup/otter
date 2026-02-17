"""Core tool selection correctness tests (requires Azure OpenAI credentials).

Tests that an LLM correctly selects and executes the right MCP tool given a
user prompt, using a full agent loop that mimics GitHub Copilot Agent Mode:
  1. User prompt + MCP tools sent to the LLM
  2. LLM decides which tool(s) to call (tool_choice="auto")
  3. Tool executed via MCP server
  4. Result fed back to LLM
  5. LLM produces final response

Run:
    deepeval test run test_tool_selection.py --verbose
"""

import pytest
from deepeval import assert_test
from deepeval.metrics import ToolCorrectnessMetric
from deepeval.test_case import LLMTestCase, ToolCall

from helpers import (
    HAS_GITHUB_TOKEN,
    TOOL_SELECTION_SCENARIOS,
    get_cached_agent_result,
    run_agent_loop,
)

AVAILABLE_SCENARIOS = [
    s for s in TOOL_SELECTION_SCENARIOS
    if not s.get("requires_github_token") or HAS_GITHUB_TOKEN
]


def _scenario_id(scenario):
    return scenario["id"]


# ---------------------------------------------------------------------------
# Tool selection correctness
# ---------------------------------------------------------------------------

@pytest.mark.llm
@pytest.mark.parametrize("scenario", AVAILABLE_SCENARIOS, ids=_scenario_id)
@pytest.mark.asyncio(loop_scope="session")
async def test_tool_selection_correctness(
    agent_loop, agent_result_cache, available_tools, deepeval_azure_model, scenario,
):
    """LLM should select the correct tool for the given user prompt."""
    result = await get_cached_agent_result(agent_result_cache, agent_loop, scenario)

    expected_tools = [ToolCall(name=t) for t in scenario["expected_tools"]]
    actual_tools = [ToolCall(name=tc["name"]) for tc in result.tools_called]
    available = [ToolCall(name=t.name) for t in available_tools]

    # For single-tool cases, use strict_mode for exact match; otherwise use a relaxed threshold
    if len(scenario["expected_tools"]) == 1:
        metric = ToolCorrectnessMetric(threshold=1.0, strict_mode=True, available_tools=available, model=deepeval_azure_model)
    else:
        metric = ToolCorrectnessMetric(threshold=0.7, available_tools=available, model=deepeval_azure_model)
    test_case = LLMTestCase(
        input=scenario["user_prompt"],
        actual_output=result.final_response or "no response",
        expected_tools=expected_tools,
        tools_called=actual_tools,
    )
    assert_test(test_case, [metric])


@pytest.mark.llm
@pytest.mark.parametrize(
    "scenario",
    [s for s in AVAILABLE_SCENARIOS if s.get("expected_args") or s.get("expected_args_subset")],
    ids=_scenario_id,
)
@pytest.mark.asyncio(loop_scope="session")
async def test_tool_arguments_correctness(agent_loop, agent_result_cache, scenario):
    """LLM should pass correct arguments to the selected tool."""
    result = await get_cached_agent_result(agent_result_cache, agent_loop, scenario)

    assert result.tools_called, (
        f"No tools were called for prompt: {scenario['user_prompt']}"
    )

    # Find a tool call matching one of the expected tools
    matched_args = None
    for tc in result.tools_called:
        if tc["name"] in scenario["expected_tools"]:
            matched_args = tc["args"]
            break

    assert matched_args is not None, (
        f"None of the called tools {[tc['name'] for tc in result.tools_called]} "
        f"match expected {scenario['expected_tools']}"
    )

    expected = scenario.get("expected_args") or scenario.get("expected_args_subset", {})
    for key, value in expected.items():
        assert key in matched_args, f"Missing argument: {key}"
        assert matched_args[key] == value, (
            f"Argument {key}: got {matched_args[key]!r}, expected {value!r}"
        )


@pytest.mark.llm
@pytest.mark.parametrize("scenario", AVAILABLE_SCENARIOS[:3], ids=_scenario_id)
@pytest.mark.asyncio(loop_scope="session")
async def test_tool_selection_consistency(
    openai_client, eval_agent_model, mcp_client, scenario
):
    """The same prompt should consistently select the same tool across runs."""
    session, tools = mcp_client
    selections = []
    for _ in range(3):
        result = await run_agent_loop(
            openai_client, eval_agent_model, session, tools,
            scenario["user_prompt"], max_turns=3,
        )
        called_names = [tc["name"] for tc in result.tools_called]
        selections.append(tuple(called_names))

    assert len(set(selections)) == 1, (
        f"Inconsistent tool selection across 3 runs: {selections}"
    )
    # At least one called tool should be in the expected list
    for name in selections[0]:
        if name in scenario["expected_tools"]:
            break
    else:
        assert False, (
            f"Consistently selected tools {selections[0]} do not include any "
            f"expected tool {scenario['expected_tools']} for: {scenario['user_prompt']}"
        )
