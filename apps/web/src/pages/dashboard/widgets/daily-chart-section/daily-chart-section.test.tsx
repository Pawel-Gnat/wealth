import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { DailyChartSection } from "./daily-chart-section";

describe("DailyChartSection", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("requests 7-day chart when last 7 days is selected", async () => {
		const user = userEvent.setup();
		let days: string | null = null;

		server.use(
			http.get("*/dashboard/daily-chart", ({ request }) => {
				days = new URL(request.url).searchParams.get("days");

				return HttpResponse.json({
					data: {
						points: [
							{
								date: "2024-07-01T00:00:00.000Z",
								expenses: 40,
								incomes: 25,
							},
						],
					},
				});
			}),
		);

		renderWithProviders(<DailyChartSection />);

		await user.click(
			await screen.findByRole("radio", {
				name: t("common.last_n_days", { ns: "common", count: 7 }),
			}),
		);

		await waitFor(() => {
			expect(days).toBe("7");
		});
	});

	it("renders days toggle, section title, and legend labels", async () => {
		renderWithProviders(<DailyChartSection />);

		expect(
			await screen.findByRole("heading", {
				name: t("chart.daily_title", { ns: "dashboard" }),
			}),
		).toBeInTheDocument();
		expect(
			screen.getByRole("radio", {
				name: t("common.last_n_days", { ns: "common", count: 30 }),
			}),
		).toBeInTheDocument();
		expect(
			screen.getByRole("radio", {
				name: t("common.last_n_days", { ns: "common", count: 7 }),
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
