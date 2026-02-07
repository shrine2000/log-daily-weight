# GitHub Pages Setup Guide

Follow these steps to host your Weight Loss Tracker app on GitHub Pages.

## Step 1: Initialize Git Repository

Open your terminal in the project directory and run:

```bash
git init
git add .
git commit -m "Initial commit: Weight Loss Tracker app"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Name your repository (e.g., `weight-loss-tracker`)
5. Choose **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

## Step 3: Connect and Push to GitHub

GitHub will show you commands. Run these in your terminal:

```bash
# Add your GitHub repository as remote (replace USERNAME and REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/johndoe/weight-loss-tracker.git
git branch -M main
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **"Settings"** tab (top menu)
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
5. Click **"Save"**

## Step 5: Access Your Site

GitHub will provide you with a URL like:
```
https://USERNAME.github.io/REPO_NAME/
```

**Note:** It may take a few minutes for the site to be available after enabling Pages.

## Step 6: Update Your Site

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Your site will automatically update within a few minutes.

## Troubleshooting

### If your site shows a 404 error:
- Wait 5-10 minutes after enabling Pages
- Check that your `index.html` is in the root directory
- Verify the branch is set to `main` in Pages settings

### If styles or scripts don't load:
- Ensure all file paths are relative (they already are: `css/styles.css`, `js/app.js`)
- Check browser console for any 404 errors
- Clear your browser cache

### Custom Domain (Optional):
- In Pages settings, you can add a custom domain
- Follow GitHub's instructions for DNS configuration

## Your App is Now Live! 🎉

Your weight loss tracker will be accessible at:
`https://USERNAME.github.io/REPO_NAME/`

