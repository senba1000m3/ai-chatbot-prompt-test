// Components & UI
import { NewChatButton } from "../new-chat-button";
import {
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarTrigger,
} from "@/components/ui/sidebar";



export function ChatSidebarHeader() {
	return (
		<SidebarHeader>
			<SidebarMenu className="gap-2">
				<SidebarMenuItem className="flex flex-wrap justify-between gap-4">
					<SidebarTrigger />
				</SidebarMenuItem>
				<SidebarMenuItem>
					<NewChatButton />
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
	);
}