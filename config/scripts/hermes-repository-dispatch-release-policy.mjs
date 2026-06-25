const MILLISECONDS_PER_HOUR = 60 * 60 * 1000

function nonNegativeNumber(value, fallback = 0) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  return Math.max(0, parsed)
}

function releaseBatchingEnabled(options) {
  return Boolean(
    options.batchLatestStable ||
    options.recordOnly ||
    nonNegativeNumber(options.releaseMinAgeHours, 0) > 0 ||
    nonNegativeNumber(options.releaseMaxWaitHours, 0) > 0 ||
    options.releaseWindow
  )
}

function parseReleaseWindow(releaseWindow) {
  const window = String(releaseWindow ?? '').trim()
  if (!window) {
    return null
  }
  const match = window.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/)
  if (!match) {
    throw new Error(`Invalid --release-window "${window}"; expected UTC HH:MM-HH:MM`)
  }

  const startHour = Number(match[1])
  const startMinute = Number(match[2])
  const endHour = Number(match[3])
  const endMinute = Number(match[4])
  if (startHour > 23 || endHour > 23 || startMinute > 59 || endMinute > 59) {
    throw new Error(`Invalid --release-window "${window}"; expected UTC HH:MM-HH:MM`)
  }

  return {
    label: window,
    startMinuteOfDay: startHour * 60 + startMinute,
    endMinuteOfDay: endHour * 60 + endMinute
  }
}

function isWithinReleaseWindow(now, releaseWindow) {
  if (!releaseWindow) {
    return true
  }
  const minuteOfDay = now.getUTCHours() * 60 + now.getUTCMinutes()
  if (releaseWindow.startMinuteOfDay === releaseWindow.endMinuteOfDay) {
    return true
  }
  if (releaseWindow.startMinuteOfDay < releaseWindow.endMinuteOfDay) {
    return (
      minuteOfDay >= releaseWindow.startMinuteOfDay && minuteOfDay < releaseWindow.endMinuteOfDay
    )
  }
  return minuteOfDay >= releaseWindow.startMinuteOfDay || minuteOfDay < releaseWindow.endMinuteOfDay
}

function isoOrEmpty(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function dateFromOption(value) {
  if (value instanceof Date) {
    return value
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }
  return new Date()
}

function buildBatchedReleaseDecision({
  current,
  previous,
  watchRelease,
  releaseEventType,
  source,
  releaseMinAgeHours,
  releaseMaxWaitHours,
  releaseWindow,
  recordOnly,
  now
}) {
  const minAgeHours = nonNegativeNumber(releaseMinAgeHours, 0)
  const maxWaitHours = nonNegativeNumber(releaseMaxWaitHours, 0)
  const parsedWindow = parseReleaseWindow(releaseWindow)
  const latestStableTag = current.releaseTag || ''
  const previousObservedTag = previous?.releaseTag ?? ''
  const previousDispatchedTag = previous?.dispatchedReleaseTag ?? previousObservedTag
  const previousPendingTag = previous?.pendingReleaseTag ?? ''
  const nowIso = now.toISOString()

  const decision = {
    enabled: true,
    latestStableTag,
    previousObservedTag,
    previousDispatchedTag,
    pendingTag: '',
    pendingFirstSeenAt: '',
    candidate: null,
    skippedReason: '',
    dispatches: [],
    statePatch: {
      releaseTag: latestStableTag,
      dispatchedReleaseTag: previousDispatchedTag,
      pendingReleaseTag: '',
      pendingReleaseFirstSeenAt: '',
      pendingReleaseBatchStartedAt: ''
    }
  }

  if (!watchRelease) {
    decision.skippedReason = 'release_watch_disabled'
    return decision
  }

  if (!latestStableTag) {
    decision.skippedReason = 'no_stable_release_tag'
    return decision
  }

  if (!previous) {
    decision.skippedReason = 'bootstrap_silent'
    decision.statePatch.dispatchedReleaseTag = latestStableTag
    return decision
  }

  if (latestStableTag === previousDispatchedTag) {
    decision.skippedReason = 'already_dispatched_latest_stable'
    decision.statePatch.dispatchedReleaseTag = latestStableTag
    return decision
  }

  const firstSeenAt =
    previousPendingTag === latestStableTag
      ? isoOrEmpty(previous?.pendingReleaseFirstSeenAt) || nowIso
      : nowIso
  const batchStartedAt = previousPendingTag
    ? isoOrEmpty(previous?.pendingReleaseBatchStartedAt) ||
      isoOrEmpty(previous?.pendingReleaseFirstSeenAt) ||
      firstSeenAt
    : firstSeenAt
  const firstSeenDate = new Date(firstSeenAt)
  const firstSeenTime = Number.isNaN(firstSeenDate.getTime())
    ? now.getTime()
    : firstSeenDate.getTime()
  const batchStartedDate = new Date(batchStartedAt)
  const batchStartedTime = Number.isNaN(batchStartedDate.getTime())
    ? firstSeenTime
    : batchStartedDate.getTime()
  const ageMs = Math.max(0, now.getTime() - firstSeenTime)
  const batchAgeMs = Math.max(0, now.getTime() - batchStartedTime)
  const minAgeMs = minAgeHours * MILLISECONDS_PER_HOUR
  const maxWaitMs = maxWaitHours * MILLISECONDS_PER_HOUR
  const ageHours = ageMs / MILLISECONDS_PER_HOUR
  const batchAgeHours = batchAgeMs / MILLISECONDS_PER_HOUR
  const maxWaitElapsed = maxWaitMs > 0 && batchAgeMs >= maxWaitMs
  const withinReleaseWindow = isWithinReleaseWindow(now, parsedWindow)

  let skippedReason = ''
  if (recordOnly) {
    skippedReason = 'record_only'
  } else if (ageMs < minAgeMs && !maxWaitElapsed) {
    skippedReason = 'release_min_age'
  } else if (!withinReleaseWindow) {
    skippedReason = 'outside_release_window'
  }

  const eligible = !skippedReason
  decision.pendingTag = latestStableTag
  decision.pendingFirstSeenAt = firstSeenAt
  decision.skippedReason = skippedReason
  decision.candidate = {
    tag: latestStableTag,
    eligible,
    skippedReason,
    firstSeenAt,
    batchStartedAt,
    ageHours,
    batchAgeHours,
    minAgeHours,
    maxWaitHours,
    maxWaitElapsed,
    releaseWindow: parsedWindow?.label ?? '',
    withinReleaseWindow
  }

  if (eligible) {
    // Keep releaseTag as latest-observed while dispatchedReleaseTag remains the build gate.
    decision.dispatches.push({
      kind: 'release',
      eventType: releaseEventType,
      payload: {
        upstream_tag: latestStableTag,
        previous_upstream_tag: previousDispatchedTag,
        source
      }
    })
    decision.statePatch.dispatchedReleaseTag = latestStableTag
    decision.statePatch.releaseDispatchedAt = nowIso
    return decision
  }

  decision.statePatch.pendingReleaseTag = latestStableTag
  decision.statePatch.pendingReleaseFirstSeenAt = firstSeenAt
  decision.statePatch.pendingReleaseBatchStartedAt = batchStartedAt
  return decision
}

export { buildBatchedReleaseDecision, dateFromOption, releaseBatchingEnabled }
