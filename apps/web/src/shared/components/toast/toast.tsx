import { cn } from "cn";
import type { ComponentProps, CSSProperties } from "react";
import { type ExternalToast, toast as sonnerToast } from "sonner";
import { Toaster as SonnerToaster } from "@/shared/lib/ui/sonner";
import { Icon } from "../icons";

export type ToastOptions = ExternalToast;

const show =
	(type: "success" | "error" | "info" | "warning" | "loading") =>
	(title: string, options?: ToastOptions) =>
		options === undefined
			? sonnerToast[type](title)
			: sonnerToast[type](title, options);

export const toast = {
	success: show("success"),
	error: show("error"),
	info: show("info"),
	warning: show("warning"),
	loading: show("loading"),
	promise: sonnerToast.promise,
	dismiss: sonnerToast.dismiss,
};

const toasterClassName = "toaster group";

const toasterStyle = {
	"--normal-bg": "var(--card)",
	"--normal-text": "var(--foreground)",
	"--normal-border": "var(--border)",
	"--border-radius": "var(--radius)",
	"--width": "348px",
} as CSSProperties;

const toastClassName = cn(
	"cn-toast",
	"p-3! gap-2! font-sans! shadow-sm!",
	"focus-visible:shadow-[var(--shadow-sm),0_0_0_2px_var(--ring)]!",
);

type ToasterProps = ComponentProps<typeof SonnerToaster>;

export const Toaster = ({
	toastOptions,
	className,
	style,
	...props
}: ToasterProps) => (
	<SonnerToaster
		{...props}
		className={cn(toasterClassName, className)}
		style={{ ...toasterStyle, ...style }}
		icons={{
			success: <Icon name="success" variant="badge" color="success" />,
			error: <Icon name="error" variant="badge" color="destructive" />,
			info: <Icon name="info" variant="badge" color="muted" />,
			warning: <Icon name="warning" variant="badge" color="muted" />,
			loading: (
				<Icon
					name="loader"
					variant="badge"
					color="muted"
					className="animate-spin"
				/>
			),
		}}
		toastOptions={{
			...toastOptions,
			classNames: {
				...toastOptions?.classNames,
				toast: cn(toastClassName, toastOptions?.classNames?.toast),
				title: cn(
					"text-sm! font-normal! text-foreground!",
					toastOptions?.classNames?.title,
				),
				icon: cn("m-0! size-5!", toastOptions?.classNames?.icon),
			},
		}}
	/>
);
