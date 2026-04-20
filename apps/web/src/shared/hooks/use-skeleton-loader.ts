import { useSpinDelay } from "spin-delay";

type UseLoaderProps = {
	isLoading: boolean;
	delay?: number;
	minDuration?: number;
};

export const useSkeletonLoader = ({
	isLoading,
	delay = 300,
	minDuration = 500,
}: UseLoaderProps) => {
	return useSpinDelay(isLoading, { delay, minDuration });
};
