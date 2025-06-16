"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToolStore } from "@/lib/store/tool";

// Components & UI
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/common/typography";
import { WrapperLayout } from "@/components/common/layouts";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

// Icons & Images
import { X } from "lucide-react";

// Constants & Variables
import { CHAT_TOOL_CONFIGS } from "@/lib/chat/tools";



export function BlockResizablePanel(
	{ ...props }: React.ComponentProps<typeof ResizablePanel>
) {
	const isMobile = useIsMobile();

	const isBlockOpen = useToolStore(state => state.isBlockOpen);
	const setIsBlockOpen = useToolStore(state => state.setIsBlockOpen);

	const activeToolResultId = useToolStore(state => state.activeToolResultId);
	const toolResults = useToolStore(state => state.toolResults);
	const activeToolResult = toolResults[activeToolResultId] || {};

	if (isMobile) {
		return (
			<Sheet open={isBlockOpen} onOpenChange={setIsBlockOpen}>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>
							Steps
						</SheetTitle>
					</SheetHeader>
					<div className="px-4">
						<ToolResultContent toolResult={activeToolResult} />
					</div>
					<SheetFooter>
						<SheetClose asChild>
							<Button variant="outline">Close</Button>
						</SheetClose>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		);
	}

	return isBlockOpen ? (
		<>
			<ResizableHandle withHandle />
			<ResizablePanel
				id="block-resizable-panel"
				className="relative"
				defaultSize={0}
				order={2}
				{...props}
			>
				<Button
					className="absolute top-3 right-3"
					variant="ghost"
					size="icon"
					onClick={() => setIsBlockOpen(false)}
				>
					<X className="size-5" />
				</Button>
				<WrapperLayout className="py-4" width={960}>
					<H3 className="mb-2 mr-8">Steps</H3>
					<ToolResultContent toolResult={activeToolResult} />
				</WrapperLayout>
			</ResizablePanel>
		</>
	) : null;
}

function ToolResultContent({ toolResult }: { toolResult: any }) {
	console.log("Tool Result Content", toolResult);
	const Component = CHAT_TOOL_CONFIGS[toolResult?.toolName]?.component;
	const result = toolResult?.result;

	return Component && result ? (
		<Component result={result} />
	) : null;
}