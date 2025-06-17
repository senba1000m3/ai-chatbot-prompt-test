import {
	type Result,
	NotFoundError,
	ensureError
} from "@/lib/response";

// Auth
import { userAuthorization } from "@/lib/auth/utils";

// Database
import { db } from "@/lib/db/drizzle";
import { type Chat, chats } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";



export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ chatId: string }> }
): Promise<Response> {
	const chatId = (await params).chatId;

	try {
		const user = await userAuthorization();

		const chatData = await db.query.chats.findFirst({
			where: (chats, { and, eq }) =>
				and(
					eq(chats.userId, user.id),
					eq(chats.id, chatId)
				),
		});

		if (!chatData) throw new NotFoundError("Chat not found.");
		return Response.json(
			{
				success: true,
				data: chatData,
				level: "info",
				message: `Chat \`${chatId}\` fetched successfully.`,
			} satisfies Result<Chat>,
			{ status: 200 }
		);
	} catch (err) {
		const error = ensureError(err);
		console.error(`ERR::CHAT::GET: ${error.message}`);

		return Response.json(
			{
				success: false,
				message: `Failed to fetch chat \`${chatId}\`, reason: ${error.message}`,
			} satisfies Result,
			{ status: error.status }
		);
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ chatId: string }> }
) {
	const chatId = (await params).chatId;

	try {
		const user = await userAuthorization();

		const { id, userId, ...passedPartialChatData } = await req.json();
		void id; void userId;
		const chatData = await db.update(chats)
			.set({ ...passedPartialChatData, updatedAt: new Date() })
			.where(and(
				eq(chats.userId, user.id),
				eq(chats.id, chatId)
			))
			.returning()
			.then(data => data[0]);

		if (!chatData) throw new NotFoundError("Chat not found.");
		return Response.json(
			{
				success: true,
				data: chatData,
				level: "info",
				message: `Chat \`${chatId}\` updated successfully.`,
			} satisfies Result<Chat>,
			{ status: 200 }
		);
	} catch (err) {
		const error = ensureError(err);
		console.error(`ERR::CHAT::UPDATE: ${error.message}`);

		return Response.json(
			{
				success: false,
				message: `Failed to update chat \`${chatId}\`, reason: ${error.message}`,
			} satisfies Result,
			{ status: error.status }
		);
	}
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ chatId: string }> }
) {
	const chatId = (await params).chatId;

	try {
		const user = await userAuthorization();

		await db.delete(chats)
			.where(and(
				eq(chats.userId, user.id),
				eq(chats.id, chatId)
			));

		return Response.json(
			{
				success: true,
				data: undefined,
				level: "info",
				message: `Chat \`${chatId}\` deleted successfully.`,
			} satisfies Result<undefined>,
			{ status: 200 }
		);
	} catch (err) {
		const error = ensureError(err);
		console.error(`ERR::CHAT::DELETE: ${error.message}`);

		return Response.json(
			{
				success: false,
				message: `Failed to delete chat \`${chatId}\`, reason: ${error.message}`,
			} satisfies Result,
			{ status: error.status }
		);
	}
}