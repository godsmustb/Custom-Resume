# Deployment Guide - Hostinger FTP

This document explains how to deploy the Custom-Resume application to Hostinger using GitHub Actions and FTP.

## Overview

The deployment process is automated via GitHub Actions and triggers automatically when:
- You push to the `main` branch
- You push to any `claude/*` branch (for testing)
- You manually trigger the workflow from GitHub UI

## Prerequisites

1. **Hostinger Account** with FTP access
2. **GitHub Repository** with Actions enabled
3. **OpenAI API Key** for the application's AI features

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### Navigation to Secrets:
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret below

### Required Secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `HOSTINGER_FTP_SERVER` | Your Hostinger FTP server hostname | `ftp.yourdomain.com` or `123.456.789.10` |
| `HOSTINGER_FTP_USERNAME` | Your FTP username from Hostinger | `u123456789` |
| `HOSTINGER_FTP_PASSWORD` | Your FTP password from Hostinger | `YourSecurePassword123!` |
| `VITE_OPENAI_API_KEY` | Your OpenAI API key (starts with `sk-`) | `sk-proj-abc123...` |

### How to Get Hostinger FTP Credentials:

1. Log in to your **Hostinger control panel** (hPanel)
2. Go to **Files** → **FTP Accounts**
3. Find your FTP account or create a new one
4. Note down:
   - **FTP Server/Hostname** (e.g., `ftp.yourdomain.com`)
   - **Username** (usually starts with `u` followed by numbers)
   - **Password** (you set this when creating the account)
5. **Important**: Make sure the FTP account has write permissions to `/public_html/`

### How to Get OpenAI API Key:

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to **API keys** section
3. Create a new API key or use an existing one
4. Copy the key (starts with `sk-proj-` or `sk-`)

## Deployment Process

### Automatic Deployment (Recommended)

Once secrets are configured, deployment happens automatically:

1. **Make changes** to your code
2. **Commit** your changes:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
3. **Push to main** branch:
   ```bash
   git push origin main
   ```
   OR push to a claude branch for testing:
   ```bash
   git push origin claude/your-branch-name
   ```

4. **Monitor deployment**:
   - Go to your GitHub repository
   - Click **Actions** tab
   - Watch the "Deploy to Hostinger" workflow run
   - Check each step for success/failure

### Manual Deployment

You can also trigger deployment manually:

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **Deploy to Hostinger** workflow
4. Click **Run workflow** button
5. Select the branch to deploy
6. Click **Run workflow**

## Workflow Steps

The deployment workflow performs these steps:

1. **Checkout**: Pulls the latest code from your repository
2. **Setup Node.js**: Installs Node.js 18 with npm caching
3. **Install Dependencies**: Runs `npm ci` to install packages
4. **Build Application**: Runs `npm run build` with the OpenAI API key
5. **Verify Build**: Checks that the `dist/` folder was created correctly
6. **Deploy to FTP**: Uploads the `dist/` folder contents to Hostinger's `/public_html/` directory

## Build Output

The build process creates a `dist/` folder containing:
- `index.html` - Main HTML file
- `assets/` - JavaScript, CSS, and image files
- Other static files

This entire folder is uploaded to your Hostinger server.

## Deployment Configuration

### Server Directory

The workflow deploys to `/public_html/` on your Hostinger server. This is the default public web root for most Hostinger accounts.

**If your setup is different**, you may need to adjust the `server-dir` in `.github/workflows/deploy-hostinger.yml`:

```yaml
server-dir: /public_html/  # Change this if needed
```

Common alternatives:
- `/domains/yourdomain.com/public_html/`
- `/public_html/subdirectory/`
- `/htdocs/`

### Clean Slate Deployment

The workflow uses `dangerous-clean-slate: true`, which means:
- ✅ Old files are removed before new deployment
- ✅ Ensures clean state with no leftover files
- ⚠️ **Warning**: Any files on the server not in your `dist/` folder will be deleted

If you need to preserve certain files on the server, add them to the `exclude` list in the workflow file.

## Troubleshooting

### Build Fails

**Error**: `npm ci` fails with dependency errors
- **Solution**: Run `npm install` locally to update `package-lock.json`, then commit and push

**Error**: Build fails with "VITE_OPENAI_API_KEY is not defined"
- **Solution**: Make sure you've added the `VITE_OPENAI_API_KEY` secret in GitHub

### FTP Deployment Fails

**Error**: "Could not connect to FTP server"
- **Solution**: Verify your `HOSTINGER_FTP_SERVER` is correct (check Hostinger hPanel)

**Error**: "Authentication failed"
- **Solution**: Double-check `HOSTINGER_FTP_USERNAME` and `HOSTINGER_FTP_PASSWORD` secrets

**Error**: "Permission denied" when uploading
- **Solution**: Ensure your FTP account has write permissions to `/public_html/`

### Website Not Updating

**Possible causes**:
1. **Browser cache**: Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. **Hostinger cache**: Wait a few minutes or clear cache in hPanel
3. **Wrong directory**: Check that `server-dir` matches your Hostinger setup
4. **Build didn't run**: Check the GitHub Actions logs

## Testing on Claude Branches

To test deployments before merging to main:

1. Create a branch starting with `claude/`:
   ```bash
   git checkout -b claude/test-deployment
   ```

2. Make your changes and push:
   ```bash
   git push origin claude/test-deployment
   ```

3. The deployment will run automatically
4. Verify the changes on your Hostinger site
5. If everything works, merge to main:
   ```bash
   git checkout main
   git merge claude/test-deployment
   git push origin main
   ```

## Monitoring and Logs

### GitHub Actions Logs

View detailed logs:
1. Go to **Actions** tab in your repository
2. Click on a workflow run
3. Click on **build-and-deploy** job
4. Expand any step to see detailed logs

### Key Log Sections

- **Install dependencies**: Check for npm errors
- **Build application**: Check for build errors
- **Verify build output**: Confirms `dist/` folder contents
- **Deploy to Hostinger via FTP**: Shows FTP upload progress (verbose mode enabled)

## Security Notes

- ⚠️ **Never commit secrets** to your repository
- ⚠️ The OpenAI API key is **baked into the JavaScript bundle** during build
- ⚠️ This means the API key is **visible in the browser** to end users
- ✅ For production use, consider implementing a backend proxy for API calls
- ✅ Use environment-specific API keys (separate keys for dev/prod)

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SamKirkland/FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- [Hostinger FTP Guide](https://support.hostinger.com/en/articles/1583237-how-to-upload-files-using-ftp)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## Support

If you encounter issues:
1. Check the **GitHub Actions logs** for error messages
2. Verify all **secrets are configured correctly**
3. Test **FTP credentials manually** using an FTP client like FileZilla
4. Ensure your **Hostinger account is active** and has sufficient resources

---

**Last Updated**: 2025-11-18
