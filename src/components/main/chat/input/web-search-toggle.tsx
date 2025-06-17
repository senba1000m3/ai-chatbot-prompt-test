import { useChatStore } from "@/lib/store/chat";
import { getChatModel } from "@/lib/chat/models";

// Components & UI
import { Toggle } from "@/components/ui/toggle";

// Icons & Images
import { Ban, Globe } from "lucide-react";



export function ChatWebSearchToggle() {
	const model = useChatStore(state => state.model);
	const useWebSearch = useChatStore(state => state.useWebSearch);
	const setUseWebSearch = useChatStore(state => state.setUseWebSearch);

	const chatModel = getChatModel(model);

	return chatModel?.webSearch ? (
		<Toggle
			size="sm"
			pressed={useWebSearch}
			onPressedChange={setUseWebSearch}
		>
			{useWebSearch ? <Globe /> : <Ban />}
			<span className="max-sm:hidden">Web Search</span>
		</Toggle>
	) : null;
}