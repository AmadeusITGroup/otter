"""Level 1: MCP Tool Output Quality Evaluation.

Tests that each MCP tool returns relevant, faithful, and well-formatted content.
These tests call MCP tools directly (no LLM in the loop) and evaluate response quality
using deepeval metrics.

Metrics used:
- AnswerRelevancyMetric: Is the tool output relevant to what was asked?
- GEval (custom criteria): Does the output meet specific quality criteria?
- FaithfulnessMetric: Is the output faithful to the provided context?

Run:
    deepeval test run test_tool_outputs.py
    # or
    pytest test_tool_outputs.py -v
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from deepeval import assert_test
from deepeval.metrics import AnswerRelevancyMetric, GEval
from deepeval.test_case import LLMTestCase, LLMTestCaseParams

from conftest import McpTestClient, get_deepeval_model, run_async

# Load golden scenarios
SCENARIOS_PATH = Path(__file__).parent / "datasets" / "golden_scenarios.json"
with open(SCENARIOS_PATH) as f:
    SCENARIOS = json.load(f)

TOOL_OUTPUT_SCENARIOS = SCENARIOS["tool_output_scenarios"]


async def _call_tool(server_params, tool_name: str, arguments: dict) -> str:
    """Call an MCP tool and return its text output."""
    async with McpTestClient(server_params) as client:
        return await client.get_tool_text_output(tool_name, arguments)


# ---------------------------------------------------------------------------
# Parametrized test: Answer Relevancy for each tool output scenario
# ---------------------------------------------------------------------------

@pytest.mark.llm
@pytest.mark.parametrize(
    "scenario",
    TOOL_OUTPUT_SCENARIOS,
    ids=[s["id"] for s in TOOL_OUTPUT_SCENARIOS],
)
def test_tool_output_relevancy(mcp_server_params, deepeval_model, scenario):
    """Verify that each MCP tool output is relevant to its intended purpose."""
    actual_output = run_async(
        _call_tool(mcp_server_params, scenario["tool"], scenario.get("arguments", {}))
    )

    test_case = LLMTestCase(
        input=scenario["description"],
        actual_output=actual_output,
    )

    metric = AnswerRelevancyMetric(
        threshold=0.6,
        model=deepeval_model,
    )

    assert_test(test_case, [metric])


# ---------------------------------------------------------------------------
# Parametrized test: Custom quality criteria via GEval
# ---------------------------------------------------------------------------

@pytest.mark.llm
@pytest.mark.parametrize(
    "scenario",
    TOOL_OUTPUT_SCENARIOS,
    ids=[s["id"] for s in TOOL_OUTPUT_SCENARIOS],
)
def test_tool_output_quality(mcp_server_params, deepeval_model, scenario):
    """Evaluate tool output against custom quality criteria defined in the golden dataset."""
    actual_output = run_async(
        _call_tool(mcp_server_params, scenario["tool"], scenario.get("arguments", {}))
    )

    test_case = LLMTestCase(
        input=scenario["description"],
        actual_output=actual_output,
        expected_output=scenario["quality_criteria"],
    )

    quality_metric = GEval(
        name="Tool Output Quality",
        criteria=scenario["quality_criteria"],
        evaluation_params=[
            LLMTestCaseParams.INPUT,
            LLMTestCaseParams.ACTUAL_OUTPUT,
            LLMTestCaseParams.EXPECTED_OUTPUT,
        ],
        threshold=0.6,
        model=deepeval_model,
    )

    assert_test(test_case, [quality_metric])


# ---------------------------------------------------------------------------
# Test: Expected keyword presence in tool outputs
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "scenario",
    TOOL_OUTPUT_SCENARIOS,
    ids=[s["id"] for s in TOOL_OUTPUT_SCENARIOS],
)
def test_tool_output_contains_expected_topics(mcp_server_params, scenario):
    """Verify that tool output contains expected keywords/topics (deterministic check)."""
    actual_output = run_async(
        _call_tool(mcp_server_params, scenario["tool"], scenario.get("arguments", {}))
    )

    output_lower = actual_output.lower()
    for topic in scenario.get("expected_topics", []):
        assert topic.lower() in output_lower, (
            f"Expected topic '{topic}' not found in output of tool '{scenario['tool']}'. "
            f"Output preview: {actual_output[:200]}..."
        )


# ---------------------------------------------------------------------------
# Test: Tool output is non-empty and well-structured
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "scenario",
    TOOL_OUTPUT_SCENARIOS,
    ids=[s["id"] for s in TOOL_OUTPUT_SCENARIOS],
)
def test_tool_output_structure(mcp_server_params, scenario):
    """Verify that tool outputs are non-empty and contain meaningful content."""
    actual_output = run_async(
        _call_tool(mcp_server_params, scenario["tool"], scenario.get("arguments", {}))
    )

    # Output should not be empty
    assert actual_output.strip(), f"Tool '{scenario['tool']}' returned empty output"

    # Output should have reasonable length (at least 50 chars for any tool)
    assert len(actual_output) >= 50, (
        f"Tool '{scenario['tool']}' output is suspiciously short ({len(actual_output)} chars): "
        f"{actual_output[:100]}"
    )


# ---------------------------------------------------------------------------
# Test: No unresolved placeholders in create_monorepo_with_app output
# ---------------------------------------------------------------------------

def test_create_monorepo_no_placeholders(mcp_server_params):
    """Verify that create_monorepo_with_app replaces all template placeholders."""
    actual_output = run_async(
        _call_tool(
            mcp_server_params,
            "create_monorepo_with_app",
            {"repositoryName": "test-repo", "applicationName": "test-app"},
        )
    )

    placeholders = ["<repositoryName>", "<applicationName>"]
    for placeholder in placeholders:
        assert placeholder not in actual_output, (
            f"Unresolved placeholder '{placeholder}' found in create_monorepo_with_app output"
        )

    # Verify the actual values ARE present
    assert "test-repo" in actual_output, "Repository name 'test-repo' not found in output"
    assert "test-app" in actual_output, "Application name 'test-app' not found in output"


# ---------------------------------------------------------------------------
# Test: Instruction following — migration tool output format
# ---------------------------------------------------------------------------

@pytest.mark.llm
def test_migration_tool_instruction_format(mcp_server_params, deepeval_model):
    """Evaluate that the migration tool output follows a clear instruction format."""
    actual_output = run_async(
        _call_tool(
            mcp_server_params,
            "migrate_otter_version",
            {"packageJsonPath": "./nonexistent-package.json"},
        )
    )

    test_case = LLMTestCase(
        input="Migrate Otter version - requesting migration instructions",
        actual_output=actual_output,
    )

    instruction_format_metric = GEval(
        name="Instruction Format Quality",
        criteria=(
            "The output should communicate clearly about the migration status. "
            "If it found a version, it should present migration steps. "
            "If it couldn't find the package.json or version, it should clearly explain the issue "
            "and suggest next steps. The response should be actionable and not confusing."
        ),
        evaluation_params=[
            LLMTestCaseParams.INPUT,
            LLMTestCaseParams.ACTUAL_OUTPUT,
        ],
        threshold=0.5,
        model=deepeval_model,
    )

    assert_test(test_case, [instruction_format_metric])
