---
description: Workflow to prepare, validate, and push a branch for a pull request
auto_execution_mode: 1
---

1. **Choose or create your working branch**
   - Check the current branch:
     - `git status`
   - If already on an appropriate feature/bugfix/chore branch, keep it.
   - Otherwise, create and switch to a new branch with a sensible name derived from the change (for example: `feat/<short-topic>`, `fix/<bug-topic>`, `chore/<area>`):
     - `git switch -c <branch-name>`

2. **Optionally sync with remote and rebase**
   - If the branch is intended to be based on the latest `origin/main` (or another release branch), update refs and rebase before committing:
     - `git fetch origin`
     - `git rebase origin/main` (or another appropriate remote branch such as `origin/release/x.y`)

3. **Install dependencies if needed**
   - If dependencies may be outdated (new pull, lockfile changes, new packages), run:
     - `yarn install`

4. **Run full build (first)**
   - Always start by running the main build (which may also produce JARs/OpenAPI artifacts depending on environment):
     - `yarn build`

5. **Run full lint (after a successful build)**
   - Once `yarn build` succeeds, run a full lint:
     - `yarn lint`

6. **Run full tests (after build and lint)**
   - After build and lint are both successful, run the complete test suite (unit/integration as configured):
     - `yarn test`

7. **Check for issues reported by build/lint/tests**
   - Inspect the outputs from `yarn build`, `yarn lint`, and `yarn test`.
   - If any of these commands fail or report blocking errors, **stop the workflow here**:
     - Do **not** proceed to staging, committing, or pushing.
     - Fix the issues outside this workflow (update code, configs, etc.).
     - Once all three commands succeed, you may re-run this workflow from the beginning.

8. **Select which files to stage**
   - List modified/added files:
     - `git status`
   - Determine which changes belong to this commit (and exclude any unrelated local work).
   - Stage only the relevant files, for example:
     - `git add path/to/file1 path/to/file2`
   - If everything changed is relevant and tracked, you can stage them all:
     - `git add -u`

9. **Enter and validate the commit message**
    - Compose a commit message that follows the repository guidelines (from `CONTRIBUTING.md`):
      - Bugfix: include `fix`, `fixes`, `bugfix`, or `bugfixes` at the start, e.g.
        - `[fix]: this is a commit message for a fix`
      - Feature: include `feat`, `feature`, or `features`, e.g.
        - `[feat]: this is a commit message for a feature`
      - Documentation: contain `doc`, `docs`, or `documentation`.
      - Breaking change: contain `breaking`, `breaking change`, `breaking changes`, `breaking-change`, or `breaking-changes`.
    - Ensure the message clearly summarizes the changes being staged.
    - Create the commit (using a validated message):
      - `git commit -m "<validated-message>"`
      - or: `git commit` and enter the validated message in the editor.
    - Husky and lint-staged hooks will run automatically and may reject invalid commits; if that happens, fix the reported issues, re-stage as needed, and repeat the commit.

10. **Push your branch to GitHub**
    1. For the first push of this branch, set upstream:
       - `git push -u origin <branch-name>`
    2. For subsequent updates:
       - `git push`


