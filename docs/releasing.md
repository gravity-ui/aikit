# Releasing AIKit 2 and 3

| Branch       | Stable npm tag | PR preview tag | Dependencies |
| ------------ | -------------- | -------------- | ------------ |
| `main`       | `latest`       | `beta-v3`      | UIKit 8      |
| `release/v2` | `v2`           | `beta-v2`      | UIKit 7      |

Versions and changelogs advance independently. A shared feature can ship as 3.1.0 and 2.29.0. Releases are not an atomic operation across branches.

## One-time setup

1. Apply the workflow changes to the current `main` (AIKit 3), not the old 2.28.0 checkout.
2. Create `release/v2` from `v2.28.0`. Copy the release infrastructure changes to it, including `scripts/release/check-major.cjs`. Keep its package manifests, changelog, source code and UIKit 7 dependencies. Do not merge `main` into this branch. On `main`, keep the UIKit matrix `[locked, '8.0.0']`; on `release/v2`, use `[locked]` to test its UIKit 7 lockfile. Keep the aggregate `Tests` job on both branches so branch protection uses the same check name.
3. Create the `backport-v2` label. Enable squash merging and GitHub's **Allow auto-merge** repository setting.
4. Protect both branches. Inspect active repository rulesets as well as classic branch protection; preserve existing review and merge-queue requirements. Require `Release Major`, `Verify Files`, `Tests`, `Visual Tests` and `Lint PR Title`, with checks against the latest base branch. Do not allow the automation app to bypass checks. Additional required human reviews will still require human approval; auto-merge does not bypass them.
5. Ensure the existing Gravity UI app has contents and pull request write permissions on this repository. Its installation token creates PRs so their CI workflows run.
6. Set repository variable `RELEASE_BOT_LOGIN` to the exact login of the app account that creates release-please PRs (including `[bot]` when present). The verified author of release PR #288 is `gravity-ui[bot]`; recheck the author if the app installation changes.
7. Verify that all five required check names have reported on a PR into each branch, including the aggregate `Tests` job. Only after branch protection is configured, set repository variable `RELEASE_AUTOMERGE` to `true`. Until then backport and release PRs require manual merging.
8. Test one compatible fix end to end. Verify that the backport checks run against UIKit 7 and that publishing 2.x leaves npm `latest` pointing to 3.x.

## Daily workflow

- Develop changes in a PR targeting `main`, using a conventional `feat:` or `fix:` title and squash merge.
- Add `backport-v2` when the change should also ship in AIKit 2. The label can be added before or after merging.
- After merging, release-please prepares the 3.x release PR. Backport automation separately creates a PR into `release/v2`, preserving the original title for version calculation.
- With auto-merge enabled, compatible backports and release PRs merge once required checks and reviews pass. Each branch then publishes its own release.
- Do not label release PRs for backport. Version bumps, changelogs, breaking changes and UIKit 8 migrations must not be copied to 2.x.

The privileged backport workflow checks out the trusted base branch and never installs dependencies or runs PR scripts. PR validation runs in normal pull request workflows.

## Conflicts and compatibility

A clean cherry-pick is not proof of UIKit 7 compatibility. Both branches must run build, type, unit and visual checks. Visual tests use the existing Playwright container workflow.

If cherry-picking fails, the backport workflow fails and the action reports the conflict on the original PR. Manually cherry-pick/adapt the change into a branch based on `release/v2` and open a normal PR with a conventional title. The 3.x release continues independently. Never resolve conflicts by copying the 3.x package manifest or lockfile over 2.x.

`Release Major` rejects prereleases, mismatched lockfile versions and unexpected majors. A breaking change intended for a new major needs an explicit update of the branch policy; it cannot silently turn `release/v2` into 3.x or `main` into 4.x.

## Operational notes

- The existing release action remains responsible for version calculation, changelog generation and publication. Only release PRs from the configured bot, with the expected branch prefix and release label, changing only manifests and changelog are eligible for automatic merging.
- Publishing runs are serialized per branch. A failure in one release line does not block the other.
- PR prereleases validate the base branch and stable package/lockfile versions before changing the version or publishing. Only PRs into `main` and `release/v2` publish previews. PR prereleases use separate `beta-v2` and `beta-v3` tags. Install the exact version from the PR for reproducible testing; each tag points to the most recently published preview in that release line.
- If npm publication fails after a GitHub release was created, inspect npm before retrying. The existing release action does not guarantee a retry will republish an already-created release. Publish the missing version from its exact release tag through the project's authorized recovery process; never bump merely to retry or republish an existing version.
- To pause automatic merging, set `RELEASE_AUTOMERGE` to `false`. This does not cancel already-enabled GitHub auto-merge requests; disable those on the affected PRs as well.
