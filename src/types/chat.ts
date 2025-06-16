// Types & Interfaces
import type { CoreMessage, Tool } from "ai";
import type { z, ZodObject, ZodRawShape } from "zod";



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
	action: (args: z.infer<Parameters>) => Promise<any> | any;
	component: React.ComponentType<any>;
}

export type ChatOptions = {
	chatId: string;
	messages: CoreMessage[];
	model: string;
	character: string;
};