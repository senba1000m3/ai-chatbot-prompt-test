import { z, ZodRawShape } from "zod";

export const schema: ZodRawShape = {
	title: z.string().default("title").describe("title of the problem"),
	steps: z
		.array(
			z.object({
				concept: z
					.string()
					.default("Default concept")
					.describe("brief calculation statement"),
				latex_formulas: z
					.string()
					.default("")
					.describe(
						"the latex formula of the calculation step"
					),
				textual_description: z
					.string()
					.default(
						"Explain the calculation here using $inline math$"
					)
					.describe(
						"detail explain of the calculation use $ /latex $ for inline math"
					),
			})
		)
		.default([])
		.describe(
			"Please make sure to organize the key concepts for solving the problem."
		),
	notification: z
		.string()
		.default("Be careful about the units.")
		.describe("justify important details to be aware of"),
};