import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);
		const filename = `${Date.now()}-${file.name.trim().replace(/\s+/g, "-")}`;
		const uploadDir = path.join(process.cwd(), "public", "uploads");
		const filePath = path.join(uploadDir, filename);

		await mkdir(uploadDir, { recursive: true });

		await writeFile(filePath, buffer);

		const url = `/uploads/${filename}`;
		return NextResponse.json({ url });
	} catch (error) {
		console.error("File upload error:", error);
		return NextResponse.json({ error: "File upload failed" }, { status: 500 });
	}
}
