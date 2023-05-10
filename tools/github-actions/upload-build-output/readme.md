# Upload build output action

## Overview

Upload a GitHub artifact packaged as a single zip file, containing all `dist` folders inside the current working repository.
It uses upload-artifact GitHub action for the upload.
You can then use the download build output action for the download (check [Download build output](../download-build-output/readme.md))

## Task options

See [Action specifications](tools/github-actions/upload-build-output/action.yml) directly for more information about the supported parameters.

## Usage example

```yaml
- name: Upload Build Output
  id: upload-build-output
  uses: AmadeusITGroup/otter/tools/github-actions/upload-build-output@8
```
