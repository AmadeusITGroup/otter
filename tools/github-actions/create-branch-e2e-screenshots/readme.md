# Create branch e2e screenshots

## Overview
Create a branch with the updated e2e screenshots and comment the PR to let the developer know that the updated e2e screenshots could be cherry-picked into their branch.

## Pre-requisites

### Trigger event

The trigger event of this action must be [`pull_request`](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#pull_request).

> [WARNING]
> This action will not work for pull request opened from a fork.

### Permissions

This action requires the following permissions to work correctly.

```yml
permissions:
  contents: write # Needed to create a commit
  issues: write # Needed to add a comment to a pull request
  pull-requests: write # Needed to add a comment to a pull request
```

### Playwright @o3r/testing/visual-testing-reporter

Usage of [`@o3r/testing/visual-testing-reporter`](https://github.com/AmadeusITGroup/otter/blob/main/docs/testing/VISUAL_TESTING_REPORTER.md) is mandatory to have this action working.

## Task options
See [Action specifications](./action.yml) directly for more information about the supported parameters.

## Usage example
```yaml
- uses: AmadeusITGroup/otter/tools/github-actions/create-branch-e2e-screenshots@main
  # To work correctly this action must be run only on pull_request trigger and not coming from a fork
  if: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.repo.full_name == github.event.pull_request.base.repo.full_name }}
  with:
    screenshotsPattern: apps/showcase/e2e-playwright/sanity/screenshots/**
```
