## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/26315362128
- Upstream ref/tag: v1.4.21-rc.2
- Intended Axiom version/tag: 1.4.21-rc.2.axiom.1 / axiom-v1.4.21-rc.2.axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.21-rc.2.axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/sidebar/SidebarNav.tsx`

## Captured git status
```
M  docs/STYLEGUIDE.md
UU package.json
M  src/main/github/client-create-pr.test.ts
A  src/main/gitlab/gitlab-preload-args.ts
A  src/main/gitlab/gitlab-project-recents.ts
M  src/main/ipc/github.test.ts
M  src/main/ipc/gitlab.ts
A  src/main/ipc/hosted-review.test.ts
M  src/main/ipc/hosted-review.ts
M  src/main/ipc/ssh.test.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/ipc/worktrees.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/github.test.ts
M  src/main/runtime/rpc/methods/github.ts
M  src/main/runtime/rpc/methods/gitlab.test.ts
M  src/main/runtime/rpc/methods/gitlab.ts
M  src/main/skills/discovery.test.ts
M  src/main/skills/discovery.ts
M  src/main/source-control/hosted-review-creation.test.ts
M  src/main/source-control/hosted-review-creation.ts
M  src/main/worktree-removal-safety.test.ts
M  src/main/worktree-removal-safety.ts
M  src/renderer/src/App.tsx
M  src/renderer/src/assets/main.css
A  src/renderer/src/assets/mobile-page.css
A  src/renderer/src/components/AgentSkillInstalledIndicator.tsx
A  src/renderer/src/components/integration-status-pill.tsx
A  src/renderer/src/components/mobile/MobileHero.tsx
A  src/renderer/src/components/mobile/MobilePage.tsx
A  src/renderer/src/components/mobile/PhoneCarousel.tsx
A  src/renderer/src/components/mobile/slides/HomeSlide.tsx
A  src/renderer/src/components/mobile/slides/TerminalSlide.tsx
A  src/renderer/src/components/mobile/slides/WorktreeListSlide.tsx
M  src/renderer/src/components/onboarding/IntegrationsStep.tsx
M  src/renderer/src/components/onboarding/OnboardingInlineCommandTerminal.tsx
A  src/renderer/src/components/settings/AgentSkillSetupPanel.tsx
M  src/renderer/src/components/settings/BrowserUsePane.tsx
M  src/renderer/src/components/settings/BrowserUseSkillStep.tsx
M  src/renderer/src/components/settings/CliSection.tsx
M  src/renderer/src/components/settings/ComputerUsePane.tsx
M  src/renderer/src/components/settings/OrchestrationPane.tsx
M  src/renderer/src/components/settings/RuntimePairingUrlGenerator.tsx
M  src/renderer/src/components/settings/Settings.tsx
M  src/renderer/src/components/settings/SshPane.tsx
A  src/renderer/src/components/settings/ssh-target-remove.test.ts
A  src/renderer/src/components/settings/ssh-target-remove.ts
M  src/renderer/src/components/sidebar/DeleteWorktreeDialog.test.tsx
M  src/renderer/src/components/sidebar/DeleteWorktreeLineageNotice.tsx
UU src/renderer/src/components/sidebar/SidebarNav.tsx
M  src/renderer/src/components/sidebar/SidebarToolbar.tsx
A  src/renderer/src/components/sidebar/mobile-sidebar-onboarding-badge.ts
M  src/renderer/src/hooks/resolve-zoom-target.ts
A  src/renderer/src/hooks/useInstalledAgentSkills.test.ts
A  src/renderer/src/hooks/useInstalledAgentSkills.ts
M  src/renderer/src/lib/browser-use-setup-state.ts
M  src/renderer/src/lib/orchestration-setup-state.ts
M  src/renderer/src/lib/pane-manager/pane-scroll.test.ts
M  src/renderer/src/lib/pane-manager/pane-scroll.ts
M  src/renderer/src/lib/pane-manager/pane-tree-ops.test.ts
M  src/renderer/src/store/slices/hosted-review.test.ts
M  src/renderer/src/store/slices/ui.ts
M  src/renderer/src/web/web-preload-api.test.ts
M  src/renderer/src/web/web-preload-api.ts
A  tests/e2e/settings-skill-detection.spec.ts
```

## Axiom safety notes
- Bot branch PR only; do not push conflict remediation directly to `axiom/deploy`.
- Preserve side-by-side identity, updater feed, fork semver, profile portability, and Forge provider/task-registry additions.
- Protected-file deletion or fork identity/update-feed changes require explicit review before merge.

## Verification checklist
- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm run typecheck`
- [ ] `pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/axiom-release-hardening.test.ts src/main/updater-endpoints.test.ts src/main/app-build-identity.test.ts config/scripts/axiom-upstream-sync-release.test.mjs`
- [ ] `pnpm exec oxlint config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml`
- [ ] `pnpm exec oxfmt --check config/scripts/axiom-request-merge-remediation.mjs config/scripts/axiom-report-sync-failure.mjs .github/workflows/axiom-upstream-sync-release.yml .github/workflows/axiom-upstream-main-sync.yml config/axiom-merge-remediation-policy.json`
- [ ] `git diff --check`

