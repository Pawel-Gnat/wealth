import { useState } from "react";

export const usePasswordVisibility = (type?: string) => {
	const [isRevealed, setIsRevealed] = useState(false);
	const isPassword = type === "password";

	const toggle = () => {
		setIsRevealed((current) => !current);
	};

	return {
		isPassword,
		isRevealed,
		inputType: isPassword && isRevealed ? "text" : type,
		toggle,
	};
};
