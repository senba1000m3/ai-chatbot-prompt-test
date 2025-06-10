import { useTranslations } from "next-intl";

// Components & UI
import { H1 } from "@/components/common/typography";



export default function NotFoundPage() {
	const t = useTranslations("not_found");

	return (
		<div>
			<H1>{t("title")}</H1>
		</div>
	);
}