"""Drift detection tests — golden scenario tool names must match MCP server.

Deterministic tests (no LLM API key needed) that verify golden scenario tool
names actually exist on the MCP server, and that every registered MCP tool has
at least one golden scenario covering it.

Run:
    pytest test_drift_detection.py -v
"""

import pytest

from helpers import GOLDEN_SCENARIOS, scenario_available


def _collect_expected_tools(*, filter_by_env: bool) -> set[str]:
    """Collect all expected tool names from golden scenarios.

    Args:
        filter_by_env: When True, skip scenarios whose environment
            prerequisites are not met (e.g. missing GitHub token,
            running inside an Nx workspace).
    """
    tools: set[str] = set()
    for category in GOLDEN_SCENARIOS.values():
        if not isinstance(category, list):
            continue
        for scenario in category:
            if filter_by_env and not scenario_available(scenario):
                continue
            for tool in scenario.get("expected_tools", []):
                tools.add(tool)
            for turn in scenario.get("turns", []):
                for tool in turn.get("expected_tools", []):
                    tools.add(tool)
    return tools


@pytest.mark.asyncio(loop_scope="session")
async def test_golden_scenario_tools_exist(tool_names):
    """All tool names referenced in golden scenarios must exist on the MCP server.

    Scenarios whose environment prerequisites are not met (e.g. missing
    GitHub token, Nx workspace) are excluded from the check.
    """
    all_expected = _collect_expected_tools(filter_by_env=True)

    missing = all_expected - tool_names
    assert not missing, (
        f"Golden scenarios reference tools not registered on MCP server: {sorted(missing)}. "
        f"Available tools: {sorted(tool_names)}"
    )


@pytest.mark.asyncio(loop_scope="session")
async def test_all_tools_have_golden_scenarios(tool_names):
    """Every MCP tool registered on the server should have at least one golden scenario."""
    covered_tools = _collect_expected_tools(filter_by_env=False)

    uncovered = tool_names - covered_tools
    assert not uncovered, (
        f"MCP tools without any golden scenario coverage: {sorted(uncovered)}. "
        f"Add scenarios to the appropriate dataset file for these tools."
    )
