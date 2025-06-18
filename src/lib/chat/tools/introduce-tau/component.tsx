"use client";
// Tool
import type { IntroduceTauSchema } from "@/lib/chat/tools/introduce_tau/schema";

// Components & UI
import { MarkdownText } from "@/components/common/typography";



export function InlineText({ result }: { result: IntroduceTauSchema }) {
	return(
		<MarkdownText>
			{result.content}
		</MarkdownText>
	)
}