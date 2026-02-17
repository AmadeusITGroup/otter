"""Dataset loading utilities for MCP eval tests."""

from __future__ import annotations

import json
from typing import Any

from .constants import DATASETS_DIR, HAS_GITHUB_TOKEN, IS_NX_WORKSPACE


def _load_dataset(filename: str) -> list[dict[str, Any]]:
    """Load a single dataset JSON file from the datasets directory."""
    with open(DATASETS_DIR / filename, encoding="utf-8") as f:
        return json.load(f)


# Individual scenario lists — importable by test modules
TOOL_SELECTION_SCENARIOS: list[dict[str, Any]] = _load_dataset("tool_selection_scenarios.json")
NO_TOOL_SCENARIOS: list[dict[str, Any]] = _load_dataset("no_tool_scenarios.json")
NOISY_INPUT_SCENARIOS: list[dict[str, Any]] = _load_dataset("noisy_input_scenarios.json")
MULTI_TURN_SCENARIOS: list[dict[str, Any]] = _load_dataset("multi_turn_scenarios.json")

# Combined dict — used by drift detection tests that iterate all categories
GOLDEN_SCENARIOS: dict[str, list[dict[str, Any]]] = {
    "tool_selection_scenarios": TOOL_SELECTION_SCENARIOS,
    "no_tool_scenarios": NO_TOOL_SCENARIOS,
    "noisy_input_scenarios": NOISY_INPUT_SCENARIOS,
    "multi_turn_scenarios": MULTI_TURN_SCENARIOS,
}


def scenario_available(scenario: dict[str, Any]) -> bool:
    """Check if a scenario's environment prerequisites are met."""
    if scenario.get("requires_github_token") and not HAS_GITHUB_TOKEN:
        return False
    if scenario.get("requires_non_nx_workspace") and IS_NX_WORKSPACE:
        return False
    return True
