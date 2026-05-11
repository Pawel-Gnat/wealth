import { i18n, initI18n, type Namespace, type ParseKeys } from '@repo/common'

const TEST_LANGUAGE = 'en'

let initPromise: Promise<void> | null = null

export async function ensureI18nInit() {
	if (!initPromise) {
		initPromise = initI18n(() => {}).then(() => {})
	}
	await initPromise
}

export const getI18nText = <Ns extends Namespace>(ns: Ns, key: ParseKeys<Ns>): string =>
	String(
		i18n.t(
			`${String(ns)}:${String(key)}` as never,
			{
				lng: TEST_LANGUAGE,
			} as never,
		),
	)
