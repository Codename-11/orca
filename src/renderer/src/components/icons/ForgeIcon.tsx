import React from 'react'

// Why: Forge has a real two-tone brand mark (anvil + ember) used by the
// Forge web app. Keeping the path local gives Orca the same recognizable
// integration icon without shipping a separate asset pipeline.
export function ForgeIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 256 256" aria-hidden className={className}>
      <path
        d="M48 96h68v10h102l-15 32h-35c-14 0-22 8-22 20 0 14 14 26 32 34v18H78v-16c23-10 38-25 38-36 0-12-8-20-20-20-28 0-47-18-48-42Z"
        fill="currentColor"
      />
      <path d="M125 58h71l-18 30h-66Z" fill="#d97706" />
    </svg>
  )
}
