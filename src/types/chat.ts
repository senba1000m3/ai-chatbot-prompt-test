// Types & Interfaces
import type { CoreMessage, Tool } from "ai";
import type { z, ZodObject, ZodRawShape } from "zod";



// Chat Tool
export interface ChatTool<
	Parameters extends ZodObject<ZodRawShape> = ZodObject<ZodRawShape>,
	Schema extends ZodObject<ZodRawShape> = ZodObject<ZodRawShape>,
> {
	name: string;
	type: "block" | "inline";
	guidePrompt: string;
	tool: Tool<Parameters>;
	schema: Schema;
	useStream: boolean;
	action: ((args: z.infer<Parameters>) => Promise<any> | any) | null;
	component: React.ComponentType<any>;
}

export type ChatOptions = {
	chatId: string;
	messages: CoreMessage[];
	model: string;
	character: string;
	useWebSearch?: boolean;
};

// Messages
export type SourcePart = {
	type: "source";
	source: {
		id: string;
		url: string;
		title?: string;
	};
};