"use client";
import React, { useState } from "react";
import { useUploadThing } from "@/utils/uploadthing";
import { Paperclip, Loader2 } from "lucide-react";
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePromptStore } from "@/lib/store/prompt";

export const UploadButton = () =>{
	const [_isUploading, _setIsUploading] = useState(false);
	const { addSelectedImage, removeSelectedImage, selectedImage } = usePromptStore();

	const { startUpload, isUploading } = useUploadThing("productUploader", {
		onClientUploadComplete: (res) => {
			if (res) {
				res.forEach((uploadedFile: any) => {
					const imageUrl = uploadedFile.url || uploadedFile.fileUrl || uploadedFile.ufsUrl;
					const fullUrl = imageUrl.startsWith("http") ? imageUrl : `${window.location.origin}${imageUrl}`;

					addSelectedImage(fullUrl);
					_setIsUploading(false);
				});
			}
		},
		onUploadError: (error: Error) => {
			alert(`ERROR! ${error.message}`);
		},
	});

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			const files = Array.from(event.target.files);
			if (files.length > 0) {
				_setIsUploading(true)
				startUpload(files);
			}
		}

		event.currentTarget.value = "";
	};

	return(
		<div>
			<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								className="h-10 px-4 bg-blue-600 hover:bg-blue-700 transition-colors"
								onClick={() => {
									const fileInput = document.getElementById("image-upload") as HTMLInputElement;
									if (fileInput) fileInput.click();
								}}
								disabled={isUploading}
							>
								{_isUploading ? (
										<Loader2 className="animate-spin w-5 h-5" />
								) : (
									<Paperclip className="w-4 h-4" />
								)}
							</Button>
						</TooltipTrigger>
						{_isUploading ? (
							<TooltipContent>
								<span>圖片上傳中...</span>
							</TooltipContent>
						) : (
							<TooltipContent>
								<span>上傳圖片</span>
							</TooltipContent>
						)}
					</Tooltip>
				</TooltipProvider>
				<input
					type="file"
					accept="image/jpeg, image/png"
					onChange={handleImageChange}
					className="hidden"
					id="image-upload"
					multiple
				/>
			</motion.div>
		</div>
	)
}