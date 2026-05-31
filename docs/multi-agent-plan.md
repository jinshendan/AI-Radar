# Multi-Agent Plan

## Operating Model

AI Radar uses one Team Leader and five execution lanes.

| Lane | Responsibility | First Output |
| --- | --- | --- |
| Leader | Scope, task graph, dependencies, integration, reporting | Roadmap, task board, acceptance criteria |
| IntelScout | Source discovery and monitoring target research | Source registry and scoring rubric |
| DataEngineer | Collectors, normalization, storage schema, scheduler | Ingestion pipeline and data contracts |
| BackendEngineer | Ranking, clustering, summaries, API routes | Radar API and scoring service; see [backend contracts](backend-contracts.md) |
| FrontendEngineer | Dashboard UX and responsive implementation | Radar, People & Labs, GitHub Hot views |
| QAReviewer | Data checks, test coverage, release checklist | QA report and runbook |

## Phase 0: Project Setup

- Use `https://github.com/jinshendan/AI-Radar` as the canonical repository.
- Local checkout: `/Users/sjin/projects/ai-radar`.
- Ship a runnable dashboard skeleton with typed mock data.
- Keep source connectors behind stable interfaces so agents can work in parallel.

## Phase 1: Parallel Discovery And Skeleton

- IntelScout defines the initial monitored subjects:
  OpenAI, Anthropic, Google DeepMind, Meta AI, Mistral, xAI, Hugging Face,
  Andrej Karpathy, Simon Willison, Andrew Ng, Yann LeCun, and other configured
  targets.
- DataEngineer designs connector contracts for official sites/RSS, GitHub,
  Hacker News, arXiv, Papers with Code, and Hugging Face.
- BackendEngineer designs ranking, clustering, summary generation, API contracts,
  and background job boundaries.
- FrontendEngineer implements dashboard navigation, ranking views, source health,
  and empty/loading/error states.

Data ingestion contracts, storage schema, and collector sequencing are documented
in [data-ingestion-plan.md](data-ingestion-plan.md). Shared TypeScript contracts
live in `src/lib/ingestion-contracts.ts`.
Backend contracts for scoring, clustering, summaries, API routes, and background
jobs are documented in [backend-contracts.md](backend-contracts.md).

## Phase 2: Real Data

- GitHub collector tracks repository metadata, releases, star velocity, issue/PR
  activity, and organization activity.
- Official-source collector tracks lab blogs, research pages, product changelogs,
  and RSS/sitemap feeds.
- Community collector tracks Hacker News discussion volume and relevant arXiv or
  Papers with Code entries.
- X/Twitter collector remains optional until API credentials and usage limits are
  confirmed.

## Phase 3: Intelligence Layer

- Normalize all items into one event schema.
- Deduplicate by canonical URL, subject, title similarity, and source family.
- Cluster related events into topics.
- Score by recency, source authority, repo velocity, discussion volume, and
  maintenance quality.
- Generate concise summaries with links and "why it matters" notes.

## Acceptance Criteria For MVP

- Local dashboard starts with one command.
- Dashboard shows Radar, People & Labs, GitHub Hot, and Source Coverage.
- API returns typed radar snapshot data.
- At least GitHub and official-site/RSS collectors are implemented before the
  first real-data demo.
- README documents setup, source constraints, and current limitations.
