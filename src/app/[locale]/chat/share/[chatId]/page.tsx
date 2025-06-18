import { redirect } from "next/navigation";

// Database
import { db } from "@/lib/db/drizzle";

// Components & UI
import { MessageGroup } from "@/components/ui/message";
import { MessageRenderer } from "@/components/main/chat/messages/message-renderer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WrapperLayout } from "@/components/common/layouts";

// Types & Interfaces
import type { ChatParams } from "@/types";



export default async function ChatPage(props: {
	params: ChatParams,
}) {
	const params = await props.params;
	const shortId = params.chatId;

	const chatData = await db.query.chats.findFirst({
		where: (chats, { eq }) => eq(chats.shortId, shortId)
	});

	if (!chatData?.public) redirect("/");

	const messages = await db.query.messages.findMany({
		where: (messages, { eq }) => eq(messages.chatId, chatData.id)
	}).then(messages => messages.sort((a, b) => {
		const aUpdatedAt = new Date(a.updatedAt).getTime();
		const bUpdatedAt = new Date(b.updatedAt).getTime();
		return aUpdatedAt - bUpdatedAt;
	}));

	return (
		<ScrollArea className="size-full" scrollHideDelay={1000}>
			<WrapperLayout className="pt-4 pb-48" width={960}>
				<MessageGroup className="gap-8">
					{messages.length > 0 && messages.map(message => (
						<MessageRenderer
							key={message.id}
							id={message.id}
							message={message}
						/>
					))}
				</MessageGroup>
			</WrapperLayout>
		</ScrollArea>
	);
}