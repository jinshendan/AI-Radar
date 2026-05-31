import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  RefreshCw,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { getRadarSnapshot } from "@/lib/radar-data";
import type {
  AgentLane,
  HotTopic,
  LabSignal,
  SourceHealth,
} from "@/lib/radar-data";

const confidenceStyles: Record<HotTopic["confidence"], string> = {
  High: "border-teal-200 bg-teal-50 text-teal-800",
  Medium: "border-indigo-200 bg-indigo-50 text-indigo-800",
  Watch: "border-amber-200 bg-amber-50 text-amber-800",
};

const priorityStyles: Record<LabSignal["priority"], string> = {
  Critical: "border-rose-200 bg-rose-50 text-rose-800",
  High: "border-amber-200 bg-amber-50 text-amber-800",
  Normal: "border-slate-200 bg-slate-50 text-slate-700",
};

const sourceStyles: Record<SourceHealth["status"], string> = {
  Ready: "text-teal-700",
  "Needs key": "text-amber-700",
  Planned: "text-slate-600",
};

const laneStyles: Record<AgentLane["status"], string> = {
  Ready: "border-teal-200 bg-teal-50 text-teal-800",
  "Waiting for agent": "border-slate-200 bg-white text-slate-700",
  Blocked: "border-rose-200 bg-rose-50 text-rose-800",
};

export default function Home() {
  const snapshot = getRadarSnapshot();
  const LogoIcon = snapshot.navItems[0].icon;
  const generated = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(snapshot.generatedAt));

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-teal-700 text-white">
                  <LogoIcon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-800">AI Hot Radar</p>
                  <h1 className="text-2xl font-semibold text-slate-950">
                    AI key-subject intelligence monitor
                  </h1>
                </div>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Track lab announcements, notable people, GitHub acceleration, and
                community discussion in one operational dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50">
                <RefreshCw className="size-4" aria-hidden="true" />
                Refresh
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Sources
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
            <nav className="flex flex-wrap gap-2" aria-label="Dashboard sections">
              {snapshot.navItems.map((item) => (
                <a
                  key={item.label}
                  href={`#${item.label.toLowerCase().replaceAll(" ", "-").replace("&", "and")}`}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 p-1">
              {["Today", "7 days", "30 days"].map((label, index) => (
                <button
                  key={label}
                  className={`h-8 rounded-md px-3 text-sm font-medium ${
                    index === 0
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Radar metrics"
        >
          {snapshot.metrics.map((metric) => (
            <div
              key={metric.id}
              className="min-h-32 rounded-md border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">
                    {metric.value}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-md bg-slate-100 text-teal-800">
                  <metric.icon className="size-5" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{metric.detail}</p>
            </div>
          ))}
        </section>

        <section id="radar" className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Radar</h2>
                <p className="text-sm text-slate-500">Last synthetic snapshot: {generated}</p>
              </div>
              <button className="inline-flex h-9 w-fit items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Filter className="size-4" aria-hidden="true" />
                Tune ranking
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {snapshot.hotTopics.map((topic) => (
                <article key={topic.id} className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-white">
                          {topic.score}
                        </span>
                        <span className="text-sm font-medium text-teal-700">
                          {topic.delta}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-1 text-xs font-medium ${confidenceStyles[topic.confidence]}`}
                        >
                          {topic.confidence}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-slate-950">
                        {topic.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {topic.summary}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:max-w-48 sm:justify-end">
                      {topic.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {topic.sources.map((source) => (
                      <span
                        key={source}
                        className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div
            id="people-and-labs"
            className="rounded-md border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 px-4 py-4">
              <h2 className="text-lg font-semibold text-slate-950">People & Labs</h2>
              <p className="text-sm text-slate-500">Official and high-signal subject feed</p>
            </div>
            <div className="divide-y divide-slate-100">
              {snapshot.labSignals.map((signal) => (
                <article key={signal.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-950">
                          {signal.subject}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {signal.kind}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-1 text-xs font-medium ${priorityStyles[signal.priority]}`}
                        >
                          {signal.priority}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold leading-5 text-slate-950">
                        {signal.title}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Clock3 className="size-3.5" aria-hidden="true" />
                      {signal.time}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{signal.summary}</p>
                  <a
                    href={signal.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-800 hover:text-teal-950"
                  >
                    {signal.source}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="github-hot" className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">GitHub Hot</h2>
              <p className="text-sm text-slate-500">AI repos ranked by velocity, activity, and relevance</p>
            </div>
            <a
              href="https://github.com/jinshendan/AI-Radar"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-fit items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Repository
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Repo</th>
                  <th className="px-4 py-3">Stars</th>
                  <th className="px-4 py-3">Growth</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Why hot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {snapshot.repoSignals.map((repo) => (
                  <tr key={repo.id} className="align-top">
                    <td className="px-4 py-4">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-slate-950 hover:text-teal-800"
                      >
                        {repo.owner}/{repo.name}
                      </a>
                      <p className="mt-1 max-w-sm text-sm leading-5 text-slate-600">
                        {repo.description}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">{repo.stars}</td>
                    <td className="px-4 py-4 text-teal-700">{repo.growth}</td>
                    <td className="px-4 py-4 text-slate-700">{repo.language}</td>
                    <td className="px-4 py-4">
                      <p className="max-w-md leading-5 text-slate-600">{repo.whyHot}</p>
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Activity: {repo.activity}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4">
              <h2 className="text-lg font-semibold text-slate-950">Source Coverage</h2>
              <p className="text-sm text-slate-500">Connector readiness for the MVP</p>
            </div>
            <div className="divide-y divide-slate-100">
              {snapshot.sourceHealth.map((source) => {
                const Icon = snapshot.sourceTypeIcons[source.type];
                const StatusIcon =
                  source.status === "Ready"
                    ? CheckCircle2
                    : source.status === "Needs key"
                      ? ShieldAlert
                      : Clock3;

                return (
                  <div key={source.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
                    <div className="flex gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{source.name}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-600">
                          {source.coverage}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 md:justify-end">
                      <span className="text-sm text-slate-500">{source.cadence}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-semibold ${sourceStyles[source.status]}`}
                      >
                        <StatusIcon className="size-4" aria-hidden="true" />
                        {source.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4">
              <h2 className="text-lg font-semibold text-slate-950">Agent Operating Mode</h2>
              <p className="text-sm text-slate-500">Execution lanes for parallel delivery</p>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {snapshot.agentLanes.map((lane) => (
                <div key={lane.id} className="min-h-44 rounded-md border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-950">{lane.name}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{lane.owner}</p>
                    </div>
                    <span
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${laneStyles[lane.status]}`}
                    >
                      {lane.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-5 text-slate-600">{lane.mission}</p>
                  <p className="mt-3 text-xs font-semibold uppercase text-slate-500">
                    Output
                  </p>
                  <p className="mt-1 text-sm text-slate-800">{lane.output}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
