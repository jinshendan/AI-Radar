# Data Ingestion Plan

## Phase 1 Output

This plan defines the data-side contract for AI Radar so collectors, ranking,
API routes, and dashboard states can move in parallel.

The TypeScript contract lives in `src/lib/ingestion-contracts.ts`.

## Pipeline Shape

1. Source registry defines monitored subjects and exact fetchable endpoints.
2. Collectors fetch source-specific records into `RawSourceItem`.
3. Normalizers convert raw records into `NormalizedRadarEvent`.
4. Deduplication upserts events by canonical URL, subject, title similarity, and
   source family.
5. Backend scoring/clustering reads normalized events plus metric snapshots and
   returns dashboard-ready radar snapshots.

## MVP Source Families

| Family | Phase 1 status | Cadence | Auth | Primary records |
| --- | --- | --- | --- | --- |
| Official site/blog/RSS | Ready first | Hourly | No | Announcements, blog posts, changelogs, research pages |
| GitHub | Ready first | Hourly | Optional token | Repos, releases, star velocity, issues/PR activity |
| Hacker News | Next | 2h | No | Discussion links, score, comments |
| arXiv / Papers with Code | Next | Daily | No | Papers, code links, author/topic matches |
| Hugging Face | Next | Daily | Optional token | Models, datasets, spaces, trending activity |
| X/Twitter | Gated | Configurable | Required | Lab/person posts, reposts, thread URLs |

## Storage Schema

Use SQLite/Postgres-compatible tables first. A local SQLite database is enough for
MVP development; the schema is intentionally portable.

### `monitored_subjects`

- `id` text primary key, stable slug such as `openai` or `karpathy`
- `name` text
- `kind` text: `lab`, `person`, `project`, `repo`, or `community`
- `priority` text: `critical`, `high`, `normal`, or `watch`
- `aliases` json array
- `tags` json array
- `homepage_url` text nullable
- `github_login` text nullable
- `x_handle` text nullable
- `created_at` datetime
- `updated_at` datetime

### `source_registry`

- `id` text primary key, stable slug such as `openai-news-rss`
- `subject_id` text nullable references `monitored_subjects(id)`
- `family` text matching `SourceFamily`
- `name` text
- `url` text
- `cadence` text
- `status` text
- `auth_required` boolean
- `expected_kinds` json array
- `notes` text nullable
- `created_at` datetime
- `updated_at` datetime

### `collector_checkpoints`

- `source_id` text primary key references `source_registry(id)`
- `cursor` text nullable
- `etag` text nullable
- `last_modified` text nullable
- `last_seen_item_id` text nullable
- `checked_at` datetime

### `collector_runs`

- `id` text primary key
- `source_id` text references `source_registry(id)`
- `started_at` datetime
- `finished_at` datetime nullable
- `status` text: `success`, `partial`, or `failed`
- `raw_items_found` integer
- `raw_items_stored` integer
- `events_upserted` integer
- `error_message` text nullable

### `raw_source_items`

- `id` text primary key: `${source_id}:${external_id}`
- `source_id` text references `source_registry(id)`
- `source_family` text
- `external_id` text
- `kind` text
- `title` text
- `url` text
- `author` text nullable
- `published_at` datetime nullable
- `observed_at` datetime
- `updated_at` datetime nullable
- `raw_text` text nullable
- `raw_json` json nullable
- `metrics` json nullable
- `tags` json nullable
- unique index on `(source_id, external_id)`
- index on `(source_family, observed_at)`

### `normalized_events`

- `id` text primary key
- `dedupe_key` text unique
- `primary_source_id` text references `source_registry(id)`
- `kind` text
- `title` text
- `summary` text
- `canonical_url` text
- `occurred_at` datetime
- `observed_at` datetime
- `topics` json array
- `entities` json array
- `signal_strength` text
- `confidence` real from 0 to 1
- `source_authority` real from 0 to 1
- `metrics` json nullable
- index on `(occurred_at)`
- index on `(kind, signal_strength)`

### `event_sources`

- `event_id` text references `normalized_events(id)`
- `raw_item_id` text references `raw_source_items(id)`
- composite primary key `(event_id, raw_item_id)`

### `topic_clusters`

- `id` text primary key
- `label` text
- `window` text: `today`, `7d`, or `30d`
- `event_ids` json array
- `score` real
- `confidence` real
- `generated_at` datetime

