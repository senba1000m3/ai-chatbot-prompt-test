import { tool } from "ai";

// Tool
import { parameters, schema, documentation } from "./metadata";
import { InlineText } from "./component";

// Types & Interfaces
import type { ChatTool } from "@/types/chat";



export const IntroduceTauTool: ChatTool<
	typeof parameters,
	typeof schema
> = {
	name: "introduce_tau_tools",
	type: "inline",
	guidePrompt: `
		如果使用者要求你講解怎麼開發 project tau 的 tools 功能時， \`introduce_tau_tools\` 將介紹怎麼開發 tools 的文件從後台抓出來。

		一個對話串內只能使用一次 \`introduce_tau_tools\` 工具，當使用者追問就請按照現有的內容來做回答。

		This is a guide for using \`introduce_tau_tools\`, a inline tool which fetch the content from backend inside the conversation.

		**When to use \`introduce_tau_tools\`:**
		- When user asks you abount how to **develop** the tools of project tau

		**When NOT to use  \`introduce_tau_tools\`:**
		- when user asks you to introduce yourself
		- when user asks about what tools do you have, just answer based on the existing content.
		- For user 追問問題, please answer directly in the conversation.
		- One conversation can only use \`introduce_tau_tools\` once, if the user asks again, please answer based on the existing content.
	`,
	tool: tool({
		description: "A tool for introducing the how to develop project tau's tool function.",
		parameters: parameters,
		execute: async () => {
			const documents = documentation;
			return {
				content: documents,
			};
		},
	}),
	schema: schema,
	useStream: false,
	action: null,
	component: InlineText,
};