"""Noisy/informal input tests — robustness to typos and casual phrasing.

Validates that the LLM selects the correct tool and extracts correct arguments
even when the user prompt contains typos, abbreviations, or informal language.

Run:
    deepeval test run test_noisy_input.py --verbose
"""

import pytest

from helpers import NOISY_INPUT_SCENARIOS, get_cached_agent_result


def _scenario_id(scenario):
    return scenario["id"]


@pytest.mark.llm
@pytest.mark.parametrize("scenario", NOISY_INPUT_SCENARIOS, ids=_scenario_id)
@pytest.mark.asyncio(loop_scope="session")
async def test_noisy_input_tool_selection(
    agent_loop, agent_result_cache, scenario,
):
    """LLM should select the correct tool even with typos and informal phrasing."""
    result = await get_cached_agent_result(agent_result_cache, agent_loop, scenario)

    expected_tools = scenario["expected_tools"]
    actual_names = [tc["name"] for tc in result.tools_called]

    matched = [n for n in actual_names if n in expected_tools]
    assert matched, (
        f"LLM failed to select expected tool with noisy input. "
        f"Expected one of {expected_tools}, got {actual_names} "
        f"for prompt: {scenario['user_prompt']}"
    )


@pytest.mark.llm
@pytest.mark.parametrize(
    "scenario",
    [s for s in NOISY_INPUT_SCENARIOS if s.get("expected_args_subset")],
    ids=_scenario_id,
)
@pytest.mark.asyncio(loop_scope="session")
async def test_noisy_input_arguments(agent_loop, agent_result_cache, scenario):
    """LLM should extract correct arguments from noisy/informal prompts."""
    result = await get_cached_agent_result(agent_result_cache, agent_loop, scenario)

    matched_args = None
    for tc in result.tools_called:
        if tc["name"] in scenario["expected_tools"]:
            matched_args = tc["args"]
            break

    assert matched_args is not None, (
        f"No matching tool found for noisy input: {scenario['user_prompt']}"
    )

    for key, value in scenario["expected_args_subset"].items():
        assert key in matched_args, (
            f"Missing argument {key} from noisy input: {scenario['user_prompt']}"
        )
        assert matched_args[key] == value, (
            f"Argument {key}: got {matched_args[key]!r}, expected {value!r} "
            f"from noisy input: {scenario['user_prompt']}"
        )
