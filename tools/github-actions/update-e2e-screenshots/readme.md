# Update e2e screenshots

## Overview
Updated the e2e screenshots based on the report from `@o3r/testing/visual-testing-reporter`.

## Pre-requisites

### Playwright @o3r/testing/visual-testing-reporter

Usage of [`@o3r/testing/visual-testing-reporter`](https://github.com/AmadeusITGroup/otter/blob/main/docs/testing/VISUAL_TESTING_REPORTER.md) is mandatory to have this action working.

## Task options
See [Action specifications](./action.yml) directly for more information about the supported parameters.

## Usage example
```yaml
- uses: AmadeusITGroup/otter/tools/github-actions/update-e2e-screenshots@main
  with:
    visualTestingReportPath: apps/showcase/playwright-reports/visual-testing/report.json
```

## Multiple reports

You can specify several `visualTestingReportPath` :


```yaml
- uses: AmadeusITGroup/otter/tools/github-actions/update-e2e-screenshots@main
  with:
    visualTestingReportPath: |
      apps/showcase/playwright-reports/visual-testing/report.json
      apps/example/playwright-reports/visual-testing/report.json
```
