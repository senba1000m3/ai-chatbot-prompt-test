"use server";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { z, ZodObject } from "zod";

import { parameters } from "./parameters";



export async function generateStepsAction({
	physic_problem_statement,
	answer_requerment,
	brief_analysis
}: z.infer<ZodObject<typeof parameters>>) {
	"use server";

	const stream = createStreamableValue();
	(async () => {
		const { partialObjectStream } = streamObject({
			model: openai("gpt-4o"),
			schema: z.object({
				title: z.string().default("title").describe("title of the problem"),
				steps: z.array(
					z.object({
						concept: z.string().describe("brief calculation statement"),
						latex_formulas: z.string().describe("the latex formula of the calculation step"),
						textual_description: z.string().describe("detail explain of the calculation use $ /latex $ for inline math"),
					}),
				).describe("Please make sure to organize the key concepts for solving the problem."),
				notification: z.string().describe("justify important details to be aware of"),
			}),
			messages: [
				{ role: "system", content: "YOU ARE a professional explanation generator for physics students slove the whole problem in detail. Highlight necessary formulas. Please make sure to organize the key concepts for solving the problem and the important details to be aware of. Add a title of the problem, and focus on providing a textual description and detail calculation. Execute the math, solve whole problem in detail step by step. Use symbolic representation over actual numbers where appropriate. Finish all calculation in 繁體中文 #zh-TW." },
				{ role: "user", content: `please give me ${answer_requerment} for ${physic_problem_statement} I know that ${brief_analysis}` }
			],
		});

		try {
			for await (const partialObject of partialObjectStream) {
				stream.update(partialObject);
			}
		} catch (error) {
			console.error(error);
		}
		stream.done();
	})();

	return stream.value;
}