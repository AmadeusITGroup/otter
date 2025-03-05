# Yarn errors reporter action

## Overview
Add an annotation in case of errors found during yarn install.

> [!NOTE]
> If the repository is checked out with a fetch-depth greater than 1 and the pull request didn't 
> affect the `yarn.lock` file, the action will not add the annotation.
> You can force the report by passing `onlyReportsIfAffected` options to `false`.

## Usage example
```yaml
- name: Report yarn install errors
  uses: AmadeusITGroup/otter/tools/github-actions/yarn-errors-reporter@12.1
  with:
    reportOnFile: yarn.lock
    # See https://yarnpkg.com/advanced/error-codes
    errorCodesToReport: YN0002,YN0059,YN0060
```
