---
description: Workflow to commit and push a branch for a pull request
---

1. **Validate code**
   - Run `/validate-code` workflow
   - If any command fails with blocking errors: suggest fixes without modifying code, then **STOP**
   - Skipped steps are not blocking

2. **Validate branch**
   - Run: `git branch --show-current`
   - If on `main` or `release/*`: suggest a new branch name (`feat/`, `fix/`, or `chore/`) and present command: `git switch -c <branch-name>`
   - If user chooses to remain on `main` or `release/*` after the suggestion:
     - Log: "⚠️ Workflow stopped: Cannot commit or push directly to protected branch `<branch-name>`. Please create a new branch to continue."
     - **STOP** - workflow cannot continue on protected branches
   - Otherwise, continue

3. **Determine commit strategy**
   - Run these commands to gather context:
     ```
     git log -1 --oneline
     git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null || echo "No upstream"
     git branch -r --contains HEAD 2>/dev/null
     git status --short
     ```
   - **Amend** if:
     - Current commit is NOT on the upstream branch, OR
     - Staged files overlap with files modified in the previous commit and appear to be related changes
   - **New commit** if:
     - Current commit already exists on upstream, OR
     - No prior commit exists, OR
     - Changes are unrelated to the previous commit
   - Announce decision clearly with reasoning
   - **DO NOT** create the commit yet - only decide the strategy

4. **Stage files**
   - Show current status: `git status --short`
   - Propose a `git add` command with the files to stage (user can approve or modify)

5. **Create commit**
   - Based on the strategy determined in step 3:
     - If **amend**: `git commit --amend --no-edit` (or with new message if needed)
     - If **new commit**: Create a concise conventional commit message following commitlint.config.cts:
       - Format: `[type]: concise description`
       - Types: `fix`, `feat`, `docs`, `chore`, etc.
       - Example: `feat(tools): add Windsurf workflows`
       - Run: `git commit -m "<message>"`

6. **Push to remote**
   - Based on the commit strategy from step 3:
     - If **amended commit**: `git push --force-with-lease`
     - If **new commit**:
       - First push (no upstream): `git push -u origin $(git branch --show-current)`
       - Subsequent pushes: `git push`