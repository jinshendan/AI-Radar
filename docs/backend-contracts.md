# Backend Contracts

Phase 1 backend scope covers ranking, topic clustering, summaries, API routes,
and background jobs. The contract below is intentionally aligned with
`src/lib/ingestion-contracts.ts` so collectors can produce normalized events
while the dashboard keeps reading `/api/radar`.

## Read Model

Collectors and normalizers write `NormalizedRadarEvent` records. Backend jobs
turn those events plus repo metric snapshots and collector health into these
read-side objects.

### `RadarTopic`

```ts
type RadarTopic = {
  id: string;
  title: string;
  summary: string;
  whyItMatters: string;
  score: number; // 0-100
  deltaPct: number;
  confidence: "high" | "medium" | "watch";
  tags: string[];
  primarySubjectIds: string[];
  sourceCoverage: SourceCoverage[];
  evidenceEventIds: string[];
  scoreBreakdown: ScoreBreakdown;
  firstSeenAt: string;
  lastSeenAt: string;
};
```

### `SourceCoverage`

```ts
type SourceCoverage = {
  family:
    | "official_site"
    | "rss"
    | "github"
    | "hacker_news"
    | "arxiv"
    | "papers_with_code"
    | "hugging_face"
    | "x_twitter";
  sourceIds: string[];
  eventCount: number;
  latestEventAt?: string;
};
```

### `ScoreBreakdown`

```ts
type ScoreBreakdown = {
  recency: number;
  sourceAuthority: number;
  velocity: number;
  crossSourceCoverage: number;
  subjectImportance: number;
  evidenceQuality: number;
};
```

### `SubjectSignal`

```ts
type SubjectSignal = {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectKind: "lab" | "person" | "project" | "repo" | "community";
  title: string;
  summary: string;
  priority: "critical" | "high" | "normal";
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  relatedTopicIds: string[];
};
```

### `RepoSignal`

```ts
type RepoSignal = {
  id: string;
  owner: string;
  name: string;
  description: string;
  url: string;
  language?: string;
  stars: number;
  starGrowth1d?: number;
  starGrowth7d?: number;
  starGrowth30d?: number;
  forkGrowth30d?: number;
  releaseCount30d?: number;
  mergedPrs30d?: number;
  issueActivity30d?: number;
  maintenanceStatus: "very_high" | "high" | "normal" | "stale";
  relevanceTags: string[];
  score: number;
  whyHot: string;
  relatedTopicIds: string[];
  updatedAt: string;
};
```

## Ranking

All ranking outputs must keep final scores and component scores. This gives the
frontend an explanation surface and gives QA stable fixture expectations.

### Topic Score

```text
topicScore =
  0.30 * recency +
  0.20 * sourceAuthority +
  0.20 * velocity +
  0.15 * crossSourceCoverage +
  0.10 * subjectImportance +
  0.05 * evidenceQuality
```

Component definitions:

- `recency`: exponential decay from newest evidence event. Use a 36h half-life
  for news/community/social items and a 7d half-life for papers/repos.
- `sourceAuthority`: weighted average of registry trust scores from IntelScout.
- `velocity`: acceleration relative to the same source family and tag history,
  not raw volume alone.
- `crossSourceCoverage`: rewards independent source families. Three reposts in
  one family should not score like official + GitHub + HN evidence.
- `subjectImportance`: configured priority weight from `monitored_subjects`.
- `evidenceQuality`: normalized confidence from parse quality, fetch success,
  dedupe stability, and source coverage.

Confidence rules:

- `high`: score >= 80, at least two independent source families, and average
  evidence quality >= 0.75.
- `medium`: score >= 60 with one strong source or multiple weaker sources, and
  evidence quality >= 0.6.
- `watch`: visible but thin evidence, low coverage, or low parser confidence.

### Repository Score

```text
repoScore =
  0.30 * starVelocity +
  0.20 * maintenance +
  0.20 * relevance +
  0.15 * releaseActivity +
  0.10 * externalDiscussion +
  0.05 * sourceAuthority
```

Repository scoring should compare repos against age and size cohorts. A new repo
with fast relative growth should not be buried below a large repo with slow
absolute growth.

### Subject Priority

- `critical`: official release, major research/product update, breaking API
  change, safety/security update, or high-priority lab launch.
- `high`: notable post, repo release, paper/model launch, or repeated community
  discussion tied to a monitored subject.
- `normal`: useful timeline item that does not need dashboard prominence.

## Clustering

MVP clustering should be deterministic before adding embeddings or LLM help.

Pipeline:

1. Normalize title/summary text: lowercase, remove punctuation, collapse
   whitespace, and strip source suffixes.
2. Build candidate keys from canonical URL, source-native IDs, subject IDs, repo
   names, paper IDs, model IDs, and high-signal tags.
3. Exact-dedupe by `dedupeKey` and canonical URL.
4. Soft-match by shared subject, title token overlap, tag overlap, source family,
   and time proximity.
5. Assign events to a stable `RadarTopic.id`.
6. Preserve every source event in `evidenceEventIds`; never merge away
   provenance.

Initial thresholds:

- Same canonical URL, HN item, GitHub repo/release, arXiv ID, or Hugging Face
  model ID: merge as duplicate.
