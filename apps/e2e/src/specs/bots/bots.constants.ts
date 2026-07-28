export const BOT_IDS = ['bot1', 'bot2', 'bot3', 'bot4', 'bot5'] as const

export type BotId = (typeof BOT_IDS)[number]

export const BOT_EMAIL_BY_ID: Record<BotId, string> = {
	bot1: 'bot1@example.com',
	bot2: 'bot2@example.com',
	bot3: 'bot3@example.com',
	bot4: 'bot4@example.com',
	bot5: 'bot5@example.com',
}
