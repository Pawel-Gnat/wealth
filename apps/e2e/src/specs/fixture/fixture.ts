import { expect, test as base } from '@playwright/test'
import { USER_EMAIL, USER_PASSWORD } from '../helpers/consts'
import { ensureI18nInit, getI18nText } from '../helpers/i18n'

type Fixtures = {
	loginAsTestUser: () => Promise<void>
}

export const test = base.extend<Fixtures>({
	loginAsTestUser: async ({ page }, run) => {
		const loginAsTestUser = async () => {
			await ensureI18nInit()

			await page.goto('/auth')

			const signupText = getI18nText('common', 'action.signup')
			const emailLabel = getI18nText('form', 'email.label')
			const passwordLabel = getI18nText('form', 'password.label')
			const confirmPasswordLabel = getI18nText('form', 'confirm-password.label')
			const signupButton = getI18nText('common', 'action.signup')
			const signinText = getI18nText('common', 'action.signin')
			const signinButton = getI18nText('common', 'action.signin')

			await page.getByRole('tab', { name: signupText }).click()
			await page.getByLabel(emailLabel).fill(USER_EMAIL)
			await page.getByLabel(passwordLabel, { exact: true }).fill(USER_PASSWORD)
			await page.getByLabel(confirmPasswordLabel).fill(USER_PASSWORD)

			await page.getByRole('button', { name: signupButton }).click()
			await expect(page.getByRole('button', { name: signupButton })).toBeEnabled({
				timeout: 30_000,
			})

			await page.getByRole('tab', { name: signinText }).click()
			await page.getByLabel(emailLabel).fill(USER_EMAIL)
			await page.getByLabel(passwordLabel, { exact: true }).fill(USER_PASSWORD)
			await page.getByRole('button', { name: signinButton }).click()
			await expect(page).toHaveURL('/', { timeout: 30_000 })
		}

		await run(loginAsTestUser)
	},
})
