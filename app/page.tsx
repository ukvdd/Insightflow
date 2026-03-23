// app/page.tsx
"use client";

import { useState } from "react";
import AffinityBoard from "@/components/AffinityBoard";
import InsightsPanel from "@/components/InsightsPanel";
import LoadingState from "@/components/LoadingState";

interface AnalysisResult {
  statements: Array<{
    id: string;
    original_text: string;
    signal_type: string;
    annotation: string;
  }>;
  classification: {
    frameworks: Array<{
      id: string;
      name: string;
      lens: string;
      themes: Array<{
        theme_name: string;
        description: string;
        statement_ids: string[];
        theme_insight: string;
      }>;
    }>;
  };
  insights: {
    convergent_signals: Array<{
      signal: string;
      supporting_statement_ids: string[];
      across_frameworks: string[];
      confidence: string;
      explanation: string;
    }>;
    divergent_insights: Array<{
      insight: string;
      source_framework: string;
      why_hidden: string;
      follow_up_question: string;
      supporting_statement_ids: string[];
    }>;
    contradictions: Array<{
      tension: string;
      statement_ids: string[];
      implication: string;
    }>;
    recommendations: {
      deeper_investigation: string[];
      challenged_assumptions: string[];
      most_surprising: string;
    };
  };
}

type ViewMode = "input" | "loading" | "results";
type ResultTab = "affinity" | "insights" | "statements";

