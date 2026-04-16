import i18n, {
	type InitOptions,
	type Namespace,
	type ParseKeys,
} from "i18next";

export type { ParseKeys, TOptionsBase } from "i18next";

import enCommon from "./locales/en/common.json";
import enDashboard from "./locales/en/dashboard.json";

export type ParseNsKeys<Ns extends Namespace> =
	`${Ns extends string ? Ns : ""}:${ParseKeys<Ns>}`;

export const DEFAULT_NS = "common" as const;
export const I18N_RESOURCES = {
	en: {
		common: enCommon,
		dashboard: enDashboard,
	},
} as const;

const namespaces = Object.keys(I18N_RESOURCES.en);

export function initI18n(
	middleware: (instance: typeof i18n) => void,
	options?: InitOptions,
) {
	const i18nInstance = i18n;

	middleware(i18nInstance);

	return i18nInstance.init({
		resources: I18N_RESOURCES,
		fallbackLng: "en",
		ns: namespaces,
		defaultNS: DEFAULT_NS,
		interpolation: {
			escapeValue: false,
		},
		react: {
			useSuspense: false,
		},
		...options,
	});
}

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: typeof DEFAULT_NS;
		resources: (typeof I18N_RESOURCES)["en"];
	}
}
