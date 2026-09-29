import { useEffect, useState } from "react";

const DELAY = 300;

export const useDebounce = <T>(value: T, delay = DELAY) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timeoutId = setTimeout(() => setDebouncedValue(value), delay);

		return () => clearTimeout(timeoutId);
	}, [value, delay]);

	return debouncedValue;
};
