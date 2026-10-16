import { ErrorState } from "@/shared/components";

export const ErrorPage = () => {
	return (
		<div className="flex h-svh w-full flex-col items-center justify-center gap-4 px-4">
			<ErrorState
				title="Something went wrong."
				description="Please try again."
			/>
		</div>
	);
};
