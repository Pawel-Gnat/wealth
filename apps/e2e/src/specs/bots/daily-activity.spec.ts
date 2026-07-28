import type { Page } from '@playwright/test'
import { ensureI18nInit, getI18nText } from '../helpers/i18n'
import { expect, test } from '../helpers/test'
import { BOT_EMAIL_BY_ID, BOT_IDS, type BotId } from './bots.constants'
import { createExpenseDocument, createIncomeDocument } from './create-document'
import {
	createExpensePayload,
	createIncomePayload,
	shouldCreateDocument,
} from './document-payload'

const isBotId = (value: string): value is BotId =>
	(BOT_IDS as readonly string[]).includes(value)

const resolveBotIdsToRun = (): BotId[] => {
	const botIdFilter = process.env['BOT_ID']
	if (!botIdFilter) {
		return [...BOT_IDS]
	}

	if (!isBotId(botIdFilter)) {
		throw new Error(
			`Unknown BOT_ID "${botIdFilter}". Expected one of: ${BOT_IDS.join(', ')}`,
		)
	}

	return [botIdFilter]
}

const logout = async (page: Page) => {
	const logoutButton = getI18nText('common', 'action.logout')
	await page.getByRole('button', { name: logoutButton }).click()
	await expect(page).toHaveURL(/\/auth/, { timeout: 30_000 })
}

const botIdsToRun = resolveBotIdsToRun()

for (const botId of botIdsToRun) {
	test(`daily activity — ${botId}`, async ({ page, loginAsUser }) => {
		const botPassword = process.env['BOT_PASSWORD']
		if (!botPassword) {
			throw new Error('BOT_PASSWORD is required for bots tests')
		}

		await ensureI18nInit()

		await loginAsUser({
			email: BOT_EMAIL_BY_ID[botId],
			password: botPassword,
		})

		for (let attempt = 1; attempt <= 2; attempt += 1) {
			if (shouldCreateDocument()) {
				const payload = createExpensePayload()
				console.log(
					`[${botId}] expense #${attempt}: create — "${payload.title}" (${payload.singleAmount} x ${payload.quantity})`,
				)
				await createExpenseDocument(page, payload)
			} else {
				console.log(`[${botId}] expense #${attempt}: skip`)
			}
		}

		if (shouldCreateDocument()) {
			const payload = createIncomePayload()
			console.log(
				`[${botId}] income: create — "${payload.title}" (${payload.singleAmount} x ${payload.quantity})`,
			)
			await createIncomeDocument(page, payload)
		} else {
			console.log(`[${botId}] income: skip`)
		}

		await logout(page)
	})
}
