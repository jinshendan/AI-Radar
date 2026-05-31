import {
  Activity,
  Bell,
  BookOpen,
  Bot,
  Building2,
  Code2,
  GitPullRequestArrow,
  Newspaper,
  Radar,
  Rss,
  Star,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TrendWindow = "today" | "7d" | "30d";

export type HotTopic = {
  id: string;
  title: string;
  summary: string;
  score: number;
  delta: string;
  confidence: "High" | "Medium" | "Watch";
  tags: string[];
  sources: string[];
};

export type LabSignal = {
  id: string;
  subject: string;
  kind: "Lab" | "Person" | "Project";
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  time: string;
  priority: "Critical" | "High" | "Normal";
};

export type RepoSignal = {
  id: string;
  name: string;
  owner: string;
  description: string;
  stars: string;
  growth: string;
  language: string;
  activity: string;
  whyHot: string;
  url: string;
};

export type SourceHealth = {
  id: string;
  name: string;
  type: "Official" | "Code" | "Community" | "Social";
  status: "Ready" | "Needs key" | "Planned";
  cadence: string;
  coverage: string;
};

export type AgentLane = {
  id: string;
  name: string;
  owner: string;
  mission: string;
  output: string;
  status: "Ready" | "Waiting for agent" | "Blocked";
};

export type RadarMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export function getRadarSnapshot() {
  return {
    generatedAt: "2026-05-31T09:40:00Z",
    window: "today" satisfies TrendWindow,
    metrics: [
      {
        id: "topics",
        label: "Active Topics",
        value: "18",
        detail: "6 are acceleration signals",
        icon: Radar,
      },
      {
        id: "repos",
        label: "Tracked Repos",
        value: "42",
        detail: "12 fast-rising candidates",
        icon: Star,
      },
      {
        id: "subjects",
        label: "People & Labs",
        value: "24",
        detail: "10 core accounts in MVP",
        icon: Users,
      },
      {
        id: "sources",
        label: "Source Feeds",
        value: "9",
        detail: "6 stable, 3 gated",
        icon: Activity,
      },
    ] satisfies RadarMetric[],
    hotTopics: [
      {
        id: "agentic-coding",
        title: "Agentic coding workflows keep converging on repo-native tools",
        summary:
          "Coding agents, eval harnesses, and repo-level automation are showing up together across labs, GitHub projects, and developer discussions.",
        score: 94,
        delta: "+18%",
        confidence: "High",
        tags: ["agents", "coding", "evals"],
        sources: ["GitHub", "HN", "Lab blogs"],
      },
      {
        id: "long-context",
        title: "Long-context model releases are shifting app architecture",
        summary:
          "Teams are testing retrieval-light workflows, larger project context windows, and new failure modes around stale or conflicting context.",
        score: 88,
        delta: "+11%",
        confidence: "Medium",
        tags: ["models", "context", "RAG"],
        sources: ["OpenAI", "Anthropic", "arXiv"],
      },
      {
        id: "local-inference",
        title: "Local inference stacks are becoming product features",
        summary:
          "Open-weight models, small-device deployments, and privacy messaging are increasingly tied to mainstream developer tools.",
        score: 81,
        delta: "+9%",
        confidence: "Watch",
        tags: ["local AI", "open weights", "infra"],
        sources: ["Hugging Face", "GitHub", "Papers"],
      },
    ] satisfies HotTopic[],
    labSignals: [
      {
        id: "openai",
        subject: "OpenAI",
        kind: "Lab",
        title: "Official updates and product changelogs need first-class tracking",
        summary:
          "MVP should monitor blog, research, product, and developer changelog surfaces separately so releases do not bury research signals.",
        source: "Official site",
        sourceUrl: "https://openai.com/news/",
        time: "09:20",
        priority: "Critical",
      },
      {
        id: "anthropic",
        subject: "Anthropic",
        kind: "Lab",
        title: "Model, safety, and API updates are high-signal feeds",
        summary:
          "Anthropic posts often map directly to developer behavior changes, so the monitor should summarize product and research implications.",
        source: "News",
        sourceUrl: "https://www.anthropic.com/news",
        time: "08:45",
        priority: "High",
      },
      {
        id: "karpathy",
        subject: "Andrej Karpathy",
        kind: "Person",
        title: "Karpathy-style personal feeds should be configurable",
        summary:
          "Key individuals need a per-person source bundle: X/Twitter when available, GitHub, YouTube, blog, and linked project repos.",
        source: "Config target",
        sourceUrl: "https://github.com/karpathy",
        time: "08:10",
        priority: "High",
      },
    ] satisfies LabSignal[],
    repoSignals: [
      {
        id: "openai-cookbook",
        name: "openai-cookbook",
        owner: "openai",
        description: "Examples and guides for building with OpenAI APIs.",
        stars: "70k+",
        growth: "+1.8k / 30d",
        language: "MDX / Python",
        activity: "High",
        whyHot: "Often reflects new API patterns before they are widely copied.",
        url: "https://github.com/openai/openai-cookbook",
      },
      {
        id: "transformers",
        name: "transformers",
        owner: "huggingface",
        description: "Model library and ecosystem hub for modern AI workflows.",
        stars: "140k+",
        growth: "+2.4k / 30d",
        language: "Python",
        activity: "Very high",
        whyHot: "Good proxy for model and inference ecosystem direction.",
        url: "https://github.com/huggingface/transformers",
      },
      {
        id: "langgraph",
        name: "langgraph",
        owner: "langchain-ai",
        description: "Framework for stateful, multi-actor agent applications.",
        stars: "10k+",
        growth: "+900 / 30d",
        language: "Python / TS",
        activity: "High",
        whyHot: "Directly aligned with agent workflow adoption.",
        url: "https://github.com/langchain-ai/langgraph",
      },
    ] satisfies RepoSignal[],
    sourceHealth: [
      {
        id: "official-rss",
        name: "Official blogs / RSS",
        type: "Official",
        status: "Ready",
        cadence: "Hourly",
        coverage: "OpenAI, Anthropic, DeepMind, Meta AI, Mistral",
      },
      {
        id: "github",
        name: "GitHub repos / orgs",
        type: "Code",
        status: "Ready",
        cadence: "Hourly",
        coverage: "Repos, releases, stars, issues, pull requests",
      },
      {
        id: "hn",
        name: "Hacker News",
        type: "Community",
        status: "Ready",
        cadence: "2 hours",
        coverage: "AI-linked submissions and discussion volume",
      },
      {
        id: "twitter",
        name: "X / Twitter",
        type: "Social",
        status: "Needs key",
        cadence: "Configurable",
        coverage: "Official labs and key people after API access",
      },
      {
        id: "arxiv",
        name: "arXiv / Papers",
        type: "Official",
        status: "Planned",
        cadence: "Daily",
        coverage: "cs.AI, cs.CL, cs.LG and selected authors",
      },
    ] satisfies SourceHealth[],
    agentLanes: [
      {
        id: "leader",
        name: "Leader",
        owner: "@Leader",
        mission: "Own scope, dependencies, task graph, integration, and reporting.",
        output: "Execution plan, task board, acceptance checks",
        status: "Ready",
      },
      {
        id: "intel",
        name: "IntelScout",
        owner: "TBD",
        mission: "Map high-value labs, people, repos, and stable source feeds.",
        output: "Source registry and scoring rubric",
        status: "Waiting for agent",
      },
      {
        id: "data",
        name: "DataEngineer",
        owner: "TBD",
        mission: "Implement collectors, normalization, storage, and scheduler.",
        output: "Ingestion pipeline and data contracts",
        status: "Waiting for agent",
      },
      {
        id: "backend",
        name: "BackendEngineer",
        owner: "TBD",
        mission: "Build ranking, clustering, summaries, and API routes.",
        output: "Radar API and scoring service",
        status: "Waiting for agent",
      },
      {
        id: "frontend",
        name: "FrontendEngineer",
        owner: "TBD",
        mission: "Ship Radar, People & Labs, and GitHub Hot dashboard views.",
        output: "Responsive dashboard UI",
        status: "Waiting for agent",
      },
      {
        id: "qa",
        name: "QAReviewer",
        owner: "TBD",
        mission: "Validate source accuracy, ranking stability, tests, and docs.",
        output: "QA report and release checklist",
        status: "Waiting for agent",
      },
    ] satisfies AgentLane[],
    navItems: [
      { label: "Radar", icon: Radar },
      { label: "People & Labs", icon: Building2 },
      { label: "GitHub Hot", icon: Code2 },
      { label: "Alerts", icon: Bell },
    ],
    sourceTypeIcons: {
      Official: Newspaper,
      Code: GitPullRequestArrow,
      Community: Rss,
      Social: Bot,
    } satisfies Record<SourceHealth["type"], LucideIcon>,
    readingIcon: BookOpen,
  };
}

export function getRadarApiSnapshot() {
  const snapshot = getRadarSnapshot();

  return {
    generatedAt: snapshot.generatedAt,
    window: snapshot.window,
    metrics: snapshot.metrics.map((metric) => ({
      id: metric.id,
      label: metric.label,
      value: metric.value,
      detail: metric.detail,
    })),
    hotTopics: snapshot.hotTopics,
    labSignals: snapshot.labSignals,
    repoSignals: snapshot.repoSignals,
    sourceHealth: snapshot.sourceHealth,
    agentLanes: snapshot.agentLanes,
  };
}
