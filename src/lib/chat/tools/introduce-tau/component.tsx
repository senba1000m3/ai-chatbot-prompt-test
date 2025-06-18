// Tool
import type { IntroduceTauSchema } from "./metadata";

// Components & UI
import { MarkdownText } from "@/components/common/typography";



export function InlineText({ result }: { result: IntroduceTauSchema }) {
	return (
		<MarkdownText>
			{result.content}
		</MarkdownText>
	);
}