# Pages

Token used for the initial push lacked `workflow` scope, so Actions deploy is not in the first commit.

**Current:** `gh-pages` branch (built `dist/`).

To switch to Actions later: add `.github/workflows/pages.yml` (see listing plan), set Pages → Source → GitHub Actions, grant the OAuth app `workflow` scope or use a PAT with `workflow`.
