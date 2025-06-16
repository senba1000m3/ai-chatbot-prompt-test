import { UnauthorizedError, ensureError } from "@/lib/response";

// Auth
import { auth } from "@/lib/auth";
import { headers } from "next/headers";



export async function userAuthorization() {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session || !session.user) {
			throw new UnauthorizedError("User session not found.");
		}
		return session.user;
	} catch (err) {
		const error = ensureError(err);
		console.error(`ERR::AUTHORIZATION: ${error.message}`);

		throw new UnauthorizedError(error.message, { cause: error });
	}
}