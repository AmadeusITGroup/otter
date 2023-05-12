# Download build output action

## Overview
Download and restore the `dist` folders from GitHub artifact (check [Upload build output](../upload-build-output/readme.md))

## Task options
See [Action specifications](tools/github-actions/download-build-output/action.yml) directly for more information about the supported parameters.

## Usage example
```yaml
- name: Download Build Output
  id: download-build-output
  uses: AmadeusITGroup/otter/tools/github-actions/download-build-output@8
```