const SAMPLE_TRANSCRIPT = `访谈者：你平时是怎么决定要不要买营养补充品的？

受访者：说实话我也不太确定自己到底需不需要。我妈一直跟我说要吃维生素，但我觉得我还年轻，饮食也还算均衡。不过最近工作压力大，老觉得累，同事推荐我试试一些补充品。

访谈者：那你后来有去了解过吗？

受访者：有啊，我在小红书上看了很多，但越看越迷茫。每个人推荐的都不一样，有些说这个牌子好，有些说那个成分更重要。我根本不知道该信谁。而且很多看起来像是广告，我分不清哪些是真实的用户体验。

访谈者：那最后你是怎么做决定的？

受访者：我其实到现在都没买。我下载了两个app看了看，一个界面太复杂了我直接卸载了。另一个还行，但让我做了一个很长的问卷，填到一半我就放弃了。我觉得我只是想有个人能直接告诉我"你就吃这个就行了"，而不是让我自己研究。

访谈者：你提到同事推荐，身边人的意见对你影响大吗？

受访者：很大。其实我最信任的是我一个做医生的朋友，她说大部分人其实不需要额外补充，均衡饮食就够了。但她也说如果真的觉得累，可以查一下是不是缺铁或者缺B族。这让我更纠结了，因为去医院查又觉得小题大做。

访谈者：如果有一个产品能解决你的顾虑，你觉得它应该是什么样的？

受访者：我觉得首先它不能给我太多选择，选择太多我就焦虑。最好是能根据我的情况直接推荐一两个方案。然后我需要知道为什么推荐这个给我，不是那种很玄的说法，而是有科学依据的解释。还有就是价格要透明，我很讨厌那种先免费试用然后不知不觉就订阅了的模式。`;

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("input");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeResultTab, setActiveResultTab] =
    useState<ResultTab>("affinity");
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;

    setViewMode("loading");
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "分析失败");
      }

      setResult(data);
      setViewMode("results");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "分析过程出错，请重试";
      setError(message);
      setViewMode("input");
    }
  };

  const handleReset = () => {
    setViewMode("input");
    setResult(null);
    setError(null);
  };

  const handleLoadSample = () => {
    setTranscript(SAMPLE_TRANSCRIPT);
  };

  return (
    <main className="min-h-screen">
      {/* Header — always visible */}
      <header className="border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-amber/15 flex items-center justify-center">
              <span className="text-accent-amber text-sm">◈</span>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">
                访谈洞察助手
              </h1>
              <p className="text-[11px] font-mono text-text-muted tracking-wide">
                Multi-Perspective Interview Analysis
              </p>
            </div>
          </div>
          {viewMode === "results" && (
            <button
              onClick={handleReset}
              className="text-sm text-text-muted hover:text-text-primary transition-colors px-4 py-2 rounded-lg hover:bg-bg-tertiary"
            >
              ← 新的分析
            </button>
          )}
        </div>
      </header>

      {/* Input View */}
      {viewMode === "input" && (
        <div className="max-w-3xl mx-auto px-6 py-16 animate-fade-up">
          {/* Hero */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-3 tracking-tight">
              从访谈逐字稿到
              <span className="text-accent-amber">多维度洞察</span>
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
              粘贴访谈逐字稿，AI 将自动提取关键语句，并从三种不同的分析视角生成亲和图分类。帮助你发现单一视角下容易被忽略的
              pattern。
            </p>
          </div>

          {/* Text Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-secondary">
                访谈逐字稿
              </label>
              <button
                onClick={handleLoadSample}
                className="text-xs text-text-muted hover:text-accent-amber transition-colors font-mono"
              >
                加载示例数据 →
              </button>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="将访谈逐字稿粘贴到这里..."
              className="w-full h-72 bg-bg-secondary border border-border-subtle rounded-xl px-5 py-4 text-sm text-text-primary leading-relaxed placeholder:text-text-muted/50 focus:outline-none focus:border-border-active focus:ring-1 focus:ring-border-active/30 resize-none transition-all"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted">
                {transcript.length > 0
                  ? `${transcript.length} 字`
                  : "建议 500-3000 字"}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-accent-rose/10 border border-accent-rose/20">
              <p className="text-sm text-accent-rose">{error}</p>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={transcript.trim().length < 50}
            className={`
              mt-6 w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${
                transcript.trim().length >= 50
                  ? "bg-accent-amber text-bg-primary hover:bg-accent-amber/90 shadow-lg shadow-accent-amber/10"
                  : "bg-bg-tertiary text-text-muted cursor-not-allowed"
              }
            `}
          >
            开始分析
          </button>

          {/* How it works */}
          <div className="mt-14 grid grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "语句提取",
                desc: "AI 识别逐字稿中包含痛点、情绪、行为描述的关键语句",
              },
              {
                step: "02",
                title: "多维度分类",
                desc: "同一批语句分别按用户旅程、动机情绪、数据驱动框架进行分类",
              },
              {
                step: "03",
                title: "跨视角洞察",
                desc: "对比三种分类，发现强信号、盲区洞察和矛盾点",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-xl bg-bg-secondary/50 border border-border-subtle"
              >
                <span className="font-mono text-xs text-accent-amber">
                  {item.step}
                </span>
                <h3 className="text-sm font-semibold mt-2 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading View */}
      {viewMode === "loading" && <LoadingState />}

      {/* Results View */}
      {viewMode === "results" && result && (
        <div className="max-w-6xl mx-auto px-6 py-8 animate-fade-up">
          {/* Result Stats Bar */}
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-border-subtle">
            <div>
              <span className="text-xs font-mono text-text-muted block mb-0.5">
                提取语句
              </span>
              <span className="text-lg font-semibold">
                {result.statements.length}
              </span>
            </div>
            <div className="w-px h-8 bg-border-subtle" />
            <div>
              <span className="text-xs font-mono text-text-muted block mb-0.5">
                分类视角
              </span>
              <span className="text-lg font-semibold">
                {result.classification.frameworks.length}
              </span>
            </div>
            <div className="w-px h-8 bg-border-subtle" />
            <div>
              <span className="text-xs font-mono text-text-muted block mb-0.5">
                盲区洞察
              </span>
              <span className="text-lg font-semibold text-accent-amber">
                {result.insights.divergent_insights.length}
              </span>
            </div>
            <div className="w-px h-8 bg-border-subtle" />
            <div>
              <span className="text-xs font-mono text-text-muted block mb-0.5">
                矛盾点
              </span>
              <span className="text-lg font-semibold text-accent-rose">
                {result.insights.contradictions.length}
              </span>
            </div>
          </div>

          {/* Result Tabs */}
          <div className="flex gap-1 mb-8 p-1 bg-bg-tertiary/50 rounded-lg w-fit">
            {(
              [
                { key: "affinity", label: "亲和图分类" },
                { key: "insights", label: "跨视角洞察" },
                { key: "statements", label: "原始语句" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveResultTab(tab.key)}
                className={`
                  px-5 py-2.5 rounded-md text-sm transition-all duration-200
                  ${
                    activeResultTab === tab.key
                      ? "bg-bg-secondary text-text-primary font-medium shadow-sm"
                      : "text-text-muted hover:text-text-secondary"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Affinity Board — two-panel layout */}
          {activeResultTab === "affinity" && (
            <div className="flex gap-0 items-start">
              {/* Collapsible Left Panel */}
              <div
                className="flex-shrink-0 border-r border-border-subtle transition-all duration-200 overflow-hidden"
                style={{ width: leftPanelOpen ? 220 : 40 }}
              >
                {/* Toggle button */}
                <button
                  onClick={() => setLeftPanelOpen((v) => !v)}
                  className="w-full flex items-center justify-center h-10 text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                  title={leftPanelOpen ? "收起原始语句" : "展开原始语句"}
                >
                  {leftPanelOpen ? (
                    <span className="text-xs font-mono">←</span>
                  ) : (
                    <span className="text-xs font-mono rotate-90 inline-block leading-none">原始</span>
                  )}
                </button>

                {/* Statement list */}
                {leftPanelOpen && (
                  <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
                    <div className="px-3 pb-3 space-y-2">
                      {result.statements.map((stmt) => (
                        <div
                          key={stmt.id}
                          className="bg-bg-secondary border border-border-subtle rounded-lg p-2.5 hover:border-border-active transition-colors"
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div
                              className="flex items-center justify-center rounded-full bg-bg-tertiary text-text-muted font-mono flex-shrink-0"
                              style={{ width: 22, height: 22, fontSize: 11 }}
                            >
                              {stmt.id.replace(/\D/g, "")}
                            </div>
                            <span
                              className="font-mono text-text-muted truncate"
                              style={{ fontSize: 13 }}
                            >
                              {stmt.signal_type}
                            </span>
                          </div>
                          <p className="text-text-secondary leading-snug line-clamp-2" style={{ fontSize: 13 }}>
                            {stmt.original_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0 pl-6">
                <AffinityBoard
                  frameworks={result.classification.frameworks}
                  statements={result.statements}
                />
              </div>
            </div>
          )}

          {/* Insights Panel */}
          {activeResultTab === "insights" && (
            <InsightsPanel insights={result.insights} />
          )}

          {/* Raw Statements */}
          {activeResultTab === "statements" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
              {result.statements.map((stmt) => (
                <div
                  key={stmt.id}
                  className="bg-bg-secondary border border-border-subtle rounded-xl p-4 hover:border-border-active transition-colors"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-xs text-text-muted">
                      {stmt.id}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-bg-tertiary text-text-muted">
                      {stmt.signal_type}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed mb-2.5">
                    &ldquo;{stmt.original_text}&rdquo;
                  </p>
                  <p className="text-xs text-text-muted">{stmt.annotation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
