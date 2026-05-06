# Review Context

## Branch Info

- Base: origin/main (merge-base 148f33c47062562d0678ec8972ed20edf08b1ec9)
- Current: brennanb2025/orca-cli-telemetry

## Changed Files Summary

- M  config/tsconfig.cli.json
- M  src/cli/dispatch.ts
- A  src/cli/telemetry.test.ts
- A  src/cli/telemetry.ts
- M  src/main/runtime/rpc/methods/index.ts
- A  src/main/runtime/rpc/methods/telemetry.test.ts
- A  src/main/runtime/rpc/methods/telemetry.ts
- M  src/shared/telemetry-events.test.ts
- M  src/shared/telemetry-events.ts

## Changed Line Ranges (PR Scope)

<!-- In scope: issues on these lines OR caused by these changes. Out of scope: unrelated pre-existing issues -->

| File                                            | Changed Lines                                        |
| ----------------------------------------------- | ---------------------------------------------------- |
| config/tsconfig.cli.json                        | 3-8                                                  |
| src/cli/dispatch.ts                             | 3, 62-74                                             |
| src/cli/telemetry.test.ts                       | 1-227 (new file, all lines)                          |
| src/cli/telemetry.ts                            | 1-349 (new file, all lines)                          |
| src/main/runtime/rpc/methods/index.ts           | 11, 25-26                                            |
| src/main/runtime/rpc/methods/telemetry.test.ts  | 1-131 (new file, all lines)                          |
| src/main/runtime/rpc/methods/telemetry.ts       | 1-80 (new file, all lines)                           |
| src/shared/telemetry-events.test.ts             | 10-11, 15, 194-283                                   |
| src/shared/telemetry-events.ts                  | 113-133, 211-220, 246-248, 251-260                   |

## Review Standards Reference

- Follow /review-code standards
- Focus on: correctness, security, performance, maintainability
- Priority levels: Critical > High > Medium > Low

## File Categories

### Electron/Main (priority 1)
- src/main/runtime/rpc/methods/index.ts
- src/main/runtime/rpc/methods/telemetry.ts
- src/main/runtime/rpc/methods/telemetry.test.ts

### Config/Build (priority 4)
- config/tsconfig.cli.json

### Utility/Common (priority 5)
- src/cli/dispatch.ts
- src/cli/telemetry.ts
- src/cli/telemetry.test.ts
- src/shared/telemetry-events.ts
- src/shared/telemetry-events.test.ts

## Skipped Issues (Do Not Re-validate)

<!-- Issues validated but deemed not worth fixing. Do not re-validate these in future iterations. -->
<!-- Format: [file:line-range] | [severity] | [reason skipped] | [issue summary] -->
<!-- NOTE: Skips should be RARE - only purely cosmetic issues with no functional impact -->

(none yet)

## Iteration State

<!-- Updated after each phase to enable crash recovery -->

Current iteration: 1
Last completed phase: Validation
Files fixed this iteration: []
Validated issues:
  - Fix: src/main/runtime/rpc/methods/telemetry.ts (wrap track() in try/catch)
  - Fix: src/cli/telemetry.ts (early return if metadata.authToken is null)
  - Fix: src/cli/telemetry.test.ts (add failure→success symmetric dedupe test)
Skipped/non-actionable: ~10 reviewer notes explicitly "no change required" (cosmetic comment wording, mutability style nit, follow-up architectural refactors, observation-only notes)
