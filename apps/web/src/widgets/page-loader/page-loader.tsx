import { Icon } from "@/shared/components";

export const PageLoader = () => {
	return (
		<div className="flex h-svh w-full items-center justify-center">
			<Icon name="loader" className="animate-spin size-12" />
		</div>
	);
};
