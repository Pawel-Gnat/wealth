import { expect, test as base } from '@playwright/test'
import { ensureI18nInit, getI18nText } from '../helpers/i18n'

type LoginAsUserInput = {
	email: string
	password: string
}

type Fixtures = {
	loginAsUser: (input: LoginAsUserInput) => Promise<void>
}

export const test = base.extend<Fixtures>({
	loginAsUser: async ({ page }, run) => {
		const loginAsUser = async ({ email, password }: LoginAsUserInput) => {
			await ensureI18nInit()

			await page.goto('/auth')

			const emailLabel = getI18nText('form', 'email.label')
			const passwordLabel = getI18nText('form', 'password.label')
			const signinText = getI18nText('common', 'action.signin')
			const signinButton = getI18nText('common', 'action.signin')

			await page.getByRole('tab', { name: signinText }).click()
			await page.getByLabel(emailLabel).fill(email)
			await page.getByLabel(passwordLabel, { exact: true }).fill(password)

			const signInResponse = page.waitForResponse(
				(response) =>
					response.request().method() === 'POST' &&
					response.url().includes('/auth/signin'),
				{ timeout: 30_000 },
			)

			await page.getByRole('button', { name: signinButton }).click()

			const response = await signInResponse
			if (!response.ok()) {
				const body = await response.text().catch(() => undefined)
				const message = `Sign in failed for ${email}: HTTP ${response.status()}`
				throw new Error(body ? `${message} — ${body}` : message)
			}

			await expect(page).toHaveURL('/', { timeout: 15_000 })
		}

		await run(loginAsUser)
	},
})
