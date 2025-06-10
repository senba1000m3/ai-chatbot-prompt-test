"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { CircleAlert, CircleCheck, CircleX, Info, LoaderCircle } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme()

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:font-sans group-[.toaster]:border-border group-[.toaster]:shadow-lg",
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
					cancelButton:
						"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
				},
			}}
			icons={{
				success: <CircleCheck className="size-4 text-green-500" />,
				info: <Info className="size-4" />,
				warning: <CircleAlert className="size-4 text-amber-500" />,
				error: <CircleX className="size-4 text-destructive" />,
				loading: <LoaderCircle className="size-4 animate-spin" />,
			}}
			closeButton={true}
			{...props}
		/>
	)
}

export { Toaster }