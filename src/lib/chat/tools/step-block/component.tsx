// Tool
import type { StepBlockSchema } from "./metadata";

// Components & UI
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { MarkdownText, Muted } from "@/components/common/typography";



export function StepBlock({ result, ...props }: { result: StepBlockSchema }) {
	return (
		<Accordion
			className="space-y-4"
			type="multiple"
			{...props}
		>
			{result.steps.map((step, index) => (
				<StepBlockItem key={step.concept} step={step} index={index} />
			))}
		</Accordion>
	);
}

function StepBlockItem({ step, index }: {
	step: StepBlockSchema["steps"][number],
	index: number
}) {
	return (
		<AccordionItem
			className=" bg-card text-card-foreground rounded-xl border! shadow-sm overflow-clip"
			value={String(index)}
		>
			<AccordionTrigger className="px-4 overflow-hidden">
				<div className="px-2 overflow-x-auto">
					<MarkdownText>
						{`\\[ ${step.latex_formulas} \\]`}
					</MarkdownText>
				</div>
			</AccordionTrigger>
			<AccordionContent className="p-4 bg-secondary text-secondary-foreground">
				<Muted>{step.concept}</Muted>
				<MarkdownText>
					{step.textual_description}
				</MarkdownText>
			</AccordionContent>
		</AccordionItem>
	);
}