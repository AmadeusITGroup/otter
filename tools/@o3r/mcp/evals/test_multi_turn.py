"""Multi-turn conversation tests (requires Azure OpenAI credentials).

Validates that the LLM selects correct tools across a multi-turn conversation,
where each turn may depend on context from previous turns.

Run:
    deepeval test run test_multi_turn.py --verbose
"""

import pytest

from helpers import MULTI_TURN_SCENARIOS


def _scenario_id(scenario):
    return scenario["id"]


@pytest.mark.llm
@pytest.mark.parametrize("scenario", MULTI_TURN_SCENARIOS, ids=_scenario_id)
@pytest.mark.asyncio(loop_scope="session")
async def test_multi_turn_tool_selection(agent_loop, scenario):
    """LLM should select correct tools across a multi-turn conversation."""
    prior_messages = None

    for i, turn in enumerate(scenario["turns"]):
        result = await agent_loop(
            turn["user_prompt"],
            prior_messages=prior_messages,
        )

        expected = turn["expected_tools"]
        actual_names = [tc["name"] for tc in result.tools_called]

        if expected:
            # At least one expected tool should have been called
            matched = [n for n in actual_names if n in expected]
            assert matched, (
                f"Turn {i + 1} ({scenario['id']}): expected one of {expected}, "
                f"got {actual_names} for prompt: {turn['user_prompt']}"
            )
        else:
            # No tool should have been called
            assert not actual_names, (
                f"Turn {i + 1} ({scenario['id']}): expected no tools, "
                f"got {actual_names} for prompt: {turn['user_prompt']}"
            )

        # Verify arguments if specified
        if turn.get("expected_args_subset"):
            matched_args = None
            for tc in result.tools_called:
                if tc["name"] in expected:
                    matched_args = tc["args"]
                    break
            assert matched_args is not None, (
                f"Turn {i + 1}: no matching tool found for arg validation"
            )
            for key, value in turn["expected_args_subset"].items():
                assert key in matched_args, (
                    f"Turn {i + 1}: missing argument {key}"
                )
                assert matched_args[key] == value, (
                    f"Turn {i + 1}: argument {key}: "
                    f"got {matched_args[key]!r}, expected {value!r}"
                )

        # Pass conversation history to next turn
        prior_messages = result.messages