### `repo_metric_snapshots`

- `id` text primary key: `${repo_full_name}:${observed_at}`
- `repo_full_name` text
- `source_id` text references `source_registry(id)`
- `stars` integer
- `forks` integer
- `watchers` integer nullable
- `open_issues` integer nullable
- `open_pull_requests` integer nullable
- `release_count_30d` integer nullable
- `commit_count_30d` integer nullable
- `observed_at` datetime
- index on `(repo_full_name, observed_at)`

## Source Freshness Summary

The dashboard should not read raw run rows directly. Data/API code should expose a
computed `SourceFreshnessSummary` per source with:

- `sourceId`
- display fields copied from the registry: `family`, `name`, `cadence`,
  `collectorStatus`, and `authRequired`
- `status`: `fresh`, `stale`, `partial`, `failed`, or `never_run`
- `isStale`
- `lastCheckedAt`, `lastSuccessfulAt`, `nextCheckAt`, and `latestRunId`
- `latestRunStatus`, `latestRunRawItemsFound`, and
  `latestRunEventsUpserted`
- `rawItemsFound24h` and `eventsUpserted24h`
- `consecutiveFailures`
- optional `errorMessage` and `warning`

This is derived from `source_registry`, `collector_checkpoints`, and
`collector_runs`. `/api/sources` can expose these rows directly. `/api/radar`
can reuse degraded or stale source ids in dashboard-level warnings. Raw run
history should stay behind a source detail/debug route.

## Deduplication Contract

Collectors should be permissive and store raw items. Normalizers should compute a
stable `dedupeKey` with this precedence:

1. Canonical URL after removing tracking parameters and normalizing trailing
   slashes.
2. Source-native stable id for GitHub releases/repos, HN item ids, arXiv ids, and
   Hugging Face model ids.
3. Subject id plus normalized title plus published date bucket.

When a later source matches an existing dedupe key, append through `event_sources`
and refresh event metrics instead of creating another event.

## Collector Plan

### Official RSS/site collector

- Inputs: source registry entries with `official_site` or `rss`.
- Fetch with `If-None-Match` and `If-Modified-Since` from checkpoints.
- Parse RSS/Atom where available. For HTML pages, extract title, canonical URL,
  publication date, and main text with site-specific adapters.
- Output kinds: `announcement`, `blog_post`, `changelog`, `research`.
- First targets: OpenAI news, Anthropic news, DeepMind blog, Meta AI blog,
  Mistral news, Hugging Face blog.

### GitHub collector

- Inputs: source registry entries with `github`.
- Use GitHub REST endpoints for org/user repos, repo metadata, releases, issues,
  pull requests, and commit activity. Use unauthenticated mode for local demos and
  optional `GITHUB_TOKEN` for higher rate limits.
- Store repo metadata as `RawSourceItem` and time-series counters in
  `repo_metric_snapshots`.
- Compute `starDelta1d` and `starDelta7d` from metric snapshots.
- First targets: OpenAI, Anthropic, Hugging Face, langchain-ai, microsoft,
  google-deepmind, karpathy.

### Community collector

- Inputs: Hacker News query/feed sources.
- Match by canonical URL, monitored subject aliases, repo names, and topic tags.
- Output discussion events with `commentCount` and HN score.

### Paper/model collectors

- arXiv: poll category/search queries for cs.AI, cs.CL, cs.LG and known authors.
- Papers with Code/Hugging Face: poll topic/model pages and API endpoints where
  available.
- Link papers/models to existing events by URL, repo link, title similarity, and
  monitored subject aliases.

### X/Twitter collector

- Keep behind `needs_credentials`.
- Contract should match the same `RawSourceItem` shape with `social_post`.
- Do not block Phase 1 or GitHub/official-source implementation on it.

## Handoff Notes

- Backend can import `NormalizedRadarEvent` and read from `normalized_events` for
  ranking/clustering.
- Backend/API should expose `SourceFreshnessSummary` for operational health and
  dashboard state decisions.
- Frontend should keep using `/api/radar`; data implementation can replace mock
  data behind that route without changing dashboard components.
- QA should validate that every event has `canonicalUrl`, `occurredAt`,
  `primarySourceId`, at least one `sourceItemId`, and confidence in `[0, 1]`.
