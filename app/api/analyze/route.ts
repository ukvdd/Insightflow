// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { STAGE_1_PROMPT, STAGE_2_PROMPT, STAGE_3_PROMPT } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Call Claude with an assistant prefill character ("[" or "{").
 * This forces the model to continue from that character, guaranteeing
 * no markdown fences, no preamble prose — just raw JSON from the first char.
 */
async function callClaude(
  systemPrompt: string,
  userMessage: string,
  prefill: "[" | "{"
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    system: systemPrompt,
    messages: [
      { role: "user", content: userMessage },
      { role: "assistant", content: prefill },
    ],
  });

  if (response.stop_reason === "max_tokens") {
    throw new Error("响应被截断，请使用更短的访谈稿后重试");
  }
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("No text response");

  // Prepend the prefill char we injected
  return prefill + textBlock.text;
}

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: "请输入至少50字的访谈逐字稿" },
        { status: 400 }
      );
    }

    // Stage 1 — returns a JSON array
    const stage1Raw = await callClaude(
      STAGE_1_PROMPT,
      `以下是访谈逐字稿：\n\n${transcript}`,
      "["
    );
    let statements: unknown;
    try {
      statements = JSON.parse(stage1Raw);
    } catch {
      console.error("Stage 1 raw:", stage1Raw.slice(0, 400));
      throw new Error("Stage 1 解析失败，请重试");
    }

    // Stage 2 — returns a JSON object
    const stage2Raw = await callClaude(
      STAGE_2_PROMPT,
      `以下是从访谈中提取的语句列表：\n\n${JSON.stringify(statements, null, 2)}`,
      "{"
    );
    let classification: unknown;
    try {
      classification = JSON.parse(stage2Raw);
    } catch {
      console.error("Stage 2 raw:", stage2Raw.slice(0, 400));
      throw new Error("Stage 2 解析失败，请重试");
    }

    // Stage 3 — returns a JSON object
    const stage3Raw = await callClaude(
      STAGE_3_PROMPT,
      `以下是原始语句列表：\n${JSON.stringify(statements, null, 2)}\n\n以下是三种分类框架的结果：\n${JSON.stringify(classification, null, 2)}`,
      "{"
    );
    let insights: unknown;
    try {
      insights = JSON.parse(stage3Raw);
    } catch {
      console.error("Stage 3 raw:", stage3Raw.slice(0, 400));
      throw new Error("Stage 3 解析失败，请重试");
    }

    return NextResponse.json({ statements, classification, insights });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "分析过程中出错，请重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
