import { z, ZodRawShape } from "zod";

export const parameters: ZodRawShape = {
	physic_problem_statement: z
		.string()
		.describe(
			"summarize the problem statement in detail, including all the necessary information"
		),
	answer_requerment: z
		.string()
		.describe(
			"list the answer requirement ex. the equation of motion and explicit function solution y(t)=?"
		),
	brief_analysis: z
		.string()
		.describe(
			"brief analysis of the problem statement from previous steps"
		),
};