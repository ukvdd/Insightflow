// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import ResultsLayout from "@/components/ResultsLayout";
import LoadingState from "@/components/LoadingState";
import sampleResult from "@/lib/sampleResult.json";

interface AnalysisResult {
  statements: Array<{
    id: string;
    participant?: string;
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
    cross_participant_patterns?: {
      shared_across_multiple: Array<{
        pattern: string;
        participants: string[];
        strength: string;
      }>;
      unique_to_individual: Array<{
        pattern: string;
        participant: string;
        why_notable: string;
      }>;
      subgroups: Array<{
        group_description: string;
        participants: string[];
        shared_pattern: string;
      }>;
    };
  };
}

interface SavedAnalysis {
  timestamp: string;
  inputSummary: string;
  result: AnalysisResult;
}

const STORAGE_KEY = "insightflow_last_analysis";

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${month}月${day}日 ${hours}:${minutes}`;
}

function loadFromStorage(): SavedAnalysis | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedAnalysis;
  } catch {
    return null;
  }
}

function saveToStorage(result: AnalysisResult, transcript: string): SavedAnalysis {
  const uniqueParticipants = Array.from(
    new Set(result.statements.filter((s) => s.participant).map((s) => s.participant as string))
  );
  const inputSummary =
    uniqueParticipants.length > 1
      ? `${uniqueParticipants.length} 份访谈，共 ${transcript.length.toLocaleString()} 字`
      : `共 ${transcript.length.toLocaleString()} 字`;

  const saved: SavedAnalysis = {
    timestamp: new Date().toISOString(),
    inputSummary,
    result,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
  }
  return saved;
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

type ViewMode = "input" | "loading" | "results";

const SAMPLE_TRANSCRIPT = `=== 受访者1 ===
小A（25岁，互联网公司运营，上海）

说实话我也不太确定自己到底需不需要管理饮食，感觉身体还行，就是偶尔觉得累。我妈一直跟我说要吃维生素，但我觉得我还年轻，饮食也还算均衡。最近工作压力大，老觉得累，同事推荐我试试一些补充品，我就随便买了点。

我在小红书上看了很多，但越看越迷茫。每个人推荐的都不一样，有些说这个牌子好，有些说那个成分更重要。我根本不知道该信谁。很多看起来像是广告，我分不清哪些是真实的用户体验。

我下载了两个app看了看，一个界面太复杂了我直接卸载了。另一个还行，但让我做了一个很长的问卷，填到一半我就放弃了。我不想花那么多时间在这上面。

其实我最信任的是我一个做医生的朋友，她说大部分人其实不需要额外补充，均衡饮食就够了。但她也说如果真的觉得累，可以去查一下是不是缺铁或者缺B族。这让我更纠结了——到底要不要去查？

下午三点多的时候是最难熬的，开完会特别疲惫，就想吃点什么。办公室零食柜里有芒果干和饼干，我一般都会去拿一包。吃的时候觉得很满足，但吃完又有点罪恶感，觉得自己怎么又没忍住。

有一次被老板批评了方案要重做，当时特别沮丧，一气之下点了两杯奶茶。喝的时候觉得是犒劳自己，但喝完就后悔了，看到镜子里自己的脸就更烦了。我知道这样不好，但那个瞬间真的控制不住。

我试过记录每天吃了什么，用一个热量计算的app，但太麻烦了。每顿饭都要搜食物、估分量，坚持了不到一周就放弃了。我觉得如果有个东西能帮我简单记录，不用那么精确，我可能还能坚持一下。

晚上回家路上我经常会买一瓶酸奶或者果味牛奶，基本上每天都会喝。不是特别饿，就是觉得上了一天班挺累的，喝点东西会开心一点。周末更是，窝在家看剧的时候一定要嗑瓜子喝饮料。

=== 受访者2 ===
小B（28岁，金融公司分析师，北京）

我之前试过好几次减肥，最长的一次坚持了两个月。一开始效果很明显，但后来遇到一个项目特别忙，加班到很晚，根本没精力管饮食。等忙完那阵子回来一看，反弹了，比之前还重了两斤。当时特别泄气。

我觉得最大的问题是我的饮食太不规律了。有时候忙起来中午一点半才吃午饭，有时候晚上加班到九点直接点个夜宵当晚饭。完全没有固定的节奏。而且吃外卖嘛，选来选去也就那几样，想健康一点但选择太少了。

我试过自己带饭，坚持了大概两周吧。周末花半天做meal prep，周一周二还行，到周三那个饭已经不太新鲜了，而且做的也不好吃。然后某天加班到很晚，第二天早上根本起不来做饭，就断了。

