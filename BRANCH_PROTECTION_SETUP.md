# Branch Protection Setup Instructions

## Overview
Now that we have a CI workflow and CODEOWNERS file in place, we need to protect the main branch to enforce code review and quality checks.

## Setup Steps

### 1. Navigate to Branch Protection Settings
1. Go to: https://github.com/gadierrrr/landingPagePRTD/settings/branches
2. Click "Add rule" or "Add branch protection rule"

### 2. Configure the Protection Rule

**Branch name pattern:** `main`

**Protect matching branches - Enable these settings:**

✅ **Require a pull request before merging**
- ✅ Require approvals: **1**
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from code owners (this uses our CODEOWNERS file)

✅ **Require status checks to pass before merging**
- ✅ Require branches to be up to date before merging
- ✅ Status checks to require: **CI Pipeline** (from our .github/workflows/ci.yml)

✅ **Require conversation resolution before merging**

✅ **Require signed commits** (optional but recommended for security)

✅ **Require linear history** (prevents merge commits, keeps history clean)

✅ **Do not allow bypassing the above settings**
- ✅ Restrict pushes that create files larger than 100MB

**Branch protection rule enforcement:**
- ✅ Apply to administrators (ensures even repo admins follow the rules)

### 3. Additional Repository Settings

#### Auto-delete head branches
1. Go to: https://github.com/gadierrrr/landingPagePRTD/settings/general
2. Scroll down to "Pull Requests" section
3. ✅ Enable "Automatically delete head branches"

#### Merge button options
In the same "Pull Requests" section:
- ✅ Allow merge commits: **Disabled**
- ✅ Allow squash merging: **Enabled** (recommended)
- ✅ Allow rebase merging: **Enabled** (optional)

## Verification

After setup, verify the protection is working:

1. Try to push directly to main - it should be blocked
2. Create a test branch: `git checkout -b test-protection`
3. Make a small change and push
4. Create a PR - it should require approval and CI to pass
5. Merge the PR - it should auto-delete the branch

## Expected Workflow After Setup

```
Developer workflow:
1. git checkout -b feature/new-feature
2. # Make changes
3. git commit -m "feat: add new feature"
4. git push origin feature/new-feature
5. # Create PR via GitHub UI
6. # Wait for CI to pass ✅
7. # Request review from code owners
8. # After approval, squash and merge
9. # Branch auto-deleted ✅
```

## Troubleshooting

**CI check not appearing?**
- Make sure the workflow ran at least once after pushing
- Check Actions tab for any workflow failures
- Ensure the job name "CI Pipeline" matches exactly

**Can't find status check?**
- The status check won't appear until the workflow has run
- Push a test commit to trigger the workflow first

**Still able to push to main?**
- Double-check "Do not allow bypassing the above settings" is enabled
- Ensure you're not an admin bypassing rules

## Next Steps After Setup

1. ✅ Test the protection by creating a test PR
2. ✅ Verify CI runs and blocks merge if tests fail
3. ✅ Confirm CODEOWNERS requires review
4. ✅ Set up any additional required status checks as needed

## Security Benefits

This setup provides:
- 🛡️ **No direct pushes to main** - all changes via reviewed PRs
- 🛡️ **Automated quality gates** - linting, tests, build must pass
- 🛡️ **Code review requirements** - at least 1 approval required
- 🛡️ **Clean history** - linear history with meaningful commits
- 🛡️ **Auto-cleanup** - merged branches deleted automatically