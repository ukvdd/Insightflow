// components/InsightsPanel.tsx
"use client";

import { useState } from "react";

interface ConvergentSignal {
  signal: string;
  supporting_statement_ids: string[];
  across_frameworks: string[];
  confidence: string;
  explanation: string;
}

interface DivergentInsight {
  insight: string;
  source_framework: string;
  why_hidden: string;
  follow_up_question: string;
  supporting_statement_ids: string[];
}

interface Contradiction {
  tension: string;
  statement_ids: string[];
  implication: string;
}

interface Recommendations {
  deeper_investigation: string[];
  challenged_assumptions: string[];
  most_surprising: string;
}

interface Insights {
  convergent_signals: ConvergentSignal[];
  divergent_insights: DivergentInsight[];
  contradictions: Contradiction[];
  recommendations: Recommendations;
}

type TabKey = "convergent" | "divergent" | "contradictions" | "recommendations";

export default function InsightsPanel({ insights }: { insights: Insights }) {
  const [activeTab, setActiveTab] = useState<TabKey>("divergent");

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "convergent", label: "强信号", icon: "◉" },
    { key: "divergent", label: "盲区发现", icon: "◈" },
    { key: "contradictions", label: "矛盾点", icon: "⟡" },
    { key: "recommendations", label: "研究建议", icon: "→" },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-bg-tertiary/50 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              px-4 py-2 rounded-md text-sm transition-all duration-200
              ${
                activeTab === tab.key
                  ? "bg-bg-secondary text-text-primary font-medium shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }
            `}
          >
            <span className="mr-1.5 opacity-70">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Convergent Signals */}
      {activeTab === "convergent" && (
        <div className="space-y-4 stagger-children">
          {insights.convergent_signals.map((signal, i) => (
            <div
              key={i}
              className="bg-bg-secondary border border-border-subtle rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`
                  text-[11px] font-mono px-2.5 py-1 rounded-full
                  ${
                    signal.confidence === "VERY HIGH"
                      ? "bg-accent-green/15 text-accent-green border border-accent-green/20"
                      : "bg-accent-blue/15 text-accent-blue border border-accent-blue/20"
                  }
                `}
                >
                  {signal.confidence}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  跨框架: {signal.across_frameworks.join(" + ")}
                </span>
              </div>
              <p className="text-sm text-text-primary font-medium mb-2">
                {signal.signal}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {signal.explanation}
              </p>
              <div className="mt-3 flex gap-1.5">
                {signal.supporting_statement_ids.map((sid) => (
                  <span
                    key={sid}
                    className="text-[11px] font-mono text-text-muted bg-bg-tertiary px-2 py-0.5 rounded"
                  >
                    {sid}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Divergent Insights — the core value */}
      {activeTab === "divergent" && (
        <div className="space-y-4 stagger-children">
          <div className="px-4 py-3 rounded-lg bg-accent-amber/5 border border-accent-amber/15 mb-2">
            <p className="text-sm text-accent-amber">
              以下洞察只在特定分类视角下才能被发现 —— 这正是多视角分析的价值所在
            </p>
          </div>
          {insights.divergent_insights.map((item, i) => (
            <div
              key={i}
              className="bg-bg-secondary border border-accent-amber/15 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-accent-amber/15 text-accent-amber border border-accent-amber/20">
                  仅在 Framework {item.source_framework} 中可见
                </span>
              </div>
              <p className="text-sm text-text-primary font-medium mb-2">
                {item.insight}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                {item.why_hidden}
              </p>
              <div className="px-3.5 py-2.5 rounded-lg bg-bg-tertiary/70">
                <p className="text-sm text-text-secondary">
                  <span className="font-mono text-[11px] text-accent-green mr-2">
                    后续研究问题
                  </span>
                  {item.follow_up_question}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contradictions */}
      {activeTab === "contradictions" && (
        <div className="space-y-4 stagger-children">
          {insights.contradictions.map((item, i) => (
            <div
              key={i}
              className="bg-bg-secondary border border-accent-rose/15 rounded-xl p-5"
            >
              <p className="text-sm text-text-primary font-medium mb-2">
                {item.tension}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                {item.implication}
              </p>
              <div className="flex gap-1.5">
                {item.statement_ids.map((sid) => (
                  <span
                    key={sid}
                    className="text-[11px] font-mono text-text-muted bg-bg-tertiary px-2 py-0.5 rounded"
                  >
                    {sid}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {activeTab === "recommendations" && (
        <div className="space-y-5 stagger-children">
          <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
            <h4 className="text-xs font-mono text-accent-blue uppercase tracking-wider mb-3">
              需要深入调研的方向
            </h4>
            <div className="space-y-2.5">
              {insights.recommendations.deeper_investigation.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-text-secondary"
                >
                  <span className="text-accent-blue mt-0.5">→</span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5">
            <h4 className="text-xs font-mono text-accent-rose uppercase tracking-wider mb-3">
              被挑战的假设
            </h4>
            <div className="space-y-2.5">
              {insights.recommendations.challenged_assumptions.map(
                (item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-text-secondary"
                  >
                    <span className="text-accent-rose mt-0.5">✕</span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="bg-bg-secondary border border-accent-amber/20 rounded-xl p-5">
            <h4 className="text-xs font-mono text-accent-amber uppercase tracking-wider mb-3">
              最令人意外的发现
            </h4>
            <p className="text-sm text-text-primary leading-relaxed">
              {insights.recommendations.most_surprising}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
