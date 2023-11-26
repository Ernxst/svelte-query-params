# Contributor Manual

We welcome contributions of any size and skill level. As an open source project, we believe in giving back to our contributors and are happy to help with guidance on PRs, technical writing, and turning any feature idea into a reality.

> **Tip for new contributors:**
> Take a look at [https://github.com/firstcontributions/first-contributions](https://github.com/firstcontributions/first-contributions) for helpful information on contributing

Before submitting your contribution
though, please make sure to take a moment and read through the following guidelines.

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#quick-guide)
- [Project Structure](#project-structure)

## Issue Reporting Guidelines

- The issue list of this repo is **exclusively** for bug reports and feature requests. Non-conforming issues will be
  closed immediately.

- Try to search for your issue, it may have already been answered or even fixed in the development branch (`dev`).

- Check if the issue is reproducible with the latest stable version. If you are using a pre-release, please indicate the
  specific version you are using.

- It is **required** that you clearly describe the steps necessary to reproduce the issue you are running into. Although
  we would love to help our users as much as possible, diagnosing issues without clear reproduction steps is extremely
  time-consuming and simply not sustainable.

- Use only the minimum amount of code necessary to reproduce the unexpected behaviour. A good bug report should isolate
  specific methods that exhibit unexpected behaviour and precisely define how expectations were violated. What did you
  expect the method or methods to do, and how did the observed behaviour differ? The more precisely you isolate the
  issue, the faster we can investigate.

- Issues with no clear repro steps will not be triaged. If an issue labelled "need repro" receives no further input from
  the issue author for more than 5 days, it will be closed.

- If your issue is resolved but still open, don’t hesitate to close it. In case you found a solution by yourself, it
  could be helpful to explain how you fixed it.

- Most importantly, we beg your patience: the team must balance your request against many other responsibilities —
  fixing other bugs, answering other questions, new features, new documentation, etc. The issue list is not paid
  support, and we cannot make guarantees about how fast your issue can be resolved.

## Pull Request Guidelines

- The `main` branch is basically just a snapshot of the latest stable release. All development should be done in
  dedicated branches. **Do not submit PRs against the `main` branch.**

- Checkout a topic branch from the relevant branch, e.g. `dev`, and merge back against that branch.

- **DO NOT** check in `dist` in the commits.

- It's OK to have multiple small commits as you work on the PR - we will let GitHub automatically squash it before
  merging.

- If adding new feature:

  - Provide convincing reason to add this feature. Ideally you should open a suggestion issue first and have it
    green-lit before working on it.

- If fixing a bug:
  - If you are resolving a special issue, add `(fix: #xxxx[,#xxx])` (#xxxx is the issue id) in your PR title for a
    better release log, e.g. `fix: update entities encoding/decoding (fix #3899)`.
  - Provide detailed description of the bug in the PR. Live demo preferred.

## Quick Guide

### Prerequisite

```shell
node: ">= 18.12.0"
bun: "^1.0.6"
# otherwise, your build will fail
```

### Setting up your local repo

```shell
git clone && cd ...
bun install --y
bun run build
```

### Development

```shell
# starts a file-watching, live-reloading dev script for active development
bun run dev
# build the entire project, one time.
bun run build
```

### Running tests

```shell
# run this in the top-level project root to run all tests
bun run test
# run only a few tests, great for working on a single feature
bun run test "$STRING_MATCH"
```

### Other useful commands

```shell
# auto-format the entire project
# (optional - a GitHub Action formats every commit after a PR is merged)
bun run format
```

```shell
# lint the project
# (optional - our linter creates helpful warnings, but not errors.)
bun run lint
```

### Making a Pull Request

When making a pull request, be sure to add a changeset when something has changed.

```shell
bunx changeset
```

## Project Structure

This project has a simple structure,

<!-- TODO: Code structure  -->

## Releases

_Note: Only [core maintainers (L3+)](https://github.com/Ernxst/svelte-query-params/blob/main/GOVERNANCE.md#level-3-l3---core-maintainer) can release new versions of `svelte-query-params`._

The repo is set up with automatic releases, using the changeset GitHub action & bot.

To release a new version of `svelte-query-params`, find the `Version Packages` PR, read it over, and merge it.

### Releasing PR preview snapshots

Our release tool `changeset` has a feature for releasing "snapshot" releases from a PR or custom branch. These are npm package publishes that live temporarily, so that you can give users a way to test a PR before merging. This can be a great way to get early user feedback while still in the PR review process.

To release a snapshot, run the following locally:

```shell
# Note: XXX should be a keyword to identify this release. Ex: `--snapshot routing` & `--tag next--routing`

# 1:
bunx changeset version --snapshot XXX
# 2: (Manual) review the diff, and make sure that you're not releasing more than you need to.
git checkout -- examples/
# 3:
bun run release --tag next--XXX
# 4: (Manual) review the publish, and if you're happy then you can throw out all local changes
git reset --hard
```

Full documentation: <https://github.com/atlassian/changesets/blob/main/docs/snapshot-releases.md>

### Releasing `svelte-query-params@next` (aka "prerelease mode")

Sometimes, the repo will enter into "prerelease mode". In prerelease mode, our normal release process will publish npm versions under the `next` dist-tag, instead of the default `latest` tag. We do this from time-to-time to test large features before sharing them with the larger audience.

While in prerelease mode, follow the normal release process to release `svelte-query-params@next` instead of `svelte-query-params@latest`. To release `svelte-query-params@latest` instead, see [Releasing `svelte-query-params@latest` while in prerelease mode](#releasing-svelte-query-paramslatest-while-in-prerelease-mode).

Full documentation: <https://github.com/atlassian/changesets/blob/main/docs/prereleases.md>

### Entering prerelease mode

If you have gotten permission from the core contributors, you can enter into prerelease mode by following the following steps:

- Run: `bunx changeset pre enter next` in the project root
- Create a new PR from the changes created by this command
- Review, approve, and more the PR to enter prerelease mode.
- If successful, The "Version Packages" PR (if one exists) will now say "Version Packages (next)".

### Exiting prerelease mode

Exiting prerelease mode should happen once an experimental release is ready to go from `npm install svelte-query-params@next` to `npm install svelte-query-params`. Only a core contributor run these steps. These steps should be run before

- Run: `bunx changeset pre exit` in the project root
- Create a new PR from the changes created by this command.
- Review, approve, and more the PR to enter prerelease mode.
- If successful, The "Version Packages (next)" PR (if one exists) will now say "Version Packages".

### Releasing `svelte-query-params@latest` while in prerelease mode

When in prerelease mode, the automatic PR release process will no longer release `svelte-query-params@latest`, and will instead release `svelte-query-params@next`. That means that releasing to `latest` becomes a manual process. To release latest manually while in prerelease mode:

1. _In the code snippets below, replace `0.X` with your version (ex: `0.18`, `release/0.18`, etc.)._
2. Create a new `release/0.X` branch, if none exists.
3. Point `release/0.X` to the latest commit for the `v0.X` version.
4. `git cherry-pick` commits from `main`, as needed.
5. Make sure that all changesets for the new release are included. You can create some manually (via `bunx changeset`) if needed.
6. Run `bunx changeset version` to create your new release.
7. Run `bunx release` to publish your new release.
8. Run `git push && git push --tags` to push your new release to GitHub.
9. Run `git push release/0.X:latest` to push your release branch to `latest`.
10. Go to <https://github.com/Ernxst/svelte-query-params/releases/new> and create a new release. Copy the new changelog entry from <https://github.com/Ernxst/svelte-query-params/blob/latest/CHANGELOG.md>.
11. Post in Discord #announcements channel, if needed!

## Documentation

Since this library is tiny, documentation should go in the main [README](./README.md) file.
