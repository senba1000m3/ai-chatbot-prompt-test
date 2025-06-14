"use client";
import { useState } from "react";
import { useChatStore } from "@/lib/store/chat";
import { useTranslations } from "next-intl";
import { getModelNameById } from "@/lib/chat/models";

// Components & UI
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

// Icons & Images
import { Check, ChevronsUpDown } from "lucide-react";

// Constants & Variables
import { CHAT_MODELS } from "@/lib/chat/models";



export function ChatModelSelect() {
	const t = useTranslations("chat.model");
	const model = useChatStore(state => state.model);
	const setModel = useChatStore(state => state.setModel);

	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="sm">
					{model ? getModelNameById(model) : t("select")}
					<ChevronsUpDown />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="p-0 bg-popover/40 backdrop-blur-lg"
				sideOffset={12}
				collisionPadding={16}
			>
				<Command className="bg-transparent">
					<CommandInput placeholder={t("search")} />
					<CommandList>
						<CommandEmpty>{t("command_empty")}</CommandEmpty>
						{Object.entries(CHAT_MODELS).map(([key, value]) => (
							<CommandGroup
								key={key.toLowerCase()}
								heading={key}
								className="[&_[cmdk-group-heading]]:text-primary"
							>
								{value.models.map(m => (
									<CommandItem
										key={m.model}
										value={m.model}
										onSelect={() => {
											setModel(m.model);
											setOpen(false);
										}}
									>
										{m.model}
										{m.model === model && <Check className="ml-auto" />}
									</CommandItem>
								))}
							</CommandGroup>
						))}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}