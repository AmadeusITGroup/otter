"""Level 2: Agent Tool Selection Evaluation.

Tests that an LLM agent correctly selects and uses MCP tools given user queries.
An LLM is given the tool definitions from the MCP server and asked to decide which
tool to call. The evaluation checks:
- ToolCorrectnessMetric: Was the right tool selected?
- GEval (argument correctness): Were the arguments correct?
- TaskCompletionMetric: Was the overall task completed?

This level requires an LLM provider configured via environment variables.

Run:
    OPENAI_API_KEY=... deepeval test run test_agent_selection.py
    # or with Anthropic:
    ANTHROPIC_API_KEY=... DEEPEVAL_MODEL=claude-3-5-sonnet deepeval test run test_agent_selection.py
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

import pytest
from deepeval import assert_test
from deepeval.metrics import GEval, ToolCorrectnessMetric
from deepeval.test_case import LLMTestCase, LLMTestCaseParams, ToolCall

from conftest import McpTestClient, get_deepeval_model, run_async

# Load golden scenarios
SCENARIOS_PATH = Path(__file__).parent / "datasets" / "golden_scenarios.json"
with open(SCENARIOS_PATH) as f:
    SCENARIOS = json.load(f)

AGENT_SCENARIOS = SCENARIOS["agent_selection_scenarios"]

# Filter scenarios based on available tokens
HAS_GITHUB_TOKEN = bool(os.environ.get("O3R_MCP_GITHUB_TOKEN"))


async def _get_tool_definitions(server_params) -> list[dict[str, Any]]:
    """Fetch tool definitions from the MCP server."""
    async with McpTestClient(server_params) as client:
        return await client.list_tools()


def _build_tool_selection_prompt(user_query: str, tools: list[dict[str, Any]]) -> str:
    """Build a prompt that asks the LLM to select the appropriate tool.

    The prompt provides tool definitions and asks the LLM to respond with
    a JSON object containing the tool name and arguments.
    """
    tool_descriptions = []
    for tool in tools:
        desc = f"- **{tool['name']}**: {tool.get('description', 'No description')}"
        if tool.get("inputSchema"):
            desc += f"\n  Input schema: {json.dumps(tool['inputSchema'], indent=2)}"
        tool_descriptions.append(desc)

    return f"""You are an AI assistant with access to the following MCP tools:

{chr(10).join(tool_descriptions)}

Given the user's query, select the SINGLE most appropriate tool to call and provide the arguments.
Respond with ONLY a JSON object in this exact format (no markdown, no explanation):
{{"tool": "<tool_name>", "arguments": {{<key>: <value>}}}}

If no arguments are needed, use an empty object: {{"tool": "<tool_name>", "arguments": {{}}}}

