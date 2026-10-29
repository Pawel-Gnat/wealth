import { screen } from "@testing-library/react";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { SettingsPage } from "./index";

describe("SettingsPage", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("shows the audit log under the account cards", async () => {
		renderWithProviders(<SettingsPage />);

		expect(
			await screen.findByText(t("title", { ns: "audits" })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("profile.title", { ns: "settings" })),
		).toBeInTheDocument();
	});
});
