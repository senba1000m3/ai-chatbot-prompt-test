// Auth
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Database
import { db } from "@/lib/db/drizzle";

// Types & Interfaces
import type { NextRequest } from "next/server";



export async function GET(req: NextRequest): Promise<Response> {
	let data: any[] = [];
	let message: string = "";
	let status: number = 200;

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) return new Response("Unauthorized", { status: 401 });

	try {
		const chatId = req.nextUrl.searchParams.get("chat_id");
		const messages = await db.query.messages.findMany({
			where: (messages, { and, eq }) =>
				and(
					eq(messages.userId, userId),
					eq(messages.chatId, chatId!)
				),
		});
		data = messages ?? [];
		message = "Messages fetched successfully.";
	} catch (error: any) {
		console.error(`ERR::MESSAGES::GET: ${error.message}`);
		message = `Failed to fetch messages: ${error.message}`;
		status = error?.response?.status ?? 500;
	} finally {
		return Response.json({ data, message }, { status });
	}
}