社交场合是最难控制的。同事经常约着一起吃饭，大家都点那种重油重盐的东西，我不好意思点个沙拉。而且有时候周末朋友聚餐，去的都是火锅烧烤那种，你不吃人家觉得你扫兴。每次回来都告诉自己下周要少吃，但下周还是一样。

我觉得我不缺知识，什么该吃什么不该吃我都知道。热量计算我也会，但就是做不到。中间那个gap太大了。而且一旦某一天没控制住，就觉得"算了，今天已经破戒了"，然后索性放开吃。第二天又重新开始一个cycle。

有一个让我很受挫的事情是，我之前用的app会在我吃超标的时候给我发提醒，那个措辞特别让人不舒服，什么"今日热量已超标30%"。我知道啊！你提醒我只会让我更焦虑更想吃。后来我就卸载了。

我其实想要的是一个不那么judge我的东西。比如说我今天确实吃多了，它不要批评我，而是告诉我"没关系，明天可以怎么调整"。或者说给我一些实际的小建议，比如下午饿了可以吃什么替代零食，而不是一刀切地说不能吃。

运动方面我以前会跑步，一般周天下午去黄浦江边跑三到五公里。对我来说跑步不纯粹是运动，更像是去一个环境好的地方放松一下。但这两个月项目忙就没去了。我觉得如果能把日常走路、上下班骑车这些也算进去，我心理上会好受很多，不会觉得自己什么运动都没做。

=== 受访者3 ===
小C（32岁，创业公司产品经理，深圳）

我怀孕的时候其实管理得特别好，每天步行至少半小时，饮食结构上碳水少一些，肉和蔬菜多一些，再加上散步和瑜伽。那段时间感觉自己很有掌控感。但生完孩子之后，一切都乱了。现在每天的时间被孩子和工作切碎了，根本没有完整的时间段做任何计划。

我试过几个健康管理的app，有个问题是它们都默认你有固定的日程——早上几点吃早餐、中午几点运动。但我的生活完全不是这样的。有时候孩子半夜哭闹没睡好，第二天根本不想运动，但app还是照样给我推提醒，让我觉得更焦虑更内疚。

我邻居经常在楼下跳操，带操的是一个比我大几岁的姐姐，跳得特别好，而且对健康生活这件事态度很积极。我跟她一起跳了几次，感觉比看视频课程里的老师有意思多了。她是一个真实的、就在身边的榜样，跟她在一起会被鼓舞，觉得自己也可以做到。后来她搬走了，我就再也没跳过。

有一件事我一直很困惑：我知道情绪不好的时候不应该靠吃来解决，但有时候晚上把孩子哄睡之后，那是我一天唯一属于自己的时间，我就是想吃点好吃的犒劳自己。你说这算情绪性进食吗？我觉得这对我的心理健康是有益的，但对体重管理肯定不好。这两个之间怎么平衡？

我老公完全不理解我为什么这么纠结。他说"想吃就吃呗，又不胖"。但他不知道我每次吃完夜宵之后的那种焦虑感。我不是怕胖，我是怕自己形成一种依赖——每次压力大就只能靠吃来缓解，好像除了吃就没有别的方法了。

我其实很喜欢逛超市。下班之后骑自行车去那个离家八百米的超市，一周去三四次。对我来说这是一个解压的过程，不一定要买什么，就是在那个环境里走一走看一看，会觉得放松。但有时候逛着逛着就买了一堆零食回来，然后那个星期就吃得特别不健康。

如果有个东西能帮我的话，我希望它首先是灵活的。不要给我一个死的计划让我每天打卡，因为我的生活根本不允许。我更需要的是那种——我今天状态好就多做一点，状态不好就少做一点，但整体来看这一周还是在往好的方向走。而且它要理解我，不是站在一个评判者的角度，而是像朋友一样。

