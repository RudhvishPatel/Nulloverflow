# PR Approval Workflow Guide

This document explains how the PR approval workflow works and how to set it up in your GitHub environment.

## Overview

The PR approval workflow provides a manual approval process for pull requests from the `development` branch to `main`. Instead of direct merges, PRs create an approval issue where authorized users must comment to approve or reject the merge.

## How It Works

### 1. PR Created from Development to Main
When a pull request is opened from `development` targeting `main`:
- An **approval issue** is automatically created
- The issue contains PR details (number, title, author, description)
- The PR author receives a comment explaining the approval process
- The issue is assigned to authorized approvers
- A **5-minute waiting job** starts polling for approval

### 2. Approval Process
To approve a PR, an authorized user comments on the **approval issue** (not the PR).

#### Approval Keywords (case-insensitive)
| Keyword | Description |
|---------|-------------|
| `approved` | Standard approval |
| `approve` | Standard approval |
| `yes` | Quick approval |
| `confirm` | Confirmation approval |

#### Rejection Keywords (case-insensitive)
| Keyword | Description |
|---------|-------------|
| `rejected` | Standard rejection |
| `reject` | Standard rejection |
| `no` | Quick rejection |
| `deny` | Deny the PR |

### 3. Waiting Job (5 minutes)
When a PR is created:
- A job runs for **5 minutes**, checking every 30 seconds for approval
- If approved within 5 minutes → PR is automatically merged
- If rejected within 5 minutes → PR is marked as rejected
- If timeout → PR remains open, can still be approved via issue comment later

### 4. Automatic Actions
Upon approval:
- PR is automatically merged into `main`
- Approval issue is closed
- Success comment is added to the issue
- Email notification is sent (if configured)

Upon rejection:
- Comment is added to the PR explaining rejection
- Issue remains open for further discussion

## GitHub Setup

### Step 1: Create Required Labels
Create these labels in your repository (Settings > Labels):

| Label | Description | Suggested Color |
|-------|-------------|-----------------|
| `approval-required` | PR needs manual approval | `#d93f0b` (red) |
| `pr-review` | PR review related | `#0075ca` (blue) |

### Step 2: Repository Permissions
Ensure the workflow has proper permissions. In your repository:
1. Go to **Settings** > **Actions** > **General**
2. Under "Workflow permissions", select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**

### Step 3: Configure Email Notifications (Optional)
To enable email notifications on merge, add these secrets in **Settings** > **Secrets and variables** > **Actions**:

| Secret | Description |
|--------|-------------|
| `SMTP_SERVER` | Your SMTP server address (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g., `587` for TLS) |
| `SMTP_USERNAME` | SMTP authentication username |
| `SMTP_PASSWORD` | SMTP authentication password or app password |
| `SENDER_EMAIL` | Email address to send from |
| `RECIPIENT_EMAIL` | Email address to receive notifications |

### Step 4: Create Environment (For Email)
If using email notifications:
1. Go to **Settings** > **Environments**
2. Create an environment named `prod`
3. Add the SMTP secrets to this environment

## Authorized Approvers

Currently, the following users can approve PRs:
- **@dhrupeshbrahmbhatt**

To add more approvers, edit the workflow file at `.github/workflows/pr-approval.yml`:
1. Update `AUTHORIZED_USERS` variable (space-separated list)
2. Update the issue body text listing approvers
3. Update the `--assignee` flag in the issue creation step

## Workflow Triggers

The workflow runs on:
- `pull_request` events: `opened`, `synchronize`, `reopened` from `development` to `main`
- `issue_comment` events: `created` (to detect approval comments)

**Note:** This workflow ONLY triggers for PRs from `development` branch to `main`. PRs from other branches will not create approval issues.

## File Location

The workflow file is located at:
```
.github/workflows/pr-approval.yml
```

## Example Workflow

1. Create a PR from `development` to `main`
2. Workflow automatically creates an approval issue
3. **Option A (Quick):** Comment `approved`, `yes`, or `confirm` within 5 minutes → Auto-merged
4. **Option B (Later):** After 5 minutes, comment on the issue → Triggers merge workflow

## Jobs Overview

| Job | Trigger | Purpose |
|-----|---------|---------|
| `create-approval-issue` | PR opened | Creates the approval issue |
| `wait-for-approval` | PR opened | Polls for 5 min waiting for approval |
| `check-approval` | Issue comment | Checks if comment is an approval |
| `merge-pr` | Approval detected | Merges the PR |
| `handle-rejection` | Rejection detected | Handles PR rejection |
| `send-merge-email` | After merge | Sends email notification |

## Troubleshooting

### Issue not created
- Ensure the PR is from `development` branch to `main`
- Check that the workflow has write permissions
- Verify labels exist in the repository

### Approval not working
- Comment must be exactly: `approved`, `approve`, `yes`, or `confirm` (case-insensitive)
- Comment must be on the **approval issue**, not the PR
- Commenter must be `dhrupeshbrahmbhatt`

### Jobs getting skipped
- The `wait-for-approval` job only runs for PRs from `development` to `main`
- Other jobs depend on specific conditions being met

### Email not sending
- Verify all SMTP secrets are configured correctly
- Check that the `prod` environment exists
- For Gmail, use an App Password instead of your regular password

## Security Notes

- Only authorized users can trigger merges
- Unauthorized approval attempts are logged and commented
- The workflow uses `GITHUB_TOKEN` which is automatically provided by GitHub Actions
- Only PRs from `development` to `main` trigger the approval workflow
