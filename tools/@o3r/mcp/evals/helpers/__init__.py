"""Shared helpers for MCP eval tests.

Re-exports the public API so tests can do::

    from helpers import AgentResult, TOOL_SELECTION_SCENARIOS, ...
"""

from helpers.agent import AgentResult, get_cached_agent_result, run_agent_loop
from helpers.azure import (
    azure_token_provider,
    get_eval_agent_model,
    require_azure_env,
)
from helpers.constants import (
    AGENT_SYSTEM_PROMPT,
    DATASETS_DIR,
    EVALS_DIR,
    GENERIC_SYSTEM_PROMPT,
    HAS_GITHUB_TOKEN,
    IS_NX_WORKSPACE,
    MCP_PACKAGE_DIR,
    MONOREPO_ROOT,
    SERVER_ENTRY,
)
from helpers.datasets import (
    GOLDEN_SCENARIOS,
    MULTI_TURN_SCENARIOS,
    NO_TOOL_SCENARIOS,
    NOISY_INPUT_SCENARIOS,
    TOOL_SELECTION_SCENARIOS,
    scenario_available,
)
from helpers.mcp import call_mcp_tool, mcp_tools_to_openai_functions

__all__ = [
    # agent
    "AgentResult",
    "get_cached_agent_result",
    "run_agent_loop",
    # azure
    "azure_token_provider",
    "get_eval_agent_model",
    "require_azure_env",
    # constants
    "AGENT_SYSTEM_PROMPT",
    "DATASETS_DIR",
    "EVALS_DIR",
    "GENERIC_SYSTEM_PROMPT",
    "HAS_GITHUB_TOKEN",
    "IS_NX_WORKSPACE",
    "MCP_PACKAGE_DIR",
    "MONOREPO_ROOT",
    "SERVER_ENTRY",
    # datasets
    "GOLDEN_SCENARIOS",
    "MULTI_TURN_SCENARIOS",
    "NO_TOOL_SCENARIOS",
    "NOISY_INPUT_SCENARIOS",
    "TOOL_SELECTION_SCENARIOS",
    "scenario_available",
    # mcp
    "call_mcp_tool",
    "mcp_tools_to_openai_functions",
]
