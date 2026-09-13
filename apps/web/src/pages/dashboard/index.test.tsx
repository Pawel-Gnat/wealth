import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import { formatPrice } from "@/shared/components/price/helpers/price.helpers";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { DashboardPage } from "./index";

describe("DashboardPage", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("selects the last 7 days and still shows dashboard data", async () => {
		const user = userEvent.setup();

		renderWithProviders(<DashboardPage />);

		await user.click(
			await screen.findByRole("radio", {
				name: t("common.last-n-days-other", { ns: "common", count: 7 }),
			}),
		);

		expect(
			screen.getByRole("radio", {
				name: t("common.last-n-days-other", { ns: "common", count: 7 }),
			}),
		).toHaveAttribute("data-state", "on");

		expect(
			screen.getByText(t("chart.daily-title", { ns: "dashboard" })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("chart.running-title", { ns: "dashboard" })),
		).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText(formatPrice(250, "en"))).toBeInTheDocument();
		});
	});
});
