"use client";
import { useState } from "react";
import { useChatStore } from "@/lib/store/chat";
import { useTranslations } from "next-intl";

// Components & UI
import { Button } from "@/components/ui/button";
import {
	Command,
	// CommandEmpty,
	CommandGroup,
	// CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

// Icons & Images
import { BotMessageSquare, Check, ChevronsUpDown } from "lucide-react";

// Constants & Variables
import { CHAT_CHARACTER_IDS } from "@/lib/chat/characters";



export function ChatCharacterSelect() {
	const t = useTranslations("chat.character");
	const character = useChatStore(state => state.character);
	const setCharacter = useChatStore(state => state.setCharacter);

	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="max-xs:text-xs"
				>
					<BotMessageSquare />
					{character ? t(`${character}.name`) : t("select")}
					<ChevronsUpDown />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-32 p-0 bg-popover/40 backdrop-blur-lg"
				sideOffset={12}
				collisionPadding={16}
			>
				<Command
					className="bg-transparent"
					value={character}
				>
					<CommandList>
						<CommandGroup>
							{CHAT_CHARACTER_IDS.map(characterId => (
								<CommandItem
									key={characterId}
									value={characterId}
									onSelect={() => {
										setCharacter(characterId);
										setOpen(false);
									}}
								>
									{t(`${characterId}.name`)}
									{characterId === character && <Check className="ml-auto" />}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}