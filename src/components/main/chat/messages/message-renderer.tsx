import { cn } from "@/lib/utils";

// Components & UI
import { Message } from "@/components/ui/message";
import { MessageContentRenderer, MessageToolbarRenderer } from "./content-renderer";

// Types & Interfaces
import type { CoreMessage } from "ai";
import type { Message as ChatMessage } from "@/lib/db/schema";
import { SourcePart } from "@/types/chat";



export function MessageRenderer({ id, message, sources, ...props }: {
	id: string;
	message: ChatMessage | CoreMessage;
	sources?: SourcePart["source"][]
} & React.ComponentProps<typeof Message>) {

	return (
		<Message
			key={id}
			className="group [div[data-role=user]+&]:mt-2"
			side={message.role === "user" ? "right" : "left"}
			showAvatar={message.role !== "user"}
			keepAvatarSpace={message.role !== "user"}
			data-role={message.role}
			{...props}
		>
			<MessageContentRenderer
				variant={message.role === "user" ? "bubble" : "default"}
				className={cn(message.role === "user" && "@2xl/message-group:max-w-[80%]")}
				content={message.content as CoreMessage["content"]}
				sources={sources}
			>
				<MessageToolbarRenderer
					className="opacity-0 group-hover:opacity-100 transition-opacity"
					role={message.role}
					content={message.content as CoreMessage["content"]}
					metadata={"metadata" in message
						? message?.metadata as Record<string, any>
						: {}
					}
				/>
			</MessageContentRenderer>
		</Message>
	);
}