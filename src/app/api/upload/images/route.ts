// // app/api/uploadthing/route.ts
// import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { UploadThingError } from "uploadthing/server";
//
// // 1. 建立實體
// const f = createUploadthing();
//
// // 假的權限驗證函數
// const auth = (req: Request) => ({ id: "fakeId" });
//
// // 2. 定義 router：限制檔案類型與大小，加入 middleware 權限驗證與 metadata
// export const ourFileRouter = {
// 	imageUploader: f({
// 		image: {
// 			maxFileSize: "4MB",
// 			maxFileCount: 1,
// 		},
// 	})
// 		.middleware(async ({ req }) => {
// 			const user = await auth(req);
// 			if (!user) throw new UploadThingError("Unauthorized");
// 			return { userId: user.id };
// 		})
// 		.onUploadComplete(async ({ metadata, file }) => {
// 			console.log("Upload complete for userId:", metadata.userId);
// 			console.log("file url", file.ufsUrl);
// 			return { uploadedBy: metadata.userId };
// 		}),
// } satisfies FileRouter;
//
// // 3. 導出型別
// export type OurFileRouter = typeof ourFileRouter;
//
