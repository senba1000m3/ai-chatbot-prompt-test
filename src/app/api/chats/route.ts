import { type Result, ensureError } from "@/lib/response";
import { nanoid } from "@/lib/utils";

// Auth
import { userAuthorization } from "@/lib/auth/utils";

// Database
import { db } from "@/lib/db/drizzle";
import { type Chat, chats } from "@/lib/db/schema";



export async function POST(req: Request): Promise<Response> {
	try {
		const user = await userAuthorization();

		const passedChatData = await req.json();
		const chatData = {
			id: passedChatData?.id || nanoid(),
			userId: user.id,
			shortId: null,
			title: passedChatData?.title || "Untitled Chat",
			public: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		await db.insert(chats).values(chatData).onConflictDoNothing();

		return Response.json(
			{
				success: true,
				data: chatData,
				level: "info",
				message: `Chat created successfully.`,
			} satisfies Result<Chat>,
			{ status: 201 }
		);
	} catch(err) {
		const error = ensureError(err);
		console.error(`ERR::CHATS::POST: ${error.message}`);

		return Response.json(
			{
				success: false,
				message: `Failed to create chat, reason: ${error.message}`,
			} satisfies Result,
			{ status: error.status }
		);
	}
}

export async function GET(): Promise<Response> {
	try {
		const user = await userAuthorization();

		const chats = await db.query.chats.findMany({
			where: ((chats, { eq }) => eq(chats.userId, user.id)),
		});

		return Response.json(
			{
				success: true,
				data: chats,
				level: "info",
				message: `Chats fetched successfully.`,
			} satisfies Result<Chat[]>,
			{ status: 200 }
		);
	} catch (err) {
		const error = ensureError(err);
		console.error(`ERR::CHATS::GET: ${error.message}`);

		return Response.json(
			{
				success: false,
				message: `Failed to fetch chats, reason: ${error.message}`,
			} satisfies Result,
			{ status: error.status }
		);
	}
}