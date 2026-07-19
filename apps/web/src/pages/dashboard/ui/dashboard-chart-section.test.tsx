import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { DashboardChartSection } from "./dashboard-chart-section";

describe("DashboardChartSection", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("requests week chart when week is selected", async () => {
		const user = userEvent.setup();
		let chartPeriod: string | null = null;

		const trackChartRequest = ({ request }: { request: Request }) => {
			const url = new URL(request.url);

			if (!url.pathname.endsWith("/dashboard/chart")) {
				return;
			}

			chartPeriod = url.searchParams.get("chartPeriod");
		};

		server.events.on("request:start", trackChartRequest);

		renderWithProviders(<DashboardChartSection />);

		await user.click(
			await screen.findByRole("radio", {
				name: t("common.week", { ns: "common" }),
			}),
		);

		await waitFor(() => {
			expect(chartPeriod).toBe("week");
		});

		server.events.removeListener("request:start", trackChartRequest);
	});

	it("renders period toggle and legend labels", async () => {
		renderWithProviders(<DashboardChartSection />);

		expect(
			await screen.findByRole("radio", {
				name: t("common.month", { ns: "common" }),
			}),
		).toBeInTheDocument();
		expect(
			screen.getByRole("radio", {
				name: t("common.week", { ns: "common" }),
			}),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("common.expenses", { ns: "common" })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("common.incomes", { ns: "common" })),
		).toBeInTheDocument();
	});
});
