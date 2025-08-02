import type { FileRouter } from "uploadthing/next";
import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	productUploader: f({ image: { maxFileSize: "4MB" } }).onUploadComplete(
		async ({ metadata, file }) => {
			// Handle upload completion
			console.log("Upload complete:", file);
			// Add logic to save the file URL to your database or update state
		},
	),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;