import type { Metadata } from 'next'
import './globals.css'

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

export const metadata: Metadata = {
  title: '產線測試區',
  description: '用於組合和測試聊天提示詞的頁面。',
}

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: { locale: string }
}>) {
  return (
    <div className="h-screen overflow-hidden">
		<NextSSRPlugin
			routerConfig={extractRouterConfig(ourFileRouter)}
		/>
		{children}
	</div>
  )
}
