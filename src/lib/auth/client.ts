import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { feedbackClient } from "@better-auth-kit/feedback";



export const { signIn, signOut, useSession } = createAuthClient({
	plugins: [
		adminClient(),
		feedbackClient(),
	],
});