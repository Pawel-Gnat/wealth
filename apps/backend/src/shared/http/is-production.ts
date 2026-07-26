export const isProduction = (nodeEnv = process.env.NODE_ENV): boolean =>
	nodeEnv === "production";
