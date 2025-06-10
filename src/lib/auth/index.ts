import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins/admin";
import { feedback } from "@better-auth-kit/feedback";

// Drizzle
import * as schema from "./schema";
import { db } from "@/lib/db/drizzle";
import { drizzleAdapter } from "better-auth/adapters/drizzle";



export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
		usePlural: true,
	}),
	plugins: [
		admin(),
		feedback({
			additionalFields: {},
		}),
	],
	socialProviders: {
		google: {
			clientId: process.env.BETTER_AUTH_GOOGLE_ID!,
			clientSecret: process.env.BETTER_AUTH_GOOGLE_SECRET!,
		},
	},
	user: {
		additionalFields: {},
	},
	advanced: {
		useSecureCookies: true,
	},
});