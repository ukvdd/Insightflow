// components/LoadingState.tsx
"use client";

import { useState, useEffect } from "react";

const STAGES = [
  {
    label: "Stage 1: 语句提取",
    description: "正在从逐字稿中识别有分析价值的语句...",
  },
  {
    label: "Stage 2: 多维度分类",
    description: "正在用三种不同框架对语句进行分类...",
  },
  {
    label: "Stage 3: 跨视角洞察",
    description: "正在综合分析，寻找强信号与盲区洞察...",
  },
];

export default function LoadingState() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setCurrentStage(1), 12000);
    const t2 = setTimeout(() => setCurrentStage(2), 25000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto py-20">
      <div className="space-y-4">
        {STAGES.map((stage, i) => {
          const isActive = i === currentStage;
          const isDone = i < currentStage;

          return (
            <div
              key={i}
              className={`
                flex items-start gap-4 px-5 py-4 rounded-xl transition-all duration-500
                ${isActive ? "bg-white border border-border-subtle shadow-sm" : ""}
                ${isDone ? "opacity-50" : ""}
                ${!isActive && !isDone ? "opacity-30" : ""}
              `}
            >
              <div className="mt-1">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center">
                    <span className="text-accent-green text-xs">✓</span>
                  </div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full bg-accent-amber/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent-amber animate-pulse-dot" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-bg-tertiary" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${isActive ? "text-text-primary" : "text-text-muted"}`}
                >
                  {stage.label}
                </p>
                {isActive && (
                  <p className="text-xs text-text-muted mt-1">
                    {stage.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-8 h-0.5 bg-border-subtle rounded-full overflow-hidden">
        <div className="h-full w-1/4 bg-accent-amber/60 rounded-full animate-loading-bar" />
      </div>

      <p className="text-center text-xs text-text-muted mt-4">
        分析通常需要 30-60 秒，取决于逐字稿长度
      </p>
    </div>
  );
}
