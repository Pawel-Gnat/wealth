import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { ensureI18nInit, getI18nText } from './i18n'

type SignupAsUserInput = {
	email: string
	password: string
}

export const signupAsUser = async (
	page: Page,
	{ email, password }: SignupAsUserInput,
) => {
	await ensureI18nInit()

	await page.goto('/auth')

	const signupText = getI18nText('common', 'action.signup')
	const emailLabel = getI18nText('form', 'email.label')
	const passwordLabel = getI18nText('form', 'password.label')
	const confirmPasswordLabel = getI18nText('form', 'confirm-password.label')
	const signupButton = getI18nText('common', 'action.signup')

	await page.getByRole('tab', { name: signupText }).click()
	await page.getByLabel(emailLabel).fill(email)
	await page.getByLabel(passwordLabel, { exact: true }).fill(password)
	await page.getByLabel(confirmPasswordLabel).fill(password)

	await page.getByRole('button', { name: signupButton }).click()
	await expect(page.getByRole('button', { name: signupButton })).toBeEnabled({
		timeout: 30_000,
	})
}
