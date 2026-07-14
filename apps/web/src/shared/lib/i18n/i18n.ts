import { initI18n } from "@repo/common/i18n";
import type { InitOptions } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

export function init18nWeb(options?: InitOptions) {
	return initI18n((i18nInstance) => {
		if (typeof window !== "undefined") {
			i18nInstance.use(LanguageDetector);
		}
		i18nInstance.use(initReactI18next);
	}, options);
}
