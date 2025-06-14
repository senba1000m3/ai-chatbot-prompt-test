// Types & Interfaces
import type { CoreMessage, Tool } from "ai";
import type { z, ZodObject, ZodRawShape } from "zod";



export interface ChatTool<
	Schema extends ZodRawShape = ZodRawShape,
	Parameters extends ZodRawShape = ZodRawShape,
> {
	name: string;
	type: "block" | "inline";
	guidePrompt: string;
	tool: Tool<ZodObject<Parameters>>;
	schema: ZodObject<Schema>;
	useStream: boolean;
	action: (args: z.infer<ZodObject<Parameters>>) => Promise<any>;
	component: React.ComponentType<any>;
}

export type ChatOptions = {
	chatId: string;
	messages: CoreMessage[];
	model: string;
	character: string;
};