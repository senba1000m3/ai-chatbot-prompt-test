export type Meta = {
	title: string;
	description: string;
	url: string;
	keywords: string[];
}

export type AsChild = {
	asChild?: boolean;
};

// # Routes
export type LocaleParam = Promise<{
	locale: string;
}>;

export type ChatParams = Promise<{
	locale: string;
	chatId: string;
}>;