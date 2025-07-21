"use server";
import { generateText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createStreamableValue } from "ai/rsc";
import { getChatModel } from "./models";
import { ensureError } from "@/lib/response";

// 驗證
import { userAuthorization } from "@/lib/auth/utils";

// 資料庫
import { db } from "@/lib/db/drizzle";
import { messages as DrizzleMessages } from "@/lib/db/schema";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();

// 型別與介面
import type { CoreMessage } from "ai";
import type { StreamableValue } from "ai/rsc";

export async function generate({
	messages = [],
	systemPrompt,
	originalAccuracy,
}: {
	messages: (CoreMessage & { rating?: "good" | "bad" | null })[];
	systemPrompt: string;
	originalAccuracy: number;
}) {
	const fullSystemPrompt =
		"您是一位專業的 AI 評估員。您的任務是根據提供的對話歷史和原始系統提示，評估助理的最新一則回覆。" +
		`該模型的前次準確率分數為 ${originalAccuracy}。請考量此歷史表現後，提供一個更精確的評估。` +
		"請針對以下每個維度提供一個 0 到 100 的分數：指令遵循度、事實準確性、問題相關性、綜合品質。" +
		"同時，請為您的綜合品質分數提供一個簡短的理由。\n" +
		"--- 原始系統提示 ---\n" +
		`${systemPrompt}\n` +
		"--- 原始系統提示結束 ---";

	const messagesWithSystem = [{ role: "system", content: fullSystemPrompt }, ...messages];

	const { object: evaluation } = await generateObject({
		model: openai("gpt-4o"),
		schema: z.object({
			instruction_adherence: z.number().int().min(0).max(100).describe("指令遵循度分數（0-100）。"),
			factual_accuracy: z.number().int().min(0).max(100).describe("事實準確性分數（0-100）。"),
			relevance: z.number().int().min(0).max(100).describe("問題相關性分數（0-100）。"),
			overall_quality: z.number().int().min(0).max(100).describe("綜合品質分數（0-100）。"),
			reasoning: z.string().describe("關於綜合品質分數的簡短理由。"),
		}),
		messages: messagesWithSystem as CoreMessage[],
	});

	// 演化式評分：將前次準確率與本次評估加權平均
	const baseScore = (originalAccuracy * 0.3) + (evaluation.overall_quality * 0.7);

	// 動態評價調整
	const ratingAdjustment = messages.reduce((adjustment, msg) => {
		if (msg.role === "assistant" && msg.rating) {
			if (msg.rating === "good") {
				// 獎勵：增加「進步空間」的 15%
				return adjustment + (100 - baseScore) * 0.15;
			} else if (msg.rating === "bad") {
				// 懲罰：扣除「當前分數」的 30%
				return adjustment - baseScore * 0.30;
			}
		}
		return adjustment;
	}, 0);

	let finalAccuracy = baseScore + ratingAdjustment;
	finalAccuracy = Math.max(0, Math.min(100, finalAccuracy));
	finalAccuracy = Math.round(finalAccuracy * 10) / 10;

	return {
		accuracy: finalAccuracy,
	};
}

