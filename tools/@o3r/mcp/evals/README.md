# DeepEval Tests for @o3r/mcp

LLM-based evaluation tests for the Otter MCP server using [deepeval](https://docs.confident-ai.com/).

## Overview

Two levels of testing:

| Level | File | What it tests | LLM required? |
|-------|------|---------------|---------------|
| **1 — Tool Output Quality** | `test_tool_outputs.py` | Each MCP tool returns relevant, faithful, well-formatted content | Partially (some tests are deterministic) |
| **2 — Agent Tool Selection** | `test_agent_selection.py` | An LLM correctly selects the right MCP tool for user queries | Yes (as agent + judge) |

Tests are tagged with **pytest markers** so you can run them selectively:

| Marker | Meaning |
|--------|---------|
| `llm` | Requires an LLM API key (OpenAI or Anthropic) |
| _(no marker)_ | Deterministic — no API key needed |

## Prerequisites

1. **Build the MCP server** (tests spawn it as a subprocess):
   ```bash
   yarn nx build mcp
   ```

2. **Install Python dependencies**:
   ```bash
   cd tools/@o3r/mcp/evals
   pip install -r requirements.lock
   ```

3. **Configure LLM API key** (at least one):
   ```bash
   export OPENAI_API_KEY="sk-..."        # For OpenAI (default judge)
   # OR
   export ANTHROPIC_API_KEY="sk-ant-..." # For Anthropic
   export DEEPEVAL_MODEL="claude-3-5-sonnet"
   ```

4. **(Optional) GitHub token** for GitHub-dependent tool tests:
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
OPENAI_API_KEY=sk-... pytest -m llm -v
```

### All tests
```bash
OPENAI_API_KEY=sk-... pytest -v
```

### Level 1 only (tool output quality)
```bash
deepeval test run test_tool_outputs.py --verbose
```

### Level 2 only (agent tool selection)
```bash
deepeval test run test_agent_selection.py --verbose
```

### Via nx
```bash
yarn nx deepeval mcp
```

### Specific test
```bash
pytest test_tool_outputs.py::test_tool_output_relevancy[best_practices_relevance] -v
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `OPENAI_API_KEY` | — | OpenAI API key (used if `DEEPEVAL_MODEL` is not Anthropic) |
| `ANTHROPIC_API_KEY` | — | Anthropic API key |
| `DEEPEVAL_MODEL` | `gpt-4o` | Model used for evaluation judging |
| `O3R_MCP_GITHUB_TOKEN` | — | GitHub PAT for testing GitHub-dependent tools |
| `O3R_MCP_LOG_LEVEL` | `error` | MCP server log level during tests |

## Golden Scenarios

Test scenarios are defined in [`datasets/golden_scenarios.json`](datasets/golden_scenarios.json):

- **`tool_output_scenarios`**: Define expected tool outputs with quality criteria and expected topics
- **`agent_selection_scenarios`**: Define user queries with expected tool selections and arguments

Add new scenarios by appending to the appropriate array in the JSON file.

## Metrics Reference

### Level 1 Metrics
| Metric | Threshold | Purpose |
|--------|-----------|---------|
| `AnswerRelevancyMetric` | 0.6 | Is the tool output relevant to its purpose? |
| `GEval("Tool Output Quality")` | 0.6 | Does output meet custom quality criteria? |
| Keyword presence | exact | Are expected topics present in output? |
| Structure check | exact | Is output non-empty and ≥50 chars? |

### Level 2 Metrics
| Metric | Threshold | Purpose |
|--------|-----------|---------|
| `ToolCorrectnessMetric` | 0.7 | Did the LLM select the correct tool? |
| `GEval("Argument Correctness")` | 0.7 | Are tool arguments correct? |
| Consistency check | exact | Same tool selected across 3 runs? |
| Hallucination check | exact | No invented tool names? |

## CI Integration

Tests run in GitHub Actions via `.github/workflows/deepeval-tests.yml`, triggered from the main CI pipeline.

**Required GitHub Secrets:**
- `DEEPEVAL_LLM_API_KEY` — API key for the LLM judge
- `O3R_MCP_GITHUB_TOKEN` (optional) — For GitHub-dependent tool tests

## Cost Estimate

Each full test run makes ~20-30 LLM API calls (judge + agent). Approximate cost:
- **GPT-4o**: ~$0.10-0.30 per run
- **Claude 3.5 Sonnet**: ~$0.15-0.40 per run

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `MCP server not built` | Run `yarn nx build mcp` |
| `No LLM API key` | Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` |
| `Tool not found` errors | Check if `O3R_MCP_GITHUB_TOKEN` is set for GitHub tools |
| Flaky agent selection | Increase consistency check runs or lower threshold |
