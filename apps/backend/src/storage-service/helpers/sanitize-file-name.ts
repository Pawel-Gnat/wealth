export const sanitizeFileName = (name: string) => {
	const base = name.replace(/^.*[/\\]/, "").replace(/[^a-zA-Z0-9._-]/g, "_");
	return base.length > 0 ? base : "avatar";
};
