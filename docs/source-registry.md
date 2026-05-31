# Source Registry

Checked: 2026-05-31

This is the Phase 1 IntelScout registry for monitored AI labs, people, repositories, and stable source families. It is intentionally conservative: collectors should start with sources that are pollable today, then add scraping and gated social feeds behind explicit connectors.

Machine-readable registry: `src/lib/source-registry.ts`.

## P0 Seed Contract

| Subject id | Type | Priority | Importance | Trust | Freshness | Stable source ids |
| --- | --- | --- | ---: | --- | --- | --- |
| `openai` | lab | P0 | 1.0 | official-first | hourly | `openai-news`, `openai-changelog`, `openai-status`, `openai-github-org`, `openai-x-twitter` |
| `anthropic` | lab | P0 | 1.0 | official-first | hourly | `anthropic-news`, `anthropic-changelog`, `anthropic-status`, `anthropic-github-org`, `anthropic-x-twitter` |
| `deepseek` | lab | P0 | 1.0 | official-first | hourly | `deepseek-site`, `deepseek-api-docs`, `deepseek-github-org`, `deepseek-x-twitter` |
| `karpathy` | person | P0 | 1.0 | alternative-first | daily | `karpathy-github-user`, `karpathy-site`, `karpathy-x-twitter` |

All P0 X/Twitter rows are present only as gated sources with `readiness=needs_credentials` and `authorityScore=0.2`. Collectors should use the listed official/GitHub/site alternatives until credentials are approved.

## P0 Subjects

| Subject | Stable sources | Notes |
| --- | --- | --- |
| OpenAI (`openai`) | `https://openai.com/news/rss.xml`, `https://platform.openai.com/docs/changelog`, `https://status.openai.com/history.rss`, `https://api.github.com/orgs/openai/repos?sort=pushed&per_page=50` | Human-selected P0. Best initial official-feed coverage. X/Twitter `https://x.com/OpenAI` is gated until API access is approved. |
| Anthropic (`anthropic`) | `https://docs.anthropic.com/en/release-notes/overview`, `https://status.anthropic.com/history.rss`, `https://api.github.com/orgs/anthropics/repos?sort=pushed&per_page=50` | Human-selected P0. News page has no verified RSS; scrape `https://www.anthropic.com/news`. X/Twitter `https://x.com/AnthropicAI` is gated. |
| DeepSeek (`deepseek`) | `https://www.deepseek.com/`, `https://api-docs.deepseek.com/`, `https://api.github.com/orgs/deepseek-ai/repos?sort=pushed&per_page=50` | Human-selected P0. Official site/docs and GitHub are pollable; no RSS/Atom alternate found. X/Twitter `https://x.com/deepseek_ai` is gated. |
| Andrej Karpathy (`karpathy`) | `https://api.github.com/users/karpathy/repos?sort=pushed&per_page=25`, `https://karpathy.ai/` | Human-selected P0 person. X/Twitter `https://x.com/karpathy` is gated; use GitHub/site as first substitutes. |

## P1 Subjects

| Subject | Stable sources | Notes |
| --- | --- | --- |
| Google DeepMind / Gemini | `https://ai.google.dev/gemini-api/docs/changelog`, GitHub API | DeepMind blog RSS candidate returned 404; scrape `https://deepmind.google/discover/blog/`. Track Gemini cookbook and Gemini CLI. |
| Hugging Face | `https://huggingface.co/blog/feed.xml`, `https://status.huggingface.co/feed`, `https://huggingface.co/api/models`, GitHub API | Strong open ecosystem coverage. Use model API sort by `likes` or `downloads`; `trending` sort was rejected in local checks. |
| Meta AI | GitHub API plus scraped `https://ai.meta.com/blog` | No RSS alternate found. Track major Llama/open-source and PyTorch-related signals. |
| Mistral AI | Scraped `https://mistral.ai/news/` | RSS candidate returned 404. Docs changelog path still needs verification. |
| xAI | `https://docs.x.ai/docs/overview` | `https://x.ai/news` was blocked by Cloudflare in direct fetch. Treat as browser/manual until a stable source is available. |
| Simon Willison | `https://simonwillison.net/atom/everything/`, GitHub user repos | High-signal practitioner source with a stable Atom feed. |

## P2 Subjects

