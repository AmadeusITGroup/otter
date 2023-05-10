# Yarn Audit action

## Pre-requisite
This task requires yarn2+ installed.

## Overview
This GitHub action runs the ```yarn npm audit``` with the given command parameters, and generates a markdown report out of the json result.
The action will fail and throw an error if it finds vulnerabilities of at least the specified input severity.

## Task options
See [Action specifications](action.yml) directly for more information about the supported parameters.

## Outputs
Two different reports :
* reportJSON : 'The report in JSON format'
* reportMarkdown : 'The report in MarkDown format'

## Usage example
```yaml
- name: Audit
  id: audit
  uses: AmadeusITGroup/otter/tools/github-actions/audit@8
  with:
    severity: critical
    allWorkspaces: true
    recursive: true
    environment: all
```
