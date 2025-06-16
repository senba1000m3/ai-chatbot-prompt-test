import {
	type Result,
	BadRequestError,
	ensureError
} from "@/lib/response";
import { nanoid } from "@/lib/utils";

// Auth
import { userAuthorization } from "@/lib/auth/utils";

// Database
import { db } from "@/lib/db/drizzle";
import { type Message, messages } from "@/lib/db/schema";

// Types & Interfaces
import type { NextRequest } from "next/server";



export async function POST(req: Request): Promise<Response> {
	try {
		const user = await userAuthorization();

		const passedMessageData = await req.json();
		const messageData = {
			id: passedMessageData?.id || nanoid(),
			userId: user.id,
			chatId: passedMessageData?.chatId,  // Throws error if not provided
			repliesId: passedMessageData?.repliesId || null,
			role: passedMessageData?.role,      // Throws error if not provided
			content: passedMessageData?.content || [],
			metadata: passedMessageData?.metadata || {},
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		await db.insert(messages).values(messageData).onConflictDoNothing();

		return Response.json(
			{
				success: true,
				data: messageData,
				level: "info",
				message: `Message created successfully.`,
			} satisfies Result<Message>,
			{ status: 201 }
		);
	} catch(err) {
		const error = ensureError(err);
		console.error(`ERR::MESSAGES::POST: ${error.message}`);

		return Response.json(
			{
				success: false,
				message: `Failed to create message, reason: ${error.message}`,
			} satisfies Result,
			{ status: error.status }
		);
	}
}

export async function GET(req: NextRequest): Promise<Response> {
	const chatId = req.nextUrl.searchParams.get("chat_id");

	try {
		if (!chatId) throw new BadRequestError("`chat_id` parameter is required.");

		const user = await userAuthorization();

		const messages = await db.query.messages.findMany({
			where: (messages, { and, eq }) =>
				and(
					eq(messages.userId, user.id),
					eq(messages.chatId, chatId)
				),
		});

		return Response.json(
			{
				success: true,
				data: messages,
				level: "info",
				message: `Messages of chat \`${chatId}\` fetched successfully.`,
			} satisfies Result<Message[]>,
			{ status: 200 }
		);
	} catch (err) {
		const error = ensureError(err);
		console.error(`ERR::MESSAGES::GET: ${error.message}`);

		return Response.json(
			{
				success: false,
				message: `Failed to fetch messages of chat \`${chatId}\`, reason: ${error.message}`,
			} satisfies Result,
			{ status: error.status }
		);
	}
}