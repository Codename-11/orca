import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const mobileRoot = join(__dirname, '..', '..')

const runtimeFiles = ['app/h/[hostId]/tasks.tsx', 'src/tasks/workspace-create-params.ts']

function nonTypeDesktopSharedImports(filePath: string): string[] {
  const content = readFileSync(join(mobileRoot, filePath), 'utf8')
  return content
    .split('\n')
    .filter((line) => /^import\s+(?!type\b).*['"](?:\.\.\/){3,}src\/shared\//.test(line.trim()))
}

describe('mobile runtime imports', () => {
  it('does not bundle desktop shared runtime modules from outside the mobile root', () => {
    const violations = runtimeFiles.flatMap((filePath) =>
      nonTypeDesktopSharedImports(filePath).map(
        (line) => `${relative(process.cwd(), join(mobileRoot, filePath))}: ${line.trim()}`
      )
    )

    expect(violations).toEqual([])
  })
})
