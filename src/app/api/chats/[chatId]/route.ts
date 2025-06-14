// Auth
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Database
import { db } from "@/lib/db/drizzle";



export async function GET(
	_req: Request,
	{ params }: { params: { chatId: string } }
): Promise<Response> {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) return new Response("Unauthorized", { status: 401 });

	try {
		const chatId = params.chatId;
		const chat = await db.query.chats.findFirst({
			where: ((chats, { eq }) => eq(chats.id, chatId)),
		});
		const data = chat ?? {};
		const message = "Chat fetched successfully.";
		return Response.json({ data, message, level: "info" }, { status: 200 });
	} catch (error: any) {
		console.error(`ERR::CHAT::GET: ${error.message}`);
		return Response.json({
			message: `Failed to fetch chat: ${error.message}`,
			level: "error"
		}, { status: 500 });
	}
}