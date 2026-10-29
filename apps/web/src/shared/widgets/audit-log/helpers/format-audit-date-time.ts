import { formatDocumentDate } from "@repo/common/helpers";

export const formatAuditDateTime = (createdAt: string, language: string) => {
	const date = new Date(createdAt);
	const time = date.toLocaleTimeString(language, {
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	});

	return `${formatDocumentDate(date, language)}, ${time}`;
};
