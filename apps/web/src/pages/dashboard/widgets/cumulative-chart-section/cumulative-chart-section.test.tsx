import { DEFAULT_PERIOD } from "@repo/api/schemas";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { CumulativeChartSection } from "./cumulative-chart-section";

describe("CumulativeChartSection", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("requests chart data for the provided period", async () => {
		let days: string | null = null;

		server.use(
			http.get("*/dashboard/cumulative-chart", ({ request }) => {
				days = new URL(request.url).searchParams.get("days");

				return HttpResponse.json({
					data: {
						points: [
							{
								date: "2024-07-01T00:00:00.000Z",
								expenses: 100,
								incomes: 50,
							},
						],
					},
				});
			}),
		);

		renderWithProviders(<CumulativeChartSection days={7} />);

		await waitFor(() => {
			expect(days).toBe("7");
		});
	});

	it("renders area/bar toggle and section title", async () => {
		renderWithProviders(<CumulativeChartSection days={DEFAULT_PERIOD} />);

		expect(
			await screen.findByText(t("chart.running-title", { ns: "dashboard" })),
		).toBeInTheDocument();
		expect(
			screen.getByRole("radio", {
				name: t("chart.switch.area", { ns: "dashboard" }),
			}),
		).toBeInTheDocument();
		expect(
			screen.getByRole("radio", {
				name: t("chart.switch.bar", { ns: "dashboard" }),
			}),
		).toBeInTheDocument();
	});

	it("switches the chart type when bar is selected", async () => {
		const user = userEvent.setup();

		renderWithProviders(<CumulativeChartSection days={DEFAULT_PERIOD} />);

		await user.click(
			await screen.findByRole("radio", {
				name: t("chart.switch.bar", { ns: "dashboard" }),
			}),
		);

		expect(
			screen.getByRole("radio", {
				name: t("chart.switch.bar", { ns: "dashboard" }),
			}),
		).toHaveAttribute("data-state", "on");
	});

	it("shows the empty state when every point is zero", async () => {
		server.use(
			http.get("*/dashboard/cumulative-chart", () =>
				HttpResponse.json({
					data: {
						points: [
							{
								date: "2024-07-01T00:00:00.000Z",
								expenses: 0,
								incomes: 0,
							},
						],
					},
				}),
			),
		);

		renderWithProviders(<CumulativeChartSection days={DEFAULT_PERIOD} />);

		expect(
			await screen.findByText(t("chart.empty.title", { ns: "dashboard" })),
		).toBeInTheDocument();
	});
});
