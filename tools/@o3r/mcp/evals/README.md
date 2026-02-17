# DeepEval Tests for @o3r/mcp

LLM-based evaluation tests for the Otter MCP server using [deepeval](https://docs.confident-ai.com/).

## Overview

| File | What it tests | LLM required? |
|------|---------------|---------------|
| `test_tool_selection.py` | Core tool selection correctness, argument extraction, consistency | Yes |
| `test_hallucination.py` | LLM does not invent non-existent tool names | Yes |
| `test_negative.py` | LLM correctly avoids tools for irrelevant prompts | Yes |
| `test_noisy_input.py` | Robustness to typos, abbreviations, casual phrasing | Yes |
| `test_multi_turn.py` | Correct tool selection across multi-turn conversations | Yes |
| `test_tool_description_quality.py` | MCP tool descriptions alone suffice for selection | Yes |
| `test_drift_detection.py` | Golden scenario tool names match MCP server registry | No |

Tests are tagged with **pytest markers** so you can run them selectively:

| Marker | Meaning |
|--------|---------|
| `llm` | Requires Azure OpenAI credentials (`az login`) |
| _(no marker)_ | Deterministic — no API key needed |

## Prerequisites

**Python 3.10+** is required (3.12 recommended). The codebase uses PEP 604 union types (`X | Y`) which require Python 3.10+.

1. **Build the MCP server** (tests spawn it as a subprocess):
   ```bash
   yarn nx build mcp
   ```

2. **Create a virtual environment and install Python dependencies**:
   ```bash
   cd tools/@o3r/mcp/evals
   python3.12 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.lock
   ```
   > **Note:** On macOS the default `python3` may be 3.9 (from Xcode CLI Tools), which is too old. Use an explicit `python3.12` (or any 3.10+) to create the venv. Once activated, `pip` and `python` inside the venv point to the correct version.

3. **Authenticate with Azure CLI**:
   ```bash
   az login
   ```

4. **Configure Azure OpenAI environment variables**:
   ```bash
   export AZURE_OPENAI_ENDPOINT="https://my-resource.openai.azure.com/"
   export AZURE_OPENAI_API_VERSION="2024-12-01-preview"
   export EVAL_AGENT_MODEL="gpt-4o"      # Azure deployment name
   ```

5. **(Optional) GitHub token** for GitHub-dependent tool tests:
   ```bash
   export O3R_MCP_GITHUB_TOKEN="ghp_..."
   ```

## Running Tests

### Deterministic tests only (no API key needed)
```bash
cd tools/@o3r/mcp/evals
pytest -m "not llm" -v
```

### LLM-judged tests only
```bash
pytest -m llm -v
```

### All tests
```bash
pytest -v
```

### All eval tests via deepeval
```bash
deepeval test run . --verbose
```

### A specific test file
```bash
deepeval test run test_hallucination.py --verbose
```

### Via nx
```bash
yarn nx deepeval mcp
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `AZURE_OPENAI_ENDPOINT` | — | **Required.** Azure OpenAI endpoint URL (e.g. `https://my-resource.openai.azure.com/`) |
| `AZURE_OPENAI_API_VERSION` | — | **Required.** Azure OpenAI API version (e.g. `2024-12-01-preview`) |
| `EVAL_AGENT_MODEL` | — | **Required.** Azure deployment name used as the agent under test and as the deepeval judge model |
| `O3R_MCP_GITHUB_TOKEN` | — | GitHub PAT for testing GitHub-dependent tools |
| `O3R_MCP_LOG_LEVEL` | `silent` | MCP server log level during tests |

Authentication uses `AzureCliCredential`, which picks up `az login` tokens locally and in CI. Both the agent loop (Azure OpenAI client) and deepeval's judge model (`AzureOpenAIModel`) authenticate through Azure — no direct OpenAI API key is needed.

## Golden Scenarios

Test scenarios are defined in `datasets/`:

- **`tool_selection_scenarios.json`**: User queries with expected tool selections and arguments
- **`no_tool_scenarios.json`**: Queries where no tool should be selected
- **`noisy_input_scenarios.json`**: Queries with typos, abbreviations, and informal phrasing
- **`multi_turn_scenarios.json`**: Multi-turn conversation flows

Add new scenarios by appending to the appropriate JSON file.

## Metrics Reference

### Tool Selection Metrics
| Metric | Threshold | Purpose |
|--------|-----------|---------|
| `ToolCorrectnessMetric` | 0.7 | Did the LLM select the correct tool? |
| Argument correctness | exact | Are tool arguments correct? |
| Consistency check | exact | Same tool selected across 3 runs? |
| Hallucination check | exact | No invented tool names? |

> **Note:** The agent loop uses Azure OpenAI function-calling with `temperature=0` for determinism. Results are cached per scenario across test files within a single pytest session to avoid redundant LLM calls.

## CI Integration

Tests run in GitHub Actions via `.github/workflows/deepeval-tests.yml`, triggered from the main CI pipeline.

**Required GitHub Secrets:**
- `AZURE_OPENAI_ENDPOINT` — Azure OpenAI endpoint URL
- `AZURE_OPENAI_API_VERSION` — Azure OpenAI API version
- `AZURE_CLIENT_ID` — Azure service principal client ID for OIDC login
- `AZURE_TENANT_ID` — Azure AD tenant ID for OIDC login
- `AZURE_SUBSCRIPTION_ID` — Azure subscription ID for OIDC login
- `O3R_MCP_GITHUB_TOKEN` (optional) — For GitHub-dependent tool tests

The CI workflow authenticates via `az login` using federated credentials (OpenID Connect). The deepeval judge model uses the same Azure credentials via `AzureOpenAIModel`.

## Cost Estimate

Each full test run makes ~20-30 LLM API calls (agent + judge). Approximate cost with GPT-4o as both agent and judge: ~$0.10-0.30 per run. All calls route through Azure OpenAI.

## Updating Dependencies

To regenerate the lock file after changing `requirements.txt` (from inside the activated venv):
```bash
cd tools/@o3r/mcp/evals
pip install -r requirements.txt
pip freeze > requirements.lock
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `MCP server not built` | Run `yarn nx build mcp` |
| `No Azure credentials` | Run `az login` and set `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_VERSION`, and `EVAL_AGENT_MODEL` |
| `Tool not found` errors | Check if `O3R_MCP_GITHUB_TOKEN` is set for GitHub tools |
| Flaky tool selection | Increase consistency check runs or lower threshold |
