# 📦 Release Management

This document outlines our versioning policy, release process, and maintenance strategy.

## 📌 Versioning Policy

We follow [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for added functionality in a backward-compatible manner
- **PATCH** version for backward-compatible bug fixes

### Pre-release Versions
- Use `-alpha.n` for early testing
- Use `-beta.n` for feature-complete testing
- Use `-rc.n` for release candidates

Example: `1.0.0-alpha.1` → `1.0.0-beta.1` → `1.0.0-rc.1` → `1.0.0`

## 🚀 Release Cadence

### Regular Releases
- **Patch releases**: As needed for critical bug fixes
- **Minor releases**: Every 2-3 months
- **Major releases**: When significant breaking changes are introduced

### Pre-releases
- Alpha/Beta releases may be published more frequently
- Release candidates (RC) will be published before major releases

## 🛠 Release Process

### 1. Preparing a Release

1. Create a release branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b release/vX.Y.Z
   ```

2. Update version numbers:
   - Update `package.json` version
   - Update any other version references
   - Update CHANGELOG.md with release notes

3. Create a pull request to `main`

### 2. Releasing

1. Merge the release PR to `main`
2. Create a version tag:
   ```bash
   git tag -a vX.Y.Z -m "Release X.Y.Z"
   git push origin vX.Y.Z
   ```
3. Create a GitHub Release with release notes
4. Merge `main` back into `develop`

### 3. Post-Release

1. Update documentation if needed
2. Announce the release (when applicable)
3. Close related issues/PRs

## 🔧 Hotfix Process

For critical bugs in production:

1. Create a hotfix branch from `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b hotfix/description
   ```

2. Make the necessary changes
3. Update CHANGELOG.md and version
4. Create a PR to `main`
5. After merging, create a new patch version tag
6. Cherry-pick the fix to `develop`

## 📅 Maintenance Policy

### Active Development
- Latest major version
- Latest minor version of previous major

### Security Fixes Only
- Previous major versions for 6 months after new major release

### Unsupported
- Versions older than 2 major versions
- Pre-release versions after stable release

## 🔍 Quality Gates

Before any release, the following must pass:
- [ ] All tests passing
- [ ] Code coverage ≥80%
- [ ] No critical bugs open
- [ ] Documentation updated
- [ ] Accessibility checks passed
- [ ] Performance benchmarks met

## 📝 Changelog Management

- Every PR should update the [CHANGELOG.md](CHANGELOG.md)
- Use the following sections:
  ```markdown
  ## [X.Y.Z] - YYYY-MM-DD
  
  ### Added
  - New features
  
  ### Changed
  - Changes in existing functionality
  
  ### Deprecated
  - Soon-to-be removed features
  
  ### Removed
  - Removed features
  
  ### Fixed
  - Bug fixes
  
  ### Security
  - Security-related fixes
  ```

## 🚨 Emergency Releases

For critical security issues:
1. Bypass normal process if needed
2. Focus on minimal changes to fix the issue
3. Document the emergency process in the release notes

---
*Last updated: July 28, 2025*
