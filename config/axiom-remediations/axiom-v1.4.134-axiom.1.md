## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/29128270846
- Upstream ref/tag: v1.4.134
- Intended Axiom version/tag: 1.4.134-axiom.1 / axiom-v1.4.134-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.134-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/renderer/src/components/terminal-pane/terminal-appearance.ts`
- `src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts`

## Captured git status
```
M  config/scripts/ensure-native-runtime.mjs
M  config/scripts/ensure-native-runtime.test.mjs
M  config/scripts/rebuild-native-deps.mjs
M  config/scripts/rebuild-native-deps.test.mjs
A  docs/new-worktree-sidebar-reveal.md
UU package.json
M  src/main/agent-hooks/first-work-branch-rename.test.ts
M  src/main/agent-hooks/first-work-branch-rename.ts
M  src/main/ai-vault/remote-session-scanner-sources.ts
M  src/main/ai-vault/remote-session-scanner.test.ts
M  src/main/ai-vault/remote-session-scanner.ts
M  src/main/ai-vault/runtime-session-scanner.test.ts
M  src/main/ai-vault/runtime-session-scanner.ts
M  src/main/ai-vault/session-scanner-accumulator.ts
A  src/main/ai-vault/session-scanner-claude-subagent-prune.test.ts
A  src/main/ai-vault/session-scanner-claude-subagents.test.ts
A  src/main/ai-vault/session-scanner-claude-subagents.ts
M  src/main/ai-vault/session-scanner-codex-parser.test.ts
M  src/main/ai-vault/session-scanner-discovery.ts
M  src/main/ai-vault/session-scanner-primary-parsers.ts
M  src/main/ai-vault/session-scanner-recoverable-empty.test.ts
M  src/main/ai-vault/session-scanner-source-discovery.ts
M  src/main/ai-vault/session-scanner-subagent-transcripts.ts
M  src/main/git/branch-rename.test.ts
M  src/main/git/branch-rename.ts
M  src/main/git/runner.test.ts
M  src/main/git/runner.ts
M  src/main/ipc/ai-vault.test.ts
M  src/main/ipc/ai-vault.ts
M  src/main/ipc/settings.test.ts
M  src/main/ipc/settings.ts
M  src/main/ipc/worktree-remote.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/persistence.test.ts
M  src/main/persistence.ts
M  src/main/providers/ssh-git-provider.test.ts
M  src/main/providers/ssh-git-provider.ts
M  src/main/runtime/fetch-remote-cache.test.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/speech/stt-service.test.ts
M  src/main/speech/stt-service.ts
M  src/main/speech/stt-worker-model-config.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/relay/fs-handler-git-fallback.ts
M  src/relay/git-handler.test.ts
M  src/relay/git-handler.ts
M  src/relay/relay-command-env.test.ts
M  src/relay/relay-command-env.ts
M  src/renderer/src/components/AgentStateDot.tsx
M  src/renderer/src/components/WorktreeJumpPalette.tsx
M  src/renderer/src/components/right-sidebar/AiVaultPanel.tsx
M  src/renderer/src/components/right-sidebar/AiVaultSessionDetails.tsx
M  src/renderer/src/components/right-sidebar/AiVaultSessionRow.tsx
A  src/renderer/src/components/right-sidebar/AiVaultSessionSubagents.test.tsx
A  src/renderer/src/components/right-sidebar/AiVaultSessionSubagents.tsx
M  src/renderer/src/components/right-sidebar/AiVaultSessionVirtualList.tsx
M  src/renderer/src/components/right-sidebar/ai-vault-original-pane-actions.ts
M  src/renderer/src/components/right-sidebar/ai-vault-original-pane.test.ts
M  src/renderer/src/components/right-sidebar/ai-vault-original-pane.ts
M  src/renderer/src/components/right-sidebar/ai-vault-session-display.test.ts
M  src/renderer/src/components/right-sidebar/ai-vault-session-display.ts
M  src/renderer/src/components/right-sidebar/ai-vault-session-filters.test.ts
M  src/renderer/src/components/right-sidebar/ai-vault-session-projects.test.ts
M  src/renderer/src/components/right-sidebar/ai-vault-session-row-display.tsx
M  src/renderer/src/components/right-sidebar/ai-vault-session-worktree.test.ts
M  src/renderer/src/components/settings/TerminalSettingsPreview.lifecycle.test.tsx
M  src/renderer/src/components/settings/TerminalSettingsPreview.tsx
M  src/renderer/src/components/settings/VoiceSpeechModelSection.test.tsx
M  src/renderer/src/components/settings/VoiceSpeechModelSection.tsx
M  src/renderer/src/components/sidebar/NonGitFolderDialog.tsx
M  src/renderer/src/components/sidebar/ProjectAddedDialog.test.tsx
M  src/renderer/src/components/sidebar/ProjectAddedDialog.tsx
M  src/renderer/src/components/sidebar/WorktreeCardAgents.tsx
M  src/renderer/src/components/sidebar/WorktreeList.tsx
M  src/renderer/src/components/sidebar/useCreateRepo.default-checkout.test.ts
M  src/renderer/src/components/sidebar/useCreateRepo.ts
M  src/renderer/src/components/sidebar/worktree-card-agent-summary.ts
M  src/renderer/src/components/sidebar/worktree-list-scroll-adjustment.test.ts
M  src/renderer/src/components/sidebar/worktree-scroll-to-current-button.test.ts
M  src/renderer/src/components/sidebar/worktree-sidebar-reveal.ts
M  src/renderer/src/components/terminal-pane/terminal-agent-session-fork.test.ts
M  src/renderer/src/components/terminal-pane/terminal-agent-session-fork.ts
UU src/renderer/src/components/terminal-pane/terminal-appearance.ts
UU src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts
M  src/renderer/src/hooks/useComposerState.ts
M  src/renderer/src/hooks/useIpcEvents.test.ts
M  src/renderer/src/hooks/useIpcEvents.ts
M  src/renderer/src/i18n/locales/en.json
M  src/renderer/src/i18n/locales/es.json
M  src/renderer/src/i18n/locales/ja.json
M  src/renderer/src/i18n/locales/ko.json
M  src/renderer/src/i18n/locales/zh.json
M  src/renderer/src/lib/launch-work-item-direct.ts
M  src/renderer/src/lib/worktree-activation-created-agent.test.ts
M  src/renderer/src/lib/worktree-activation.ts
M  src/renderer/src/lib/worktree-creation-flow.ts
M  src/renderer/src/store/slices/repos-onboarding-folder-startup.test.ts
M  src/renderer/src/store/slices/repos.ts
M  src/renderer/src/store/slices/ui.test.ts
M  src/renderer/src/store/slices/ui.ts
M  src/renderer/src/store/slices/worktrees.test.ts
M  src/renderer/src/store/slices/worktrees.ts
M  src/renderer/src/web/web-preload-api.ts
M  src/shared/ai-vault-types.ts
M  src/shared/git-clone-failure-message.test.ts
M  src/shared/git-clone-failure-message.ts
A  src/shared/git-fetch-auto-maintenance.ts
A  src/shared/git-output-locale.ts
A  src/shared/terminal-line-height-settings.test.ts
A  src/shared/terminal-line-height-settings.ts
M  tests/e2e/worktree-scroll-to-current.spec.ts
M  tests/e2e/worktree-switch-responsiveness.spec.ts
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

