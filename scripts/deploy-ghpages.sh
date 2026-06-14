#!/usr/bin/env bash
# Publish the production build to the `gh-pages` branch.
#
# GitHub Pages is configured as "Deploy from a branch → gh-pages /(root)", so the
# built-in "pages build and deployment" workflow serves whatever lands here. This
# is the active deploy path (the Actions workflow in .github/workflows/deploy.yml
# needs repo Actions permissions that aren't enabled).
#
# Usage:  scripts/deploy-ghpages.sh "optional commit message"
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WT="$(mktemp -d)"
MSG="${1:-update}"

cd "$ROOT"
npm run build
touch dist/.nojekyll

git worktree add "$WT" gh-pages
cd "$WT"
git rm -rf . >/dev/null 2>&1 || true
cp -r "$ROOT/dist/." .
touch .nojekyll
git add -A
if git commit -q -m "Deploy: $MSG"; then
  git push origin gh-pages
  echo "Deployed to gh-pages: $MSG"
else
  echo "No changes to deploy."
fi

cd "$ROOT"
git worktree remove --force "$WT"
git worktree prune
