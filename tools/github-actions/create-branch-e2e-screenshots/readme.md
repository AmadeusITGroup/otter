# Create branch e2e screenshots

## Overview
Create a branch with the updated e2e screenshots and comment the PR to let the developer knows that the updated e2e screenshots could be cherry-picked into his branch.

## Task options
See [Action specifications](./action.yml) directly for more information about the supported parameters.

## Usage example
```yaml
- uses: AmadeusITGroup/otter/tools/github-actions/create-branch-e2e-screenshots@main
  with:
    reportPath: apps/showcase/playwright-reports/visual-testing/report.json
    screenshotsPattern: apps/showcase/e2e-playwright/sanity/screenshots/**
```
