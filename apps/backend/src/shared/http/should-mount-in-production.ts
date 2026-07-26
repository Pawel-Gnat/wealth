export const shouldMountInProduction = (
	nodeEnv = process.env.NODE_ENV,
): boolean => nodeEnv === "production";
