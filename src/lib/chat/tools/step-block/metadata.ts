import { z } from "zod";



// ? Input parameters
export const parameters = z.object({
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
});

export type StepBlockParameters = z.infer<typeof parameters>;

// ? Output schema
// 1. Action passes schema to streamObject for output generation
// 2. Stream receiver uses schema to parse object from streamObject
// 3. Component uses inferred type to render the output
export const schema = z.object({
	title: z.string().default("title").describe("title of the problem"),
	steps: z.array(
		z.object({
			concept: z.string().default("Default concept").describe("brief calculation statement"),
			latex_formulas: z.string().default("").describe("the latex formula of the calculation step"),
			textual_description: z.string()
				.default("Explain the calculation here using $inline math$")
				.describe("detail explain of the calculation use $ /latex $ for inline math"),
		})
	).default([]).describe("Please make sure to organize the key concepts for solving the problem."),
	notification: z.string().default("Be careful about the units.").describe("justify important details to be aware of"),
});

export type StepBlockSchema = z.infer<typeof schema>;