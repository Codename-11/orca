# Task Provider Surface Map

Generated during Wave 0 of the Forge provider enhancement plan.

## Current provider model

Orca currently models task providers as a closed union in `src/shared/task-providers.ts`:

```ts
export type TaskProvider = 'github' | 'gitlab' | 'linear' | 'forge'
```

The shared module owns persistence normalization and availability filtering, while provider-specific behavior still lives in hardcoded vertical slices.

## Hardcoded provider seams

| Surface | Current pattern | Upstream-compatible seam |
| --- | --- | --- |
| Provider persistence | `TASK_PROVIDERS`, `normalizeVisibleTaskProviders`, `resolveVisibleTaskProvider` | Keep shared provider IDs as the source of truth. Add metadata adjacent to these IDs instead of introducing an external plugin system first. |
| Task source settings | `TasksPane.tsx` has local `TASK_PROVIDER_OPTIONS` with labels/icons/descriptions | Move UI metadata into a renderer provider registry consumed by settings and task source picker. |
| Task page source picker | `TaskPage.tsx` has local `SOURCE_OPTIONS` and provider-specific render branches | Registry can supply labels/icons/capability flags; data fetching/render branches can remain explicit until provider contracts stabilize. |
| Provider API clients | GitHub/GitLab use existing runtime/API paths; Linear and Forge use main/preload/runtime client slices | Do not genericize auth/API calls yet. Keep Forge tokens main-process only. |
| Store/cache behavior | Linear and Forge each have Zustand slices with provider-specific TTL/cache keys | Add reusable cache conventions only if a second provider needs the same behavior after Forge features land. |
| Detail/edit UI | Linear has the richest existing issue workflow; Forge currently mirrors list/update basics | Build Forge detail drawer against Forge DTOs first, then extract common drawer primitives if overlap is real. |
| Release/update identity | Axiom deploy branch owns fork-specific updater/build settings | Keep this outside upstreamable provider work. Build-time env constants are the correct seam. |

## Candidate upstream PR shape

A plausible upstream PR should avoid Axiom/Forge-specific service code and focus on a small custom-provider foundation:

1. A shared provider ID + metadata registry.
2. Renderer capability flags (`supportsCreate`, `supportsDetailDrawer`, `supportsAgentFilters`, settings target/empty-state copy).
3. Tests proving existing GitHub/GitLab/Linear behavior does not change.
4. Documentation explaining how a future provider can attach UI metadata without editing every settings/source picker surface.

Forge-specific MCP transport, credentials, agent filters, and Axiom release feeds should stay fork-side unless upstream explicitly wants a concrete Forge provider.

## Wave 0 verification

```text
pnpm run typecheck ✅
pnpm exec vitest run --config config/vitest.config.ts src/shared/task-providers.test.ts src/main/forge src/renderer/src/store/slices/forge.test.ts src/renderer/src/runtime/runtime-forge-client.test.ts ✅
```

Note: renderer Forge slice/runtime test files do not exist yet on this branch, so Vitest only executed the matching shared/main Forge suites (53 tests). Future waves should add the missing renderer coverage before relying on those paths in the command.
