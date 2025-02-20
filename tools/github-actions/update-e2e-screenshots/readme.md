# Update e2e screenshots

## Overview

GitHub Action for updating e2e screenshots.

> [!WARNING]
> Works with `@o3r/testing/visual-testing-reporter`
> Follow the link for [documentation](TODO)

## Task options

See [Action specifications](./action.yml) directly for more information about the supported parameters.

## Usage example

```yaml
- uses: AmadeusITGroup/otter/tools/github-actions/update-e2e-screenshots
  with:
    reportPath: apps/showcase/playwright-reports/visual-testing/report.json
```
