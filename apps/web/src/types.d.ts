import type { DEFAULT_NS, I18N_RESOURCES } from "@repo/common/i18n";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: typeof DEFAULT_NS;
		resources: (typeof I18N_RESOURCES)["en"];
	}
}
