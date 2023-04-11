# Get npm tag action
## Overview
This GitHub action retrieves the npm tag to apply for a release

## Task options
See [Action specifications](action.yml) directly for more information about the supported parameters.

## Outputs
The action returns the npm tag that needs to be applied for the npm publish.

## Usage example
```yaml
- name: Get tag name
  id: get-npm-tag
  uses: AmadeusITGroup/otter/tools/github-actions/get-npm-tag@8
  with:
    is-prerelease: ${{ inputs.prerelease || (github.event.release && github.event.release.prerelease) }}
    version: ${{ steps.get-version.outputs.version }}
```
