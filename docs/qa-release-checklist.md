# QA Baseline And Release Checklist

Date: 2026-05-31
Baseline commit: `b1a23ce`
Scope: Phase 1 MVP dashboard skeleton, mock radar snapshot, and `/api/radar`.

## Baseline Validation

| Check | Result | Notes |
| --- | --- | --- |
| `npm run lint` | Pass | ESLint completed with no reported issues. |
| `npm run build` | Pass | Next.js production build completed; `/` and `/api/radar` prerendered as static routes. |
| `GET /` local smoke | Pass | Local server returned HTTP 200 and rendered the dashboard shell. |
| `GET /api/radar` local smoke | Pass | Local server returned HTTP 200 JSON with metrics, topics, labs, repos, source health, and agent lanes. |
| Source review | Pass with findings | Baseline is coherent enough for Phase 1, but a few acceptance mismatches should be fixed before release demo. |

## Current Findings

1. Header nav links to an `Alerts` section that does not exist.
   - Evidence: `src/lib/radar-data.ts` defines `Alerts` in `navItems`; `src/app/page.tsx` generates `href="#alerts"` from the label, but no rendered element has `id="alerts"`.
   - Impact: broken in-page navigation and mismatch with README, which lists `Source Coverage` and `Agent Operating Mode` as first-screen sections.
   - Recommendation: replace `Alerts` with `Source Coverage`, or add an actual alerts section when alerts become part of the MVP.

2. Source feed metric does not match the rendered source registry.
   - Evidence: metric says `Source Feeds = 9` and `6 stable, 3 gated`, while `sourceHealth` currently renders 5 sources: 3 `Ready`, 1 `Needs key`, 1 `Planned`.
   - Impact: users may treat mock counts as real coverage, which weakens release/demo credibility.
   - Recommendation: either align the metric with the current list, or add all 9 mock source entries.

3. Agent operating mode is stale now that execution agents exist.
   - Evidence: all execution lanes except `Leader` show owner `TBD` and status `Waiting for agent`.
   - Impact: dashboard contradicts the Slock project state after all agents have joined and claimed tasks.
   - Recommendation: update owners/statuses once Phase 1 tasks are claimed, or label the section as a static role map rather than live status.

4. Interactive controls are visual-only.
   - Evidence: `Refresh`, `Sources`, `Tune ranking`, and window selector buttons have no handlers or linked state.
   - Impact: acceptable for a skeleton, but release notes should call this out so demo users do not assume live refresh/filtering exists.
   - Recommendation: disable non-functional controls or add explicit wired behavior in the next UI iteration.

## Phase 1 Integration Review

### Source Registry

Reviewed after task #1 landed `docs/source-registry.md` and
`src/lib/source-registry.ts`.

| Check | Result | Notes |
| --- | --- | --- |
| P0 subject coverage | Pass | `openai`, `anthropic`, `deepseek`, and `karpathy` are present in the machine-readable registry. |
| Subject metadata | Pass | Each P0 subject has type, priority, `importanceScore`, trust level, freshness cadence, source ids, repo slugs, tags, and rationale. |
| Stable source ids | Pass | P0 source ids are stable and collector-friendly; no duplicate source ids were found. |
| Source references | Pass | P0 subject `sourceIds` all resolve to entries in `monitoredSources`. |
| Gated social handling | Pass | P0 X/Twitter sources are present as `social_gated`, `readiness: "needs_credentials"`, `cadence: "manual"`, and `authorityScore: 0.2`. |
| Stable alternatives | Pass | Each P0 subject has at least one non-social official, GitHub, docs, status, or personal-site source available before X/Twitter credentials. |
| Build validation | Pass | `npm run lint` and `npm run build` pass after the registry landed. |

Residual integration checks for Phase 2:

- Map registry sources into `/api/sources` health rows using the same `sourceId`
  values.
- Verify `warnings[].sourceIds` always resolve to source health rows.
- Add fixture JSON for empty, partial, stale, error, and gated-social dashboard
  states using these registry ids.
- Sample real collector output against the canonical URLs and source ids before
  marking any real-data demo ready.

## Test Plan

### Phase 1 Skeleton

- Run `npm run lint` on every PR before handoff.
- Run `npm run build` on every PR before handoff.
- Smoke test `GET /` for HTTP 200 and presence of the main dashboard sections.
- Smoke test `GET /api/radar` for HTTP 200 JSON and required top-level fields:
  `generatedAt`, `window`, `metrics`, `hotTopics`, `labSignals`, `repoSignals`,
  `sourceHealth`, `agentLanes`.
- Verify every header nav target maps to a rendered section id.
- Verify mock metrics match the rendered mock arrays where counts are displayed as facts.

