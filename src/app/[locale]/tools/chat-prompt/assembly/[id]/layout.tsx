import type { Metadata } from 'next'
import './globals.css'

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
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
