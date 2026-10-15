# Fix Audit Vulnerabilities

Fix critical audit vulnerabilities that are causing the audit CI job to fail, for a given **PR_NUMBER**.

You are a security fix agent for the Otter monorepo (Yarn 4 Berry + PnP, Nx). Fix critical audit vulnerabilities with the **minimum possible changes** — prefer upgrading direct dependencies over adding `resolutions`.

## Step 1 — Fetch the PR details

```
gh pr view PR_NUMBER --json baseRefName,headRefName,headSha,title
```

Note the `baseRefName` — you will branch from it and target it with the fix PR.

## Step 2 — Read the audit failure from CI

List the workflow runs on the PR to find the failed audit job:
```
gh run list --branch <headRefName> --workflow audit.yml --limit 5
```

Pick the most recent failed run and fetch its logs:
```
gh run view <run_id> --log-failed
```

Parse the log output to extract all **critical** vulnerabilities: package names, affected version ranges, and available fix versions. If no critical vulnerabilities are found, report that the audit is clean and stop.

## Step 3 — Check out the destination branch

Create the fix branch from `baseRefName` (not from the PR head):
```
git fetch origin <baseRefName>
git checkout -b fix/audit-<baseRefName> origin/<baseRefName>
```

## Step 4 — Understand the dependency tree

For every vulnerable package identified in Step 2, run:
```
yarn why <package>
```

This tells you which direct workspace dependency pulls it in. Fix at the source, in order of preference:

1. **Preferred:** Upgrade the direct dependency that pulls in the vulnerable transitive package. Update its version in the relevant `package.json` using the same version range constraint that was already there, then run `yarn up <direct-dep>@<safe-version>`.
2. **`resolutions`:** If no released version of the direct dependency ships a safe transitive version yet, force it via a `resolutions` entry in the **root** `package.json`:
   ```json
   "resolutions": {
     "<vulnerable-package>": "<safe-version>"
   }
   ```
   Then run `yarn install` to apply it.
3. **`packageExtensions` (last resort):** Only if the vulnerability stems from a missing or incorrect dependency declaration in the transitive package itself (e.g. an undeclared peer dependency pulling in an old version) and cannot be addressed with `resolutions`, add a `packageExtensions` entry in `.yarnrc.yml`:
   ```yaml
   packageExtensions:
     "<vulnerable-package>@*":
       dependencies:
         "<dep>": "<safe-version>"
   ```
   Then run `yarn install` to apply it.

Do **not** use a more invasive fix if a simpler one already covers it.

## Step 5 — Verify

```
yarn npm audit --environment all --all --recursive --json
```

Confirm no critical vulnerabilities remain. If some persist, repeat Step 4 for the remaining ones.

## Step 6 — Commit and open the fix PR

Follow [`.agents/git-workflow.md`](./git-workflow.md) for commit message format, branch naming rules, and PR creation instructions.

- Stage all changed files (`package.json`, `yarn.lock`, `.yarnrc.yml`, any workspace `package.json` files)
- Commit message: `fix(deps): resolve critical audit vulnerabilities in <package1>, <package2>, ...`
- Push `fix/audit-<baseRefName>` and open a PR targeting `<baseRefName>`
- PR title follows the same Conventional Commits format as the commit message
- PR body: follow the template in `.github/pull_request_template.md`, linking PR #PR_NUMBER under **Related issues**