- Same subject plus title-token Jaccard >= 0.55 within 14 days: same topic.
- Same repo/model/paper ID: same topic even when titles differ.
- Tag overlap >= 0.5 plus at least two source families: candidate topic, but
  confidence cannot exceed `medium` without subject or URL evidence.

Manual overrides can later be stored as `topic_aliases` and
`event_topic_overrides`. API responses should expose whether a cluster is
automatic or manually overridden once overrides exist.

## Summaries

Phase 1 summaries should be deterministic templates built from evidence fields.
LLM summaries can later replace only the generation step while keeping the same
API fields.

Topic summary inputs:

- top evidence titles
- primary subjects
- source family coverage
- newest event
- dominant score component

Outputs:

- `summary`: one sentence describing what happened.
- `whyItMatters`: one sentence describing the practical implication.
- `evidenceEventIds`: inspectable source links for the UI.

Guardrails:

- Do not claim causality unless explicit source evidence supports it.
- Use cautious wording such as "coincides with" for weak cross-source links.
- Keep confidence at `watch` when source coverage or parse confidence is thin.
- Every generated summary must be traceable to source events.

## API Routes

### `GET /api/radar`

Dashboard snapshot. Keep current top-level keys while enriching fields.

Query parameters:

- `window=today|7d|30d`, default `today`.
- `limitTopics`, default `10`, max `50`.
- `limitRepos`, default `10`, max `50`.
- `subjectKind=lab|person|project|repo|community`, optional People & Labs
  filter.
- `sourceFamily`, optional Radar filter.
- `confidence=high|medium|watch`, optional Radar filter.

Response:

```ts
type RadarSnapshotResponse = {
  generatedAt: string;
  window: "today" | "7d" | "30d";
  status: "ok" | "partial" | "stale" | "error";
  lastSuccessfulAt?: string;
  warnings: {
    code: string;
    message: string;
    sourceIds?: string[];
  }[];
  metrics: {
    id: string;
    label: string;
    value: string;
    detail: string;
  }[];
  hotTopics: RadarTopic[];
  labSignals: SubjectSignal[];
  repoSignals: RepoSignal[];
  sourceHealth: SourceHealth[];
};
```

Compatibility note: the current mock route already returns `generatedAt`,
`window`, `metrics`, `hotTopics`, `labSignals`, `repoSignals`, and
`sourceHealth`. Add `status`, `lastSuccessfulAt`, and `warnings` without
removing existing keys.

### `GET /api/topics/:id`

Topic detail for the first drill-down view.

```ts
type TopicDetailResponse = {
  topic: RadarTopic;
  evidence: NormalizedRadarEvent[];
  relatedTopics: Pick<RadarTopic, "id" | "title" | "score" | "confidence">[];
  relatedRepos: RepoSignal[];
  timeline: {
    date: string;
    eventIds: string[];
    score: number;
  }[];
};
```

### `GET /api/subjects/:id`

People & Labs detail.

```ts
type SubjectDetailResponse = {
  subject: MonitoredSubject;
  signals: SubjectSignal[];
  topics: RadarTopic[];
  repos: RepoSignal[];
  sourceCoverage: SourceCoverage[];
};
```

### `GET /api/repos/:owner/:name`

GitHub Hot detail.

```ts
type RepoDetailResponse = {
  repo: RepoSignal;
  metricsHistory: {
    date: string;
    stars: number;
    forks: number;
    openIssues?: number;
  }[];
  releases: NormalizedRadarEvent[];
  relatedTopics: RadarTopic[];
  externalDiscussion: NormalizedRadarEvent[];
};
```

### `GET /api/sources`

Operational source coverage.

```ts
type SourceHealth = {
  id: string;
  name: string;
  family: SourceFamily;
  status: "ready" | "needs_credentials" | "blocked" | "planned" | "degraded";
  cadence: string;
  coverage: string;
  lastCheckedAt?: string;
  lastSuccessAt?: string;
  lastRunStatus?: "success" | "partial" | "failed";
  errorRate24h?: number;
};
```

## Background Jobs

Recommended job boundaries:

- `collect:*`: source-specific collectors owned by DataEngineer.
- `normalize-events`: validate raw items and upsert normalized events.
- `cluster-topics`: assign events to stable topic IDs and evidence bundles.
- `score-radar`: compute topic, subject, and repo scores per time window.
- `generate-summaries`: produce deterministic summaries and `whyItMatters`.
- `publish-snapshot`: materialize `RadarSnapshotResponse` for fast reads.

Jobs should be idempotent by source cursor and time window. Re-running a job must
not create duplicate events or unstable topic IDs.

## Testable Criteria

- Identical events in a different order produce the same topic IDs and ranking.
- Missing optional metrics remain absent and are not treated as zero-valued
  negative signals.
- A topic cannot reach `high` confidence from one source family alone.
- Repository ranking rewards relative velocity, not only absolute stars.
- Every topic summary includes source evidence IDs.
- `/api/radar` keeps the existing top-level dashboard keys while adding richer
  status and explanation fields.

## Dependencies

- IntelScout: source authority/trust weights, source family labels, and subject
  priority weights.
- DataEngineer: stable normalized event IDs, `dedupeKey`, canonical URLs, metric
  windows, collector run summaries, and source health fields.
- FrontendEngineer: confirm first detail route priority; backend recommends
  Topic Detail first.
- QAReviewer: fixture tests for scoring, clustering, dedupe, stale/partial data,
  and summary evidence traceability.
