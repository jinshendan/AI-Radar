# Frontend UI Proposal

## Baseline Review

The current dashboard is a good MVP shell: it has one operational first screen,
typed mock data, anchored navigation, metrics, Radar, People & Labs, GitHub Hot,
Source Coverage, and Agent Operating Mode. The visual style is restrained and
works for a monitoring tool rather than a marketing page.

Current limitations:

- Time-window controls, Refresh, Sources, and Tune ranking are present but not
  wired to URL state, loading, or backend query parameters.
- Radar topics, lab signals, and repo rows are list-only; there is no drill-down
  for evidence, source links, scoring explanation, or related items.
- Source Coverage shows broad readiness but not run status, last success,
  last failure, auth state, or freshness risk.
- Empty, loading, error, stale, and partial-data states are not represented yet.
- GitHub Hot is a wide table, which is acceptable on desktop but should become a
  card/list layout on narrow screens once real rows grow.
- The dashboard uses mock values that look production-like, so it needs a clear
  environment/data freshness marker before demos with non-real data.

## Next UI States

Add these states before real collectors replace mock data:

| State | Where | UI behavior |
| --- | --- | --- |
| Loading | Full dashboard and each section | Skeleton rows/cards with fixed heights so layout does not jump. |
| Empty | Radar, People & Labs, GitHub Hot | Explain the selected window has no signals and point to active sources. |
| Error | Section-level API failures | Keep other sections visible, show retry action and last successful timestamp. |
| Partial data | Source/API response | Show a compact warning when some source families failed or are stale. |
| Stale data | Header and Source Coverage | Display snapshot age and mark sources exceeding cadence. |
| Credentials needed | Source detail and coverage row | Explain which source is gated without blocking stable sources. |
| Ranking tuned | Radar | Reflect selected window, source family, confidence, and topic filters in URL state. |

## Detail Views

### Topic Detail

Route: `/topics/[topicId]`

Purpose: answer "why is this hot?" without forcing users to inspect raw feeds.

Recommended sections:

- Summary header: score, delta, confidence, window, generated timestamp.
- Why hot: 3-5 concise evidence bullets from clustered events.
- Evidence timeline: source, title, canonical URL, occurred time, observed time.
- Source coverage: which families support this topic and which are missing.
- Related repos/people/labs: links into repo and subject details.
- Scoring breakdown: recency, source authority, repo velocity, discussion volume,
  and maintenance quality.

Backend dependency: topic cluster ids, event ids, score components, confidence,
and source-family coverage.

### Repo Detail

Route: `/repos/[owner]/[name]`

Purpose: distinguish durable repo momentum from one-off star spikes.

Recommended sections:

- Repo summary: description, language, stars, star deltas, activity, latest
  release, issue/PR activity.
- Velocity chart: starDelta1d/starDelta7d over available snapshots.
- Why hot: ranked evidence from releases, commits, HN links, papers, or lab posts.
- Maintenance quality: release cadence, open issue trend, PR activity.
- Related topics: topic clusters where this repo appears.

Backend/data dependency: `repo_metric_snapshots`, normalized repo events, and
topic cluster membership.

### Subject Detail

Route: `/subjects/[subjectId]`

Purpose: make People & Labs useful as a monitored-source hub, not just a feed.

Recommended sections:

- Subject profile: kind, priority, aliases, tags, official links, GitHub login,
  optional X handle status.
- Latest signals: announcements, changelogs, research, repo activity, papers.
- Source bundle health: per-source status, cadence, last checked, last success,
  auth requirement, and latest error.
- Topic impact: current clusters where the subject contributes evidence.

Data dependency: `monitored_subjects`, `source_registry`,
`collector_checkpoints`, recent `collector_runs`, and normalized events.

### Source Detail

Route: `/sources/[sourceId]`

Purpose: support debugging and trust in the radar output.

Recommended sections:

- Source metadata: family, URL, cadence, auth requirement, expected item kinds.
- Run history: success/partial/failed, item counts, events upserted, error.
- Freshness: last checked, last modified/etag, stale threshold.
- Recent raw items and normalized events linked by id.

Data dependency: source registry, checkpoints, collector runs, raw item counts,
and event_sources.

## Dashboard Iteration Slices

1. Add dashboard state contract:
   - Extend `/api/radar` with `status`, `warnings`, `generatedAt`,
     `lastSuccessfulAt`, and section-level errors.
   - Keep dashboard components reading through the same route.

2. Make controls real:
   - Sync time window to `?window=today|7d|30d`.
   - Add source-family and confidence filters for Radar.
   - Keep Refresh as a visible disabled/loading action until collector runs exist.

3. Add source health depth:
   - Replace broad Source Coverage rows with source family groups and source rows.
   - Show last checked, last successful run, stale badge, and auth-needed badge.

4. Add first drill-down:
   - Start with Topic Detail because it is the core product question.
   - Reuse topic cards from the dashboard and add evidence timeline.

5. Improve mobile GitHub Hot:
   - Keep table for desktop.
   - Render the same data as compact repo cards below tablet width.

## Cross-Agent Contract Requests

- BackendEngineer: include score component breakdowns and source-family coverage
  on topic clusters, not just final score/confidence.
- DataEngineer: expose source freshness and run summaries per source so Source
  Coverage can become operational rather than static.
- IntelScout: include source display names, trust level, and source family in the
  registry so UI badges do not have to infer meaning from ids.
- QAReviewer: include empty/partial/stale datasets in validation fixtures so UI
  states are covered before real ingestion.
