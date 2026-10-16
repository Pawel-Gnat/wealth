import { useSpinDelay } from "spin-delay";

export const LOADER_DELAY = 300;
export const LOADER_MIN_DURATION = 500;

type UseLoaderProps = {
	isLoading: boolean;
	delay?: number;
	minDuration?: number;
};

export const useLoader = ({
	isLoading,
	delay = LOADER_DELAY,
	minDuration = LOADER_MIN_DURATION,
}: UseLoaderProps) => {
	return useSpinDelay(isLoading, { delay, minDuration });
};
