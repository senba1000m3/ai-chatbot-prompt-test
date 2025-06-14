// Components & UI
import { ChatInput } from "./chat-input";
import { ResizablePanel } from "@/components/ui/resizable";
import { WrapperLayout } from "@/components/common/layouts";



export function ChatResizablePanel({
	children,
	...props
}: React.ComponentProps<typeof ResizablePanel>) {
	return (
		<ResizablePanel className="relative" {...props}>
			{children}
			<div className="absolute bottom-0 left-0 w-full">
				<WrapperLayout className="" width={960}>
					<ChatInput />
				</WrapperLayout>
			</div>
		</ResizablePanel>
	);
}