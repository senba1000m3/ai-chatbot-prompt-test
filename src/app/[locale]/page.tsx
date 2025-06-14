"use client";
import { useState, useEffect, Fragment } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
// import { subscribeUser, unsubscribeUser } from "../actions";

// Components & UI
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Display, H2, H3, H5, P, Muted } from "@/components/common/typography";
import { SectionLayout, WrapperLayout } from "@/components/common/layouts";

// Icons & Images
import {
	ChevronDown,
	CloudUpload,
	Code,
	GitBranch,
	Globe,
	Image,
	Key,
	MessagesSquare,
	Search,
	Share,
	Smartphone,
	Sparkles,
	Users,
	Zap,
} from "lucide-react";

// Constants & Variables
import type { LucideIcon } from "lucide-react";
import Silk from "@/components/main/silk";
type Requirement = {
	checked: boolean;
	icon: LucideIcon;
	name: string;
	description: string;
	footnote?: string;
};

const REQUIREMENTS: Record<string, Requirement[]> = {
	"core": [
		{ checked: true, icon: MessagesSquare, name: "Chat with Various LLMs", description: "Implement support for multiple language models and providers" },
		{ checked: true, icon: Users, name: "Authentication & Sync", description: "User authentication with chat history synchronization" },
		{ checked: true, icon: Globe, name: "Browser Friendly", description: "Ensure the app works smoothly in a web browser without native installations" },
		{ checked: true, icon: Zap, name: "Easy to Try", description: "Provide an easily accessible demo or onboarding experience" },
	],
	"bonus": [
		{ checked: false, icon: CloudUpload, name: "Attachment Support", description: "Allow users to upload files (images and PDFs)" },
		{ checked: false, icon: Image, name: "Image Generation Support", description: "AI-powered image generation capabilities" },
		{ checked: true, icon: Code, name: "Syntax Highlighting", description: "Beautiful code formatting and highlighting" },
		{ checked: false, icon: Zap, name: "Resumable Streams", description: "Continue generation after page refresh" },
		{ checked: false, icon: GitBranch, name: "Chat Branching", description: "Create alternative conversation paths" },
		{ checked: false, icon: Share, name: "Chat Sharing", description: "Share conversations with others" },
		{ checked: false, icon: Search, name: "Web Search", description: "Integrate real-time web search" },
		{ checked: false, icon: Key, name: "Bring Your Own Key", description: "Use your own API keys" },
		{ checked: true, icon: Smartphone, name: "Mobile App", description: "Why not ship mobile and web?", footnote: "Not actually an app but PWA :)" },
		{ checked: false, icon: Sparkles, name: "Anything Else", description: "Get creative - we love unique ideas :)" },
	],
};



export default function HomePage() {
	const router = useRouter();

	useEffect(() => {
		router.prefetch("/signin");
	}, [router]);

	return (
		<div className="relative pb-8">
			<Silk
				className="absolute! left-0 top-0 h-svh! opacity-50 mask-b-to-transparent mask-b-from-50% -z-1"
				scale={1.25}
			/>
			<WrapperLayout>
				<HomePageHeader />
				<WrapperLayout width={1280} asChild>
					<main className="py-4">
						<T3ChatCloneathonSection />
					</main>
				</WrapperLayout>
			</WrapperLayout>
		</div>
	);
}

function HomePageHeader() {
	const t = useTranslations("layout.homepage");

	return (
		<header className="relative grid h-svh">
			<div className="place-self-center grid justify-items-center text-center">
				{/* <Display>Welcome to <span className="inline-block">Project τ</span></Display> */}
				<Display className="text-balance">
					{t.rich("heading", {
						title: (chunks) => <span className="inline-block">{chunks}</span>,
						name: t("title"),
					})}
				</Display>
				<P className="leading-relaxed text-muted-foreground">
					{t("description")}
				</P>
				<Button size="lg" className="btn-chrome mt-12" asChild>
					<Link href="/signin">
						<span>Get Started</span>
					</Link>
				</Button>
				{/* <PushNotificationManager /> */}
			</div>
			<Button
				variant="ghost"
				size="lg"
				className="absolute bottom-8 left-1/2 -translate-x-1/2 size-12 animate-bounce"
				onClick={() => window.scrollTo(({
					top: window?.visualViewport?.height ?? window.innerHeight,
				}))}
			>
				<ChevronDown className="size-5" />
			</Button>
		</header>
	);
}