### Data And Collector Readiness

- Validate each source registry entry has a stable name, canonical URL, source type, cadence, auth requirement, and failure mode.
- For official/RSS collectors, verify last fetched URL, title, publication time, canonical URL, and raw source attribution.
- For GitHub collectors, verify repo identity, star count, growth window, release/activity fields, and rate-limit handling.
- For X/Twitter, require an explicit credentials/rate-limit decision before marking it anything stronger than `Needs key`.
- Sample at least 10 ingested events per source family before any real-data demo.

### Ranking And Summary Readiness

- Add deterministic fixture tests for scoring, deduplication, and clustering.
- Check ranking stability by running the same fixture twice and comparing ordered outputs.
- Check deduplication by feeding near-identical URLs/titles from multiple source families.
- Check summary output always includes source links and avoids unsupported claims.

### UI And Accessibility

- Verify desktop and mobile layouts for no text overlap or unusable horizontal scrolling outside the repo table.
- Verify buttons and links have accessible names and visible focus outlines.
- Verify external links use `target="_blank"` with `rel="noreferrer"`.
- Verify empty, loading, error, and degraded-source states before connecting real data.

## Validation Fixtures

Use shared fixtures for UI, backend, and collector validation so the same edge
cases are tested across lanes.

### Dashboard State Fixtures

| Fixture | Purpose | Required shape |
| --- | --- | --- |
| `radar-empty.json` | Empty-state UI and no-signal API behavior | `status: "ok"`, empty `hotTopics`, `labSignals`, `repoSignals`, non-empty `sourceHealth`, clear zero-count metrics. |
| `radar-partial.json` | Partial-source warning UI | `status: "partial"`, non-empty `warnings`, at least one stale or failed source, at least one healthy source with visible data. |
| `radar-stale.json` | Snapshot freshness UI | `status: "stale"`, old `generatedAt`, older `lastSuccessfulAt`, warnings naming stale source ids. |
| `radar-error.json` | Section-level failure fallback | `status: "error"` or section error metadata, no fabricated scores, retry-safe warning message. |
| `radar-gated-social.json` | Credentials-needed state | X/Twitter source marked as auth-gated/needs key while official and GitHub sources remain usable. |

For Source Coverage, every dashboard fixture should include one precomputed
health row per source with `sourceId`, `family`, `name`, `status`,
`lastCheckedAt`, `lastSuccessfulAt`, `nextCheckAt` or `cadence`, `isStale`,
latest run status/counts, and optional `errorMessage` and `authRequired`.
Raw run history can stay in source detail fixtures; dashboard fixtures should
not need to reconstruct source state from raw collector logs.
At least one partial or stale fixture must include a warning whose
`warnings[].sourceIds` references the same degraded/stale `sourceId` present in
the source health rows, so dashboard alerts can be tested against Source
Coverage highlighting and links.

### Ranking And Topic Fixtures

- `topic-cross-source-high.json`: one topic with official + GitHub + HN evidence,
  score >= 80, confidence `high`, and non-empty `scoreBreakdown`,
  `sourceCoverage`, and `evidenceEventIds`.
- `topic-single-family-watch.json`: multiple events from one source family only;
  confidence must not exceed `watch` or `medium` depending on backend thresholds.
- `topic-dedupe-same-url.json`: repeated canonical URL from multiple collectors;
  deduplication should keep one topic while preserving provenance in evidence.
- `topic-title-similarity.json`: same subject with similar titles inside the
  configured time window; should cluster deterministically to a stable topic id.
- `repo-relative-velocity.json`: one large slow repo and one smaller fast-growing
  repo; repository scoring should reward relative velocity rather than raw stars
  alone.

### Source Accuracy Sampling

- Sample at least 10 normalized events per implemented source family before a
  real-data demo.
- For each sampled event, verify canonical URL, title, subject mapping,
  published/observed timestamps, source id, source family, and raw attribution.
- For generated summaries, verify every claim can be traced to one or more
  `evidenceEventIds`; unsupported claims should fail QA.

## Release Checklist

- `npm run lint` passes.
- `npm run build` passes.
- Local dashboard opens at `http://localhost:3000`.
- `/api/radar` returns the expected typed snapshot shape.
- README setup instructions match the actual commands.
- README clearly states current data is mock data.
- Source constraints are documented, especially X/Twitter credential requirements.
- Known visual-only controls are either wired, disabled, or documented as placeholders.
- Navigation targets are valid.
- Mock counts and rendered lists are internally consistent.
- At least GitHub and official-site/RSS collector contracts are documented before the first real-data demo.
- Human-readable runbook exists for starting the app, running checks, and interpreting source health.
