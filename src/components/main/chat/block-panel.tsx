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
					<div className="max-h-full px-4 overflow-y-auto">
						<BlockToolResultContent toolResult={activeToolResult} />
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
				className="relative flex flex-col size-full bg-sidebar"
				{...props}
			>
				<Button
					className="absolute top-3 right-3 z-1"
					variant="ghost"
					size="icon"
					onClick={() => setIsBlockOpen(false)}
				>
					<X className="size-5" />
				</Button>
				<H3 className="sticky top-0 mt-0 p-4 pr-12 xl:pl-8 bg-sidebar">Steps</H3>
				<WrapperLayout className="w-full md:px-4 xl:px-8 pb-4 overflow-y-auto" width={960}>
					<BlockToolResultContent toolResult={activeToolResult} />
				</WrapperLayout>
			</ResizablePanel>
		</>
	) : null;
}

function BlockToolResultContent({ toolResult }: { toolResult: any }) {
	const Component = CHAT_TOOL_CONFIGS[toolResult?.toolName]?.component;
	const result = toolResult?.result;

	return Component && result ? (
		<Component result={result} />
	) : null;
}