function T3ChatCloneathonSection() {
	return (
		<SectionLayout title="">
			<H2 id="requirements">T3 Chat Cloneathon Requirements</H2>
			{Object.entries(REQUIREMENTS).map(([key, reqs]) => (
				<Fragment key={key}>
					<H3 className="mb-2">{key.charAt(0).toUpperCase() + key.slice(1)}</H3>
					<ul className="grid gap-1 @lg:gap-2 @lg:grid-cols-2">
						{reqs.map((req) => (
							<Label
								key={req.name}
								htmlFor={req.name.toLowerCase().replace("&", "and").replace(/\s+/, "-")}
								className="flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-accent/50"
							>
								<Checkbox
									id={req.name.toLowerCase().replace("&", "and").replace(/\s+/, "-")}
									name={req.name.toLowerCase().replace("&", "and").replace(/\s+/, "-")}
									checked={req.checked}
									onCheckedChange={() => {}}
									disabled
								/>
								<div className="grid gap-1 font-normal">
									<H5 className="flex items-center gap-2" asChild><span>
										<req.icon className="size-5" />
										{req.name}{req?.footnote && " *"}
									</span></H5>
									<Muted className="text-sm">{req.description}</Muted>
								</div>
							</Label>
						))}
					</ul>
				</Fragment>
			))}
		</SectionLayout>
	);
}

// function PushNotificationManager() {
// 	const [isSupported, setIsSupported] = useState(false)
// 	const [subscription, setSubscription] = useState<PushSubscription | null>(
// 		null
// 	)

// 	useEffect(() => {
// 		if ('serviceWorker' in navigator && 'PushManager' in window) {
// 			setIsSupported(true)
// 			registerServiceWorker()
// 		}
// 	}, [])

// 	async function registerServiceWorker() {
// 		const registration = await navigator.serviceWorker.register('/sw.js', {
// 			scope: '/',
// 			updateViaCache: 'none',
// 		})
// 		const sub = await registration.pushManager.getSubscription()
// 		setSubscription(sub)
// 	}

// 	async function subscribeToPush() {
// 		const registration = await navigator.serviceWorker.ready
// 		const sub = await registration.pushManager.subscribe({
// 			userVisibleOnly: true,
// 			applicationServerKey: urlBase64ToUint8Array(
// 				process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
// 			),
// 		})
// 		setSubscription(sub)
// 		const serializedSub = JSON.parse(JSON.stringify(sub))
// 		await subscribeUser(serializedSub)
// 	}

// 	async function unsubscribeFromPush() {
// 		await subscription?.unsubscribe()
// 		setSubscription(null)
// 		await unsubscribeUser()
// 	}

// 	if (!isSupported) {
// 		return <p>Push notifications are not supported in this browser.</p>
// 	}

// 	return (
// 		<>
// 			<H2>Push Notifications</H2>
// 			{subscription ? (
// 				<>
// 					<P>You are subscribed to push notifications.</P>
// 					<Button onClick={unsubscribeFromPush}>Unsubscribe</Button>
// 				</>
// 			) : (
// 				<>
// 					<p>You are not subscribed to push notifications.</p>
// 					<Button onClick={subscribeToPush}>Subscribe</Button>
// 				</>
// 			)}
// 		</>
// 	)
// }

// function urlBase64ToUint8Array(base64String: string) {
// 	const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
// 	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

// 	const rawData = window.atob(base64)
// 	const outputArray = new Uint8Array(rawData.length)

// 	for (let i = 0; i < rawData.length; ++i) {
// 		outputArray[i] = rawData.charCodeAt(i)
// 	}
// 	return outputArray
// }