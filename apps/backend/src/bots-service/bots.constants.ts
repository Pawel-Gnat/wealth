export const DAILY_ACTIVITY_BOT_EMAILS = [
	"bot1@example.com",
	"bot2@example.com",
	"bot3@example.com",
	"bot4@example.com",
	"bot5@example.com",
] as const;

export type DailyActivityBotEmail = (typeof DAILY_ACTIVITY_BOT_EMAILS)[number];
