"use client";
import { useTranslations } from "next-intl";

// Components & UI
import Image from "next/image";
import Twemoji from "react-twemoji";
import { H1 } from "@/components/common/typography";



export default function NotFoundPage() {
	const t = useTranslations("not_found");

	return (
		<div className="grid justify-center content-center w-screen h-svh text-center gap-8 p-4">
			<Image
				src="https://feiax0ct75.ufs.sh/f/uqxElYaldN9nXDJXZFcjENFApfWILC7YuOvMrbxqsyzTR93k"
				alt="打扣不挺立，椎盤突傷悲"
				className="size-screen w-full max-w-sm rounded-lg shadow-md"
				width="512"
				height="512"
			/>
			<H1>
				{t("title")}{" "}
				<Twemoji
					options={{ className: "[--margin:_0.2em] inline size-[1.1em] mx-(--margin) align-[-0.2em] [&+.twemoji]:ml-0" }}
					noWrapper
				>
					<span>👨‍💻</span>
				</Twemoji>
			</H1>
		</div>
	);
}