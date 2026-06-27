## Axiom Orca upstream sync remediation

- Original Actions run: https://github.com/Codename-11/orca/actions/runs/28288848148
- Upstream ref/tag: v1.4.102
- Intended Axiom version/tag: 1.4.102-axiom.1 / axiom-v1.4.102-axiom.1
- Target branch: `axiom/deploy`
- Bot branch: `bot/upstream-sync-axiom-v1.4.102-axiom.1`
- Classification: `auto_remediate` — Conflicts are eligible for agent PR remediation.

## Conflicted files
- `package.json`
- `src/main/ipc/pty.ts`
- `src/main/runtime/rpc/methods/terminal.ts`
- `src/renderer/src/components/terminal-pane/pty-connection.test.ts`
- `src/renderer/src/components/terminal-pane/pty-connection.ts`
- `src/shared/agent-detection.ts`

## Captured git status
```
M  README.md
M  docs/assets/readme-downloads.svg
A  mobile/app/h/[hostId]/files/preview/[worktreeId].tsx
A  mobile/scripts/mock-server-file-preview-data.ts
M  mobile/scripts/mock-server-rpc-handlers.ts
A  mobile/scripts/mock-server-terminal-fixtures.ts
M  mobile/src/components/MobileMarkdown.test.ts
M  mobile/src/components/MobileMarkdown.tsx
A  mobile/src/components/mobile-markdown-preview-html.ts
M  mobile/src/files/MobileFileExplorerPanel.tsx
A  mobile/src/files/MobileFileMarkdownPreview.tsx
A  mobile/src/files/MobileFilePreviewScreen.tsx
A  mobile/src/files/MobileFilePreviewSourceText.tsx
A  mobile/src/files/mobile-file-preview-navigation.test.ts
A  mobile/src/files/mobile-file-preview-navigation.ts
A  mobile/src/files/mobile-file-preview-request.test.ts
A  mobile/src/files/mobile-file-preview-request.ts
A  mobile/src/files/mobile-file-preview-route.test.ts
A  mobile/src/files/mobile-file-preview-route.ts
A  mobile/src/files/mobile-file-preview-styles.ts
A  mobile/src/files/mobile-file-preview-syntax.test.ts
A  mobile/src/files/mobile-file-preview-syntax.ts
UU package.json
M  src/main/agent-hooks/server.test.ts
M  src/main/agent-hooks/server.ts
M  src/main/daemon/pty-subprocess.test.ts
M  src/main/daemon/pty-subprocess.ts
M  src/main/git/worktree.test.ts
M  src/main/git/worktree.ts
M  src/main/github/client.test.ts
M  src/main/github/client.ts
M  src/main/ipc/filesystem.test.ts
M  src/main/ipc/filesystem.ts
M  src/main/ipc/pty.test.ts
UU src/main/ipc/pty.ts
M  src/main/ipc/repos-remote.test.ts
M  src/main/ipc/repos.ts
M  src/main/ipc/worktree-logic.test.ts
M  src/main/ipc/worktree-logic.ts
M  src/main/ipc/worktrees.test.ts
M  src/main/ipc/worktrees.ts
M  src/main/local-worktree-filesystem.test.ts
M  src/main/local-worktree-filesystem.ts
A  src/main/local-worktree-removal-recovery.ts
A  src/main/project-groups/nested-repo-import-target.test.ts
A  src/main/project-groups/nested-repo-import-target.ts
M  src/main/providers/local-pty-provider.test.ts
M  src/main/providers/local-pty-provider.ts
M  src/main/providers/ssh-pty-provider.test.ts
M  src/main/providers/ssh-pty-provider.ts
A  src/main/pty/powerlevel10k-wizard-env.ts
M  src/main/runtime/orca-runtime-files.ts
M  src/main/runtime/orca-runtime.test.ts
M  src/main/runtime/orca-runtime.ts
M  src/main/runtime/rpc/methods/files.test.ts
M  src/main/runtime/rpc/methods/files.ts
UU src/main/runtime/rpc/methods/terminal.ts
M  src/main/runtime/rpc/terminal-multiplex.test.ts
M  src/main/runtime/runtime-rpc.ts
M  src/preload/api-types.ts
M  src/preload/index.ts
M  src/renderer/src/components/right-sidebar/FileExplorer.test.tsx
M  src/renderer/src/components/right-sidebar/FileExplorer.tsx
M  src/renderer/src/components/right-sidebar/FileExplorerRow.tsx
M  src/renderer/src/components/right-sidebar/FileExplorerVirtualRows.tsx
M  src/renderer/src/components/right-sidebar/git-status-refresh.ts
A  src/renderer/src/components/right-sidebar/push-target-upstream-refresh-cache.test.ts
A  src/renderer/src/components/right-sidebar/push-target-upstream-refresh-cache.ts
M  src/renderer/src/components/sidebar/worktree-list-groups.test.ts
M  src/renderer/src/components/sidebar/worktree-list-groups.ts
M  src/renderer/src/components/terminal-pane/TerminalPane.tsx
M  src/renderer/src/components/terminal-pane/layout-serialization.test.ts
M  src/renderer/src/components/terminal-pane/layout-serialization.ts
UU src/renderer/src/components/terminal-pane/pty-connection.test.ts
UU src/renderer/src/components/terminal-pane/pty-connection.ts
M  src/renderer/src/components/terminal-pane/regular-terminal-focus-ownership.test.ts
M  src/renderer/src/components/terminal-pane/regular-terminal-focus-ownership.ts
A  src/renderer/src/components/terminal-pane/terminal-ime-input-source.test.ts
A  src/renderer/src/components/terminal-pane/terminal-ime-input-source.ts
A  src/renderer/src/components/terminal-pane/terminal-ime-punctuation-forwarder.test.ts
A  src/renderer/src/components/terminal-pane/terminal-ime-punctuation-forwarder.ts
M  src/renderer/src/components/terminal-pane/terminal-layout-leaf-ids.test.ts
M  src/renderer/src/components/terminal-pane/terminal-layout-leaf-ids.ts
M  src/renderer/src/components/terminal-pane/use-terminal-pane-lifecycle.ts
M  src/renderer/src/hooks/useIpcEvents.test.ts
M  src/renderer/src/hooks/useIpcEvents.ts
M  src/renderer/src/lib/focus-terminal-tab-surface.test.ts
M  src/renderer/src/lib/focus-terminal-tab-surface.ts
M  src/renderer/src/lib/pane-manager/terminal-complex-script.test.ts
M  src/renderer/src/lib/pane-manager/terminal-complex-script.ts
M  src/renderer/src/lib/use-tab-agent.test.ts
M  src/renderer/src/lib/use-tab-agent.ts
M  src/renderer/src/runtime/runtime-file-client.test.ts
M  src/renderer/src/runtime/runtime-file-client.ts
M  src/renderer/src/store/slices/agent-status.test.ts
M  src/renderer/src/store/slices/agent-status.ts
M  src/renderer/src/store/slices/editor.ts
M  src/renderer/src/web/web-preload-api.ts
M  src/shared/agent-detection.test.ts
UU src/shared/agent-detection.ts
A  src/shared/pi-compatible-synthetic-title.ts
M  src/shared/runtime-types.ts
M  src/shared/synthetic-agent-title.test.ts
M  src/shared/synthetic-agent-title.ts
A  tests/e2e/ssh-pi-compatible-agent-title.spec.ts
M  tests/e2e/terminal-foreground-redraw-freeze.spec.ts
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

