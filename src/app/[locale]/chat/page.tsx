// Components & UI
import { Message, MessageContent, MessageSeparator } from "@/components/ui/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WrapperLayout } from "@/components/common/layouts";

// Constants & Variables
const messages = [
	{
		id: "23",
		role: "user",
		content: [
			{ type: "text", text: "最近在搞個全端app 想說用Next.js 15搭React 19 你覺得可以嗎" }
		]
	},
	{
		id: "24",
		role: "assistant",
		content: [
			{ type: "text", text: "不錯喔 Next.js超強 支援SSR啥的 配Express.js很搭" }
		]
	},
	{
		id: "25",
		role: "assistant",
		content: [
			{ type: "text", text: "而且React 19效能提升多了 碰到複雜UI也不怕" }
		]
	},
	{
		id: "26",
		role: "user",
		content: [
			{ type: "text", text: "了解了解 我想把前後端串好 再用MongoDB來存資料" }
		]
	},
	{
		id: "27",
		role: "assistant",
		content: [
			{ type: "text", text: "很可以 MongoDB很好用 配Mongoose超順" }
		]
	},
	{
		id: "28",
		role: "assistant",
		content: [
			{ type: "text", text: "Express.js用來處理API 剛好 Next.js搞前端渲染" }
		]
	},
	{
		id: "29",
		role: "user",
		content: [
			{ type: "text", text: "有點猶豫 要用Next.js API Routes 還是乾脆Express.js直接上" }
		]
	},
	{
		id: "30",
		role: "assistant",
		content: [
			{ type: "text", text: "看需求啦 如果API很密集 Express.js靈活很多" }
		]
	},
	{
		id: "31",
		role: "assistant",
		content: [
			{ type: "text", text: "如果API比較簡單 Next.js的API Routes就夠了 而且還省事" }
		]
	},
	{
		id: "32",
		role: "user",
		content: [
			{ type: "text", text: "懂了 那你覺得要部署到哪個平台會比較好" }
		]
	},
	{
		id: "33",
		role: "assistant",
		content: [
			{ type: "text", text: "Next.js的話Vercel很適合啊 部署前端方便" }
		]
	},
	{
		id: "34",
		role: "assistant",
		content: [
			{ type: "text", text: "Express.js後端可以丟到DigitalOcean或AWS 彈性又穩" }
		]
	},
	{
		id: "35",
		role: "user",
		content: [
			{ type: "text", text: "好啊 我先本地跑跑看 順了再丟雲端" }
		]
	},
	{
		id: "36",
		role: "assistant",
		content: [
			{ type: "text", text: "讚 有問題隨時來問 項目順利" }
		]
	}
];



export default function ChatPage() {
	return (
		<>
			<ScrollArea className="h-full" scrollHideDelay={1000}>
				<WrapperLayout width={960}>
					<div className="flex flex-col">
						<DemoMessages />
						<MessageSeparator variant="unread">
							<span>October 12, 2024</span>
						</MessageSeparator>
						<DemoMessages />
					</div>
				</WrapperLayout>
			</ScrollArea>
		</>
	);
}

function DemoMessages() {
	return (
		<>
			{messages.map((message, index) => (
				<Message
					key={message.id}
					side={message.role === "assistant" ? "left" : "right"}
					showAvatar={message.role !== messages[index - 1]?.role}
				>
					<MessageContent variant="bubble">
						{message.content.map((content, index) => (
							<p key={index} className="">
								{content.type === "text" && content.text}
							</p>
						))}
					</MessageContent>
				</Message>
			))}
		</>
	);
}