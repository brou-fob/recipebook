# GitHub Pages Setup

## Prerequisites

GitHub Pages must be enabled for this repository with the correct settings.

### Steps to Enable GitHub Pages

1. Go to **Repository Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Click **Save**

### Verify Setup

After enabling Pages:
- The "pages" environment should appear in Settings → Environments
- Deployments should succeed automatically on push to main

### Troubleshooting

**Error: "Failed to create deployment"**
- Ensure GitHub Pages source is set to "GitHub Actions" (not "Deploy from a branch")

**Error: "HttpError: Not Found"**
- Check that the repository has Pages enabled
- Verify the "github-pages" environment exists

**Error: "Creating Pages deployment failed"**
- Ensure workflow has `pages: write` and `id-token: write` permissions
- Check that there are no branch protection rules blocking the deployment

## Manual Deployment

If automatic deployment fails, you can manually trigger:

```bash
# Go to Actions tab → Deploy to GitHub Pages → Run workflow
```

## Alternative Solution

If GitHub Pages Actions do not work, use this alternative deployment method:

```yaml
- name: Deploy to GitHub Pages (Alternative)
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./build
```

This action does not require an environment and works with "Deploy from branch" (gh-pages).
