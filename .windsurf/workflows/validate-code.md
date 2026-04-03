---
description: Workflow to prepare and validate code
auto_execution_mode: 1
---

# Commands to run

// turbo
1. **Install dependencies**
   - Run dependency installation from the repo root: `yarn install`

// turbo
2. **Run full build, lint, and tests**
   - Run the full build, lint, and tests (in parallel):
     - `yarn build`
     - `yarn lint:affected`
     - `yarn test:affected`
