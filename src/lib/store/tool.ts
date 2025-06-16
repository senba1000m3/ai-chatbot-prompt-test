import { create } from "zustand";

// Types & Interfaces
interface ToolResult {
	toolName: string;
	title: string;
	result: any;
}
interface ToolStoreProps {
	isBlockOpen: boolean;
	setIsBlockOpen: (isBlockOpen: boolean) => void;
	clearToolStore: () => void;

	// Tool Result related
	activeToolResultId: string;
	setActiveToolResultId: (toolCallId: string) => void;
	toolResults: Record<string, ToolResult>;
	initToolResult: (toolCallId: string, toolName: string, title?: string) => void;
	appendToolResult: (toolCallId: string, toolResult: ToolResult) => void;
	getToolResult: (toolResultId: string) => ToolResult | undefined;
};



export const useToolStore = create<ToolStoreProps>(
	(set, get) => ({
		isBlockOpen: false,
		setIsBlockOpen: (isBlockOpen: boolean) => set({ isBlockOpen }),
		clearToolStore: () => {
			set(() => ({
				activeToolResultId: undefined,
				isBlockOpen: false,
				toolResults: {} as Record<string, ToolResult>,
			}));
		},

		// Tool Result related
		activeToolResultId: "",
		setActiveToolResultId: (toolCallId: string) => set({ activeToolResultId: toolCallId }),
		toolResults: {} as Record<string, ToolResult>,
		initToolResult: (toolCallId: string, toolName: string, title: string = "Untitled") => {
			const toolResult: ToolResult = {
				toolName,
				title,
				result: undefined,
			};

			set(state => ({
				toolResults: {
					...state.toolResults,
					[toolCallId]: toolResult,
				},
				activeToolResultId: toolCallId,
			}));
		},
		appendToolResult: (toolCallId: string, result: any) => {
			set(state => {
				const { toolResults } = state;

				return {
					toolResults: {
						...toolResults,
						[toolCallId]: { ...toolResults[toolCallId], result },
					},
				};
			});
		},
		getToolResult: (toolResultId: string) => {
			const { toolResults } = get();
			return toolResults[toolResultId] || undefined;
		},
	})
);