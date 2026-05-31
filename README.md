# AI Radar

AI Radar is a local dashboard for tracking high-signal AI activity across labs,
people, GitHub repositories, and community discussion.

The MVP is intentionally scoped around stable sources first:

- official lab sites, blogs, RSS feeds, and changelogs
- GitHub organizations, repositories, releases, and velocity signals
- Hacker News, arXiv, Papers with Code, and Hugging Face
- X/Twitter as a pluggable source after account/API access is available

## Product Shape

The first screen is a dashboard with:

- `Radar`: clustered AI topics with score, confidence, and source coverage
- `People & Labs`: OpenAI, Anthropic, DeepMind, Meta AI, Mistral, xAI,
  Hugging Face, and configurable key people such as Andrej Karpathy
- `GitHub Hot`: AI repositories ranked by velocity, maintenance, and relevance
- `Source Coverage`: source readiness and operational constraints
- `Agent Operating Mode`: parallel execution lanes for the multi-agent team

Current data is seeded mock data so the interface and contracts are usable while
the collector agents implement real ingestion.

## Local Development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Useful checks:

```bash
npm run lint
npm run build
```

## API

The initial app exposes one mock route:

```text
GET /api/radar
```

It returns the same typed snapshot used by the dashboard. Real collectors should
write into the same domain model first, then replace mock data with database
queries.

Backend Phase 1 contracts for ranking, clustering, summaries, background jobs,
and future API routes are documented in
[docs/backend-contracts.md](docs/backend-contracts.md).

## Multi-Agent Plan

See [docs/multi-agent-plan.md](docs/multi-agent-plan.md).

Phase 1 source registry and relevance rubric:
[docs/source-registry.md](docs/source-registry.md).