User query: {user_query}"""


def _strip_code_fences(text: str) -> str:
    """Remove markdown code fences (```...```) from LLM output."""
    return re.sub(r"^```\w*\n?", "", re.sub(r"\n?```\s*$", "", text)).strip()


def _parse_tool_selection(content: str, model: str) -> dict[str, Any]:
    """Parse a JSON tool-selection response from an LLM.

    Raises ``pytest.fail`` with a descriptive message on invalid JSON.
    """
    content = _strip_code_fences(content.strip())
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as e:
        pytest.fail(
            f"LLM returned invalid JSON (model={model}): {e}\n"
            f"Raw content: {content[:500]}"
        )
    if not isinstance(parsed, dict) or "tool" not in parsed:
        pytest.fail(
            f"LLM response missing 'tool' key (model={model}): {content[:500]}"
        )
    return parsed


def _call_llm_for_tool_selection(prompt: str, model: str) -> dict[str, Any]:
    """Call the LLM to select a tool based on the prompt.

    Supports OpenAI and Anthropic providers.
    Returns: {"tool": "<name>", "arguments": {...}}
    """
    if "claude" in model.lower() or "anthropic" in model.lower():
        return _call_anthropic(prompt, model)
    else:
        return _call_openai(prompt, model)


def _call_openai(prompt: str, model: str) -> dict[str, Any]:
    """Call OpenAI API for tool selection."""
    from openai import OpenAI

    client = OpenAI()
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=500,
    )
    content = response.choices[0].message.content.strip()
    return _parse_tool_selection(content, model)


def _call_anthropic(prompt: str, model: str) -> dict[str, Any]:
    """Call Anthropic API for tool selection."""
    from anthropic import Anthropic

    client = Anthropic()
    # Normalize model name
    model_name = model.replace("anthropic/", "")
    response = client.messages.create(
        model=model_name,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )
    content = response.content[0].text.strip()
    return _parse_tool_selection(content, model)


def _get_available_scenarios() -> list[dict]:
    """Filter scenarios based on available environment (GitHub token, etc.)."""
    available = []
    for scenario in AGENT_SCENARIOS:
        if scenario.get("requires_github_token") and not HAS_GITHUB_TOKEN:
            continue
        available.append(scenario)
    return available


def _requires_llm_api_key():
    """Skip test if no LLM API key is available."""
    has_openai = bool(os.environ.get("OPENAI_API_KEY"))
    has_anthropic = bool(os.environ.get("ANTHROPIC_API_KEY"))
    if not has_openai and not has_anthropic:
        pytest.skip(
            "No LLM API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY."
        )


# ---------------------------------------------------------------------------
# Parametrized test: Tool Selection Correctness
# ---------------------------------------------------------------------------

AVAILABLE_SCENARIOS = _get_available_scenarios()


@pytest.mark.llm
@pytest.mark.parametrize(
    "scenario",
    AVAILABLE_SCENARIOS,
    ids=[s["id"] for s in AVAILABLE_SCENARIOS],
)
def test_tool_selection_correctness(mcp_server_params, deepeval_model, scenario):
    """Verify that the LLM selects the correct MCP tool for each user query."""
    _requires_llm_api_key()

    # Get tool definitions from the MCP server
    tools = run_async(_get_tool_definitions(mcp_server_params))

    # Ask the LLM to select a tool
    prompt = _build_tool_selection_prompt(scenario["input"], tools)
    llm_response = _call_llm_for_tool_selection(prompt, deepeval_model)

    selected_tool = llm_response.get("tool", "")
    selected_args = llm_response.get("arguments", {})

    # Build deepeval test case
    test_case = LLMTestCase(
        input=scenario["input"],
        actual_output=f"Selected tool: {selected_tool} with arguments: {json.dumps(selected_args)}",
        tools_called=[
            ToolCall(
                name=selected_tool,
                input_parameters=selected_args,
            )
        ],
        expected_tools=[
            ToolCall(name=expected_tool)
            for expected_tool in scenario["expected_tools"]
        ],
    )

    tool_metric = ToolCorrectnessMetric(
        threshold=0.7,
        model=deepeval_model,
    )

    assert_test(test_case, [tool_metric])


# ---------------------------------------------------------------------------
# Parametrized test: Argument Correctness (GEval)
# ---------------------------------------------------------------------------

# Only test scenarios that have expected_arguments with actual values
SCENARIOS_WITH_ARGS = [
    s for s in AVAILABLE_SCENARIOS
    if s.get("expected_arguments")
]


@pytest.mark.llm
@pytest.mark.parametrize(
    "scenario",
    SCENARIOS_WITH_ARGS,
    ids=[s["id"] for s in SCENARIOS_WITH_ARGS],
)
def test_argument_correctness(mcp_server_params, deepeval_model, scenario):
    """Verify that the LLM passes correct arguments to the selected MCP tool."""
    _requires_llm_api_key()

    tools = run_async(_get_tool_definitions(mcp_server_params))
    prompt = _build_tool_selection_prompt(scenario["input"], tools)
    llm_response = _call_llm_for_tool_selection(prompt, deepeval_model)

    selected_args = llm_response.get("arguments", {})
    expected_args = scenario["expected_arguments"]

    test_case = LLMTestCase(
        input=scenario["input"],
        actual_output=json.dumps(selected_args),
        expected_output=json.dumps(expected_args),
    )

    arg_metric = GEval(
        name="Argument Correctness",
        criteria=(
            f"The actual arguments should match or be functionally equivalent to the expected arguments. "
            f"Expected: {json.dumps(expected_args)}. "
            f"The key names and values should be semantically correct for the tool being called. "
            f"Minor formatting differences (e.g., '14' vs '14.0') are acceptable."
        ),
        evaluation_params=[
            LLMTestCaseParams.INPUT,
            LLMTestCaseParams.ACTUAL_OUTPUT,
            LLMTestCaseParams.EXPECTED_OUTPUT,
        ],
        threshold=0.7,
        model=deepeval_model,
    )

    assert_test(test_case, [arg_metric])


# ---------------------------------------------------------------------------
# Test: Tool selection is deterministic (consistency check)
# ---------------------------------------------------------------------------

@pytest.mark.llm
@pytest.mark.parametrize(
    "scenario",
    AVAILABLE_SCENARIOS[:3],  # Test first 3 scenarios for consistency
    ids=[s["id"] for s in AVAILABLE_SCENARIOS[:3]],
)
def test_tool_selection_consistency(mcp_server_params, deepeval_model, scenario):
    """Verify that the LLM consistently selects the same tool across multiple calls.

    Runs the same query 3 times and checks that the tool selection is consistent.
    """
    _requires_llm_api_key()

    tools = run_async(_get_tool_definitions(mcp_server_params))
    prompt = _build_tool_selection_prompt(scenario["input"], tools)

    selected_tools = []
    for _ in range(3):
        llm_response = _call_llm_for_tool_selection(prompt, deepeval_model)
        selected_tools.append(llm_response.get("tool", ""))

    # All 3 selections should be the same tool
    unique_tools = set(selected_tools)
    assert len(unique_tools) == 1, (
        f"Inconsistent tool selection for query '{scenario['input']}': "
        f"Got {selected_tools} across 3 runs. Expected consistent selection."
    )

    # The consistently selected tool should be one of the expected tools
    selected = selected_tools[0]
    assert selected in scenario["expected_tools"], (
        f"Consistently selected tool '{selected}' is not in expected tools "
        f"{scenario['expected_tools']} for query '{scenario['input']}'"
    )


# ---------------------------------------------------------------------------
# Test: No tool hallucination (LLM shouldn't invent tool names)
# ---------------------------------------------------------------------------

@pytest.mark.llm
def test_no_tool_hallucination(mcp_server_params, deepeval_model):
    """Verify that the LLM doesn't hallucinate tool names that don't exist."""
    _requires_llm_api_key()

    tools = run_async(_get_tool_definitions(mcp_server_params))
    valid_tool_names = {t["name"] for t in tools}

    # Use a query that might tempt the LLM to invent a tool
    prompt = _build_tool_selection_prompt(
        "Delete all files in the project and reset everything",
        tools,
    )
    llm_response = _call_llm_for_tool_selection(prompt, deepeval_model)
    selected_tool = llm_response.get("tool", "")

    assert selected_tool in valid_tool_names, (
        f"LLM hallucinated tool name '{selected_tool}'. "
        f"Valid tools are: {valid_tool_names}"
    )