| Subject | Stable sources | Notes |
| --- | --- | --- |
| Andrew Ng | Scraped `https://www.deeplearning.ai/the-batch/`, optional X/Twitter | Useful for product/education adoption; direct feed endpoint was not found. |
| Yann LeCun | GitHub API, optional X/Twitter | Research signal is mostly social-gated; include after social connector policy is settled. |

## Initial Repo Watchlist

| Priority | Repos |
| --- | --- |
| P0 | `openai/openai-cookbook`, `openai/openai-python`, `anthropics/anthropic-cookbook`, `deepseek-ai/DeepSeek-R1`, `deepseek-ai/DeepSeek-V3`, `google-gemini/gemini-cli`, `huggingface/transformers`, `langchain-ai/langgraph`, `modelcontextprotocol/specification`, `vllm-project/vllm`, `ollama/ollama`, `ggml-org/llama.cpp`, `karpathy/nanochat`, `karpathy/llm.c` |
| P1 | `openai/openai-node`, `anthropics/anthropic-sdk-python`, `anthropics/anthropic-sdk-typescript`, `deepseek-ai/DeepGEMM`, `google-gemini/cookbook`, `huggingface/smolagents`, `huggingface/huggingface_hub`, `modelcontextprotocol/servers`, `ml-explore/mlx`, `microsoft/autogen`, `pytorch/pytorch` |

For GitHub collection, start with repository metadata, releases, `pushed_at`, stars, open issues/PR counts, and recent commits. Compute star velocity from checkpoints instead of treating absolute stars as freshness.

## Community Sources

| Source | Endpoint | Readiness | Use |
| --- | --- | --- | --- |
| Hacker News Algolia | `https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story` | Ready | Fresh discussion and title/URL search. |
| Hacker News Firebase | `https://hacker-news.firebaseio.com/v0/topstories.json` | Ready | Top-story ids and item metadata fallback. |
| arXiv | `https://export.arxiv.org/api/query` | Ready | Start with `cs.AI`, `cs.CL`, `cs.LG`; add author filters later. |
| Hugging Face models | `https://huggingface.co/api/models?sort=likes&direction=-1&limit=50` | Ready | Open model popularity and release proxy. |
| Papers with Code | `https://paperswithcode.com/api/v1/papers/` | Planned | Local check returned HTML; verify current API contract before collector work. |
| X/Twitter | `https://developer.x.com/en/docs` | Needs credentials | Keep optional until credentials, cost, rate limits, and retention rules are approved. |

## Source Readiness Rules

- `ready`: direct fetch succeeds and output is RSS, Atom, JSON, or stable docs HTML.
- `scrape_required`: official HTML is fetchable but no stable feed was found.
- `needs_credentials`: API access needs credentials or paid quota approval.
- `planned`: useful source, but endpoint contract is not yet verified.
- `blocked`: direct collector fetch is blocked; use browser/manual fallback or defer.

## Relevance Scoring Rubric

| Signal | Weight | Notes |
| --- | ---: | --- |
| Source authority | 25 | Official lab/docs/status > official repo > reputable practitioner > community discussion. |
| Recency | 20 | Boost items inside 24h; decay after 7d unless repo velocity stays high. |
| Repo velocity | 20 | Stars, `pushed_at`, releases, issue/PR activity, and maintainer density. |
| Cross-source corroboration | 15 | Same topic appearing across official, GitHub, HN/arXiv/HF, or person feeds. |
| Developer impact | 15 | API/model/tooling changes that require migration or unlock workflows. |
| Novelty/risk adjustment | 5 | Penalize thin duplicates and unverified social-only claims; flag instead of suppressing. |

## Handoff Notes

- DataEngineer should implement `ready` sources first: OpenAI RSS/changelog/status, Anthropic release notes/status, DeepSeek docs/GitHub, Karpathy GitHub, Gemini changelog, Hugging Face blog/status/models API, GitHub API, HN, and arXiv.
- Stable P0 source ids for DataEngineer are listed in the P0 Seed Contract table. Do not invent missing rows; omit unavailable source types and use the stable alternatives.
- Scrapers should preserve canonical URL, title, author/source, published time, fetched time, content hash, and source readiness.
- Backend ranking should consume `importanceScore` on subjects and `authorityScore` on sources. Current scale: official/research/changelog `1.0`, official GitHub/status `0.9`, high-quality alternative `0.6-0.75`, gated social `0.2` until credentials exist.
- QA sampling should include stable source id checks, gated social `needs_credentials`, one `ready`, one `scrape_required`, one `planned`, and one `blocked/needs_credentials` source so operational states are visible in Source Coverage.
