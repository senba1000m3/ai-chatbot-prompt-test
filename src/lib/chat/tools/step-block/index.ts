import { tool } from "ai";
import { z } from "zod";

import { schema } from "./schema";
import { parameters } from "./parameters";
import { generateStepsAction } from "./action";
import { StepBlock } from "./component";

// Types & Interfaces
import type { ChatTool } from "@/types/chat";



export const StepBlockTool: ChatTool<
	typeof schema,
	typeof parameters
> = {
	name: "step_block",
	type: "block",
	guidePrompt: `
		如果使用者問了一個新問題，請使用 create_step_block 工具將答案顯示在 blocks 內。
		當你取得 result，請勿重述 result 內容，請勿解釋詳細解答步驟。
		如果使用者追問問題，請勿使用 create_step_block 工具，直接回答問題即可。

		This is a guide for using blocks tools:  \`create_step_block\` , which render content on a blocks beside the conversation.

		**When to use \`create_step_block\`:**
		- When you need to generate a structured answer that will be displayed in blocks.

		**When NOT to use \`create_step_block\`:**
		- For student 追問問題, please answer directly in the conversation.
	`,
	tool: tool({
		description: "A tool for generate structure answer of physics problem IN 繁體中文 #zh-TW.",
		parameters: z.object(parameters),
		execute: async () => {
			return {
				content: "A step answer was created and is now visible to the user.",
			};
		},
	}),
	schema: z.object(schema),
	useStream: true,
	action: async (args) => await generateStepsAction(args),
	component: StepBlock,
};