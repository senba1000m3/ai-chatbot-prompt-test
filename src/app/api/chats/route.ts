// Auth
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Database
import { db } from "@/lib/db/drizzle";
import { chats } from "@/lib/db/schema";



export async function POST(req: Request): Promise<Response> {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) return new Response("Unauthorized", { status: 401 });

	try {
		const chatData = await req.json();
		await db.insert(chats).values({
			id: chatData.id,
			userId,
			title: chatData.title || "Untitled Chat",
			createdAt: new Date(),
			updatedAt: new Date(),
		}).onConflictDoNothing();
		return Response.json({ message: "Chat created successfully", level: "success" }, { status: 201 });
	} catch(error: any) {
		console.error(`ERR::CHATS::POST: ${error.message}`);
		return Response.json({
			message: `Failed to create chat: ${error.message}`, level: "error"
		}, { status: 500 });
	}
}

export async function GET(): Promise<Response> {
	let data: any[] = [];
	let message: string = "";
	let status: number = 200;

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) return new Response("Unauthorized", { status: 401 });

	try {
		const chats = await db.query.chats.findMany({
			where: ((chats, { eq }) => eq(chats.userId, userId)),
		});
		data = chats ?? [];
		message = "Chats fetched successfully.";
	} catch (error: any) {
		console.error(`ERR::CHATS::GET: ${error.message}`);
		message = `Failed to fetch chats: ${error.message}`;
		status = error?.response?.status ?? 500;
	} finally {
		return Response.json({ data, message }, { status });
	}
}