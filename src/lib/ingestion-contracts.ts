export type SourceFamily =
  | "official_site"
  | "rss"
  | "github"
  | "hacker_news"
  | "arxiv"
  | "papers_with_code"
  | "hugging_face"
  | "x_twitter";

export type SubjectKind = "lab" | "person" | "project" | "repo" | "community";

export type SubjectPriority = "critical" | "high" | "normal" | "watch";

export type CollectorCadence =
  | "15m"
  | "30m"
  | "hourly"
  | "2h"
  | "daily"
  | "manual";

export type CollectorStatus =
  | "ready"
  | "needs_credentials"
  | "blocked"
  | "planned";

export type RawItemKind =
  | "announcement"
  | "blog_post"
  | "changelog"
  | "research"
  | "repo"
  | "release"
  | "commit"
  | "discussion"
  | "paper"
  | "model"
  | "social_post";

export type RadarEventKind =
  | "lab_update"
  | "person_update"
  | "repo_activity"
  | "community_discussion"
  | "paper_release"
  | "model_release";

export type SignalStrength = "critical" | "high" | "medium" | "low";

export type MonitoredSubject = {
  id: string;
  name: string;
  kind: SubjectKind;
  priority: SubjectPriority;
  aliases: string[];
  tags: string[];
  homepageUrl?: string;
  githubLogin?: string;
  xHandle?: string;
};

export type SourceRegistryEntry = {
  id: string;
  subjectId?: string;
  family: SourceFamily;
  name: string;
  url: string;
  cadence: CollectorCadence;
  status: CollectorStatus;
  authRequired: boolean;
  expectedKinds: RawItemKind[];
  notes?: string;
};

export type CollectorCheckpoint = {
  sourceId: string;
  cursor?: string;
  etag?: string;
  lastModified?: string;
  lastSeenItemId?: string;
  checkedAt: string;
};

export type RawSourceItem = {
  id: string;
  sourceId: string;
  sourceFamily: SourceFamily;
  externalId: string;
  kind: RawItemKind;
  title: string;
  url: string;
  author?: string;
  publishedAt?: string;
  observedAt: string;
  updatedAt?: string;
  rawText?: string;
  rawJson?: unknown;
  metrics?: Record<string, number>;
  tags?: string[];
};

export type NormalizedRadarEvent = {
  id: string;
  dedupeKey: string;
  sourceItemIds: string[];
  primarySourceId: string;
  subjectIds: string[];
  kind: RadarEventKind;
  title: string;
  summary: string;
  canonicalUrl: string;
  occurredAt: string;
  observedAt: string;
  topics: string[];
  entities: string[];
  signalStrength: SignalStrength;
  confidence: number;
  sourceAuthority: number;
  metrics: {
    stars?: number;
    forks?: number;
    watchers?: number;
    starDelta1d?: number;
    starDelta7d?: number;
    commentCount?: number;
    score?: number;
  };
};

export type CollectorRun = {
  id: string;
  sourceId: string;
  startedAt: string;
  finishedAt?: string;
  status: "success" | "partial" | "failed";
  rawItemsFound: number;
  rawItemsStored: number;
  eventsUpserted: number;
  errorMessage?: string;
};

export type SourceFreshnessStatus = "fresh" | "stale" | "partial" | "failed" | "never_run";

export type SourceFreshnessSummary = {
  sourceId: string;
  family: SourceFamily;
  name: string;
  cadence: CollectorCadence;
  collectorStatus: CollectorStatus;
  authRequired: boolean;
  status: SourceFreshnessStatus;
  isStale: boolean;
  lastCheckedAt?: string;
  lastSuccessfulAt?: string;
  nextCheckAt?: string;
  latestRunId?: string;
  latestRunStatus?: CollectorRun["status"];
  latestRunRawItemsFound?: number;
  latestRunEventsUpserted?: number;
  rawItemsFound24h: number;
  eventsUpserted24h: number;
  consecutiveFailures: number;
  errorMessage?: string;
  warning?: string;
};

export type IngestionSnapshot = {
  generatedAt: string;
  subjects: MonitoredSubject[];
  sources: SourceRegistryEntry[];
  sourceFreshness: SourceFreshnessSummary[];
  rawItems: RawSourceItem[];
  events: NormalizedRadarEvent[];
  runs: CollectorRun[];
};

export const STORAGE_TABLES = [
  "monitored_subjects",
  "source_registry",
  "collector_checkpoints",
  "collector_runs",
  "raw_source_items",
  "normalized_events",
  "event_sources",
  "topic_clusters",
  "repo_metric_snapshots",
] as const;
