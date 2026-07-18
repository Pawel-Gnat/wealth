import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { DashboardChartSection } from "./dashboard-chart-section";

vi.mock("@/features/dashboard/ui/dashboard-chart", () => ({
	DashboardChart: ({ chartPeriod }: { chartPeriod: string }) => (
		<div data-testid="dashboard-chart">{chartPeriod}</div>
	),
}));

describe("DashboardChartSection", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("loads month chart by default and switches to week", async () => {
		const user = userEvent.setup();

		renderWithProviders(<DashboardChartSection />);

		expect(await screen.findByTestId("dashboard-chart")).toHaveTextContent(
			"month",
		);

		await user.click(
			screen.getByRole("radio", {
				name: t("common.week", { ns: "common" }),
			}),
		);

		await waitFor(() => {
			expect(screen.getByTestId("dashboard-chart")).toHaveTextContent("week");
		});
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
