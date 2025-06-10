// Components & UI
import { ChatSidebarChats } from "./content-chats";
import { ChatSidebarDocs } from "./content-docs";
import { ChatSidebarFooter } from "./footer";
import { ChatSidebarHeader } from "./header";
import {
	Sidebar,
	SidebarContent,
	SidebarRail,
} from "@/components/ui/sidebar";



export function ChatSidebar() {
	return (
		<Sidebar collapsible="icon">
			<ChatSidebarHeader />
			<ChatSidebarContent />
			<ChatSidebarFooter />
			<SidebarRail />
		</Sidebar>
	);
}

function ChatSidebarContent () {
	return (
		<SidebarContent className="gap-0">
			<ChatSidebarChats />
			<ChatSidebarDocs
				className="sticky bottom-0 mt-auto bg-sidebar"
			/>
		</SidebarContent>
	)
}