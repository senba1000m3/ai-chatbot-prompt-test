"use client";
import { usePathname } from "@/lib/i18n/navigation";

// Components & UI
import { ChatInput } from "./input";
import { ResizablePanel } from "@/components/ui/resizable";
import { WrapperLayout } from "@/components/common/layouts";



export function ChatResizablePanel({
	children,
	...props
}: React.ComponentProps<typeof ResizablePanel>) {
	const pathname = usePathname();

	return (
		<ResizablePanel
			id="chat-resizable-panel"
			className="relative"
			{...props}
		>
			{children}
			<div className="absolute bottom-0 left-0 w-full">
				<WrapperLayout className="grid gap-4" width={960}>
					{!pathname.startsWith("/chat/share") && <ChatInput />}
				</WrapperLayout>
			</div>
		</ResizablePanel>
	);
}