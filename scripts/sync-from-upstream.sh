#!/bin/bash

# Upstream-friendly sync script for AnalogJS JSR packages
# This script helps maintain your experimental JSR packages while staying in sync with upstream

set -e

UPSTREAM_REMOTE="upstream"
MAIN_BRANCH="main"
CURRENT_BRANCH=$(git branch --show-current)

echo "🔄 Syncing from upstream AnalogJS..."

# Check if upstream remote exists
if ! git remote get-url $UPSTREAM_REMOTE >/dev/null 2>&1; then
    echo "📡 Adding upstream remote..."
    git remote add $UPSTREAM_REMOTE https://github.com/analogjs/analog.git
fi

# Fetch latest from upstream
echo "📥 Fetching latest changes from upstream..."
git fetch $UPSTREAM_REMOTE

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes. Please commit or stash them first."
    echo "   Your JSR configs will be preserved during the sync."
    exit 1
fi

# Store current JSR configs
echo "💾 Backing up current JSR configurations..."
mkdir -p .jsr-backup
cp jsr.json .jsr-backup/ 2>/dev/null || true
cp packages/*/jsr.json .jsr-backup/ 2>/dev/null || true
cp scripts/publish.ts .jsr-backup/ 2>/dev/null || true
cp .github/workflows/publish-jsr.yml .jsr-backup/ 2>/dev/null || true

# Merge upstream changes
echo "🔀 Merging upstream changes..."
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]; then
    echo "⚠️  You're not on $MAIN_BRANCH branch. Consider switching first."
    echo "   Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

git merge $UPSTREAM_REMOTE/$MAIN_BRANCH

# Restore JSR configs
echo "🔧 Restoring JSR configurations..."
cp .jsr-backup/jsr.json . 2>/dev/null || true
cp .jsr-backup/packages-*/jsr.json packages/ 2>/dev/null || true
cp .jsr-backup/publish.ts scripts/ 2>/dev/null || true
cp .jsr-backup/publish-jsr.yml .github/workflows/ 2>/dev/null || true

# Clean up backup
rm -rf .jsr-backup

echo "✅ Sync complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Review changes: git diff HEAD~1"
echo "   2. Test your JSR setup: npm run jsr:dry-run"
echo "   3. Commit any additional changes needed"
echo ""
echo "🔗 Your @benpsnyder/analogjs-esm-* JSR scope configurations have been preserved."