睡眠对我来说其实比运动更重要。如果我睡不好，第二天什么都不想做，更别说运动了。但大部分app只关注饮食和运动，没有人在乎我到底睡了几个小时。我觉得如果一个产品能把睡眠、饮食、情绪这三个东西联系起来看，而不是分开一个个管理，可能会更有帮助。`;

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("input");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAnalysis, setSavedAnalysis] = useState<SavedAnalysis | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Load saved analysis on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setSavedAnalysis(saved);
      setShowBanner(true);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;

    // Sample transcript shortcut: skip API and use the pre-computed result
    if (transcript.trim() === SAMPLE_TRANSCRIPT.trim()) {
      const data = sampleResult as AnalysisResult;
      const saved = saveToStorage(data, transcript);
      setSavedAnalysis(saved);
      setResult(data);
      setViewMode("results");
      return;
    }

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

      const saved = saveToStorage(data, transcript);
      setSavedAnalysis(saved);
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

  const handleRestoreAnalysis = () => {
    if (savedAnalysis) {
      setResult(savedAnalysis.result);
      setViewMode("results");
      setShowBanner(false);
    }
  };

  const handleClearCache = () => {
    clearStorage();
    setSavedAnalysis(null);
    setShowBanner(false);
    handleReset();
  };

  const handleLoadSample = () => {
    setTranscript(SAMPLE_TRANSCRIPT);
  };

  return (
    <main className="min-h-screen flex flex-col">
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
              className="text-sm text-text-muted hover:text-text-primary transition-colors px-4 py-2 rounded-lg hover:bg-bg-tertiary border border-transparent hover:border-border-subtle"
            >
              ← 新的分析
            </button>
          )}
        </div>
      </header>

      {/* Input View */}
      {viewMode === "input" && (
        <div className="max-w-3xl mx-auto px-6 py-16 w-full animate-fade-up">
          {/* Restore banner */}
          {showBanner && savedAnalysis && (
            <div
              className="mb-8 flex items-center justify-between rounded-xl px-4 py-3"
              style={{ backgroundColor: "#E6F1FB", border: "1px solid #BFDBF7" }}
            >
              <p className="text-sm" style={{ color: "#0C447C" }}>
                你有一份上次的分析结果（{formatTimestamp(savedAnalysis.timestamp)}
                {savedAnalysis.inputSummary ? `，${savedAnalysis.inputSummary}` : ""}）
              </p>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <button
                  onClick={handleRestoreAnalysis}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: "#185FA5", color: "white" }}
                >
                  查看结果
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="text-sm transition-colors"
                  style={{ color: "#4A87C5" }}
                >
                  忽略
                </button>
              </div>
            </div>
          )}

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
              placeholder="将访谈逐字稿粘贴到这里，支持单个或多个受访者，AI 会自动识别..."
              className="w-full h-72 bg-white border border-border-subtle rounded-xl px-5 py-4 text-sm text-text-primary leading-relaxed focus:outline-none focus:border-border-active focus:ring-2 focus:ring-accent-amber/15 resize-none transition-all shadow-sm"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted">
                {transcript.length > 0
                  ? `${transcript.length} 字`
                  : "建议 500-3000 字"}
              </span>
              <span className="text-xs text-text-muted">
                多位受访者？用{" "}
                <code className="font-mono bg-bg-tertiary px-1.5 py-0.5 rounded text-[11px] text-text-secondary border border-border-subtle">
                  === 受访者2 ===
                </code>{" "}
                分隔每段逐字稿
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
                  : "bg-bg-tertiary text-text-muted cursor-not-allowed border border-border-subtle"
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
        <div className="flex flex-col flex-1 overflow-hidden animate-fade-up">
          {/* Slim stats bar */}
          <div className="shrink-0 border-b border-border-subtle px-6 py-2 flex items-center gap-5">
            <span className="text-[11px] font-mono text-text-muted">
              <span className="text-text-primary font-semibold">{result.statements.length}</span> 条语句
            </span>
            <span className="w-px h-4 bg-border-subtle" />
            <span className="text-[11px] font-mono text-text-muted">
              <span className="text-text-primary font-semibold">{result.classification.frameworks.length}</span> 个视角
            </span>
            <span className="w-px h-4 bg-border-subtle" />
            <span className="text-[11px] font-mono text-text-muted">
              <span className="font-semibold" style={{ color: "#993C1D" }}>{result.insights.divergent_insights.length}</span> 个盲区
            </span>
            <span className="w-px h-4 bg-border-subtle" />
            <span className="text-[11px] font-mono text-text-muted">
              <span className="font-semibold" style={{ color: "#854F0B" }}>{result.insights.contradictions.length}</span> 处矛盾
            </span>
            {/* Spacer */}
            <span className="flex-1" />
            {/* Clear cache */}
            {savedAnalysis && (
              <button
                onClick={handleClearCache}
                className="text-[11px] font-mono text-text-muted hover:text-accent-rose transition-colors"
              >
                清除缓存
              </button>
            )}
          </div>

          {/* Layout */}
          <ResultsLayout
            statements={result.statements}
            frameworks={result.classification.frameworks}
            insights={result.insights}
          />
        </div>
      )}
    </main>
  );
}
