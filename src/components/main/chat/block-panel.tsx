"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToolStore } from "@/lib/store/tool";

// Components & UI
import { Button } from "@/components/ui/button";
import { WrapperLayout } from "@/components/common/layouts";
import { P } from "@/components/common/typography";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { Sheet, SheetClose, SheetContent, SheetFooter } from "@/components/ui/sheet";

// Icons & Images
import { X } from "lucide-react";



export function BlockResizablePanel(
	{ ...props }: React.ComponentProps<typeof ResizablePanel>
) {
	const isBlockOpen = useToolStore(state => state.isBlockOpen);
	const setIsBlockOpen = useToolStore(state => state.setIsBlockOpen);

	const toolResults = useToolStore(state => state.toolResults);

	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Sheet open={isBlockOpen} onOpenChange={setIsBlockOpen}>
				<SheetContent>
					{/* Tool result gose here */}
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
			<ResizablePanel className="relative" {...props}>
				<Button
					className="absolute top-3 right-3"
					variant="ghost"
					size="icon"
					onClick={() => setIsBlockOpen(false)}
				>
					<X className="size-5" />
				</Button>
				<WrapperLayout className="py-4" width={960}>
					<P>{JSON.stringify(toolResults)}</P>
				</WrapperLayout>
			</ResizablePanel>
		</>
	) : null;
}