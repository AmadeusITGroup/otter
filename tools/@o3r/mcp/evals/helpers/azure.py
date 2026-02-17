"""Azure OpenAI helpers for MCP eval tests."""

from __future__ import annotations

import os

import pytest


def get_eval_agent_model() -> str:
    """Return the agent model string based on environment configuration.

    Reads EVAL_AGENT_MODEL env var (Azure deployment name). Required.
    """
    model = os.environ.get("EVAL_AGENT_MODEL")
    if not model:
        pytest.skip("EVAL_AGENT_MODEL not set — skipping LLM test")
    return model


def require_azure_env() -> tuple[str, str]:
    """Return (endpoint, api_version) or skip the test if not configured."""
    endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
    api_version = os.environ.get("AZURE_OPENAI_API_VERSION")
    if not endpoint or not api_version:
        pytest.skip(
            "AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_VERSION must be set"
            " — skipping LLM test"
        )
    return endpoint, api_version


def azure_token_provider():
    """Create an Azure CLI token provider for cognitive services."""
    from azure.identity import AzureCliCredential, get_bearer_token_provider
    return get_bearer_token_provider(
        AzureCliCredential(),
        "https://cognitiveservices.azure.com/.default",
    )
