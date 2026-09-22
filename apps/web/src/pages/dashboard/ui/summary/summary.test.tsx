import { DEFAULT_PERIOD } from "@repo/api/schemas";
import { screen, waitFor } from "@testing-library/react";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";
import { formatPrice } from "@/shared/components/price/helpers/price.helpers";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { Summary } from "./summary";

describe("Summary", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("shows error state when summary request fails", async () => {
		server.use(
			http.get("*/dashboard/summary", () =>
				HttpResponse.json({ message: "Server error" }, { status: 500 }),
			),
		);

		renderWithProviders(<Summary days={DEFAULT_PERIOD} />);

		expect(
			await screen.findByText(t("summary.error.title", { ns: "dashboard" })),
		).toBeInTheDocument();
	});

	it("requests summary data for the provided period", async () => {
		let days: string | null = null;

		server.use(
			http.get("*/dashboard/summary", ({ request }) => {
				days = new URL(request.url).searchParams.get("days");

				return HttpResponse.json({
					data: {
						expenses: { amount: 100, percentChange: 12.5 },
						incomes: { amount: 250, percentChange: null },
						netBalance: { amount: 150, percentChange: -3.2 },
					},
				});
			}),
		);

		renderWithProviders(<Summary days={7} />);

		await waitFor(() => {
			expect(days).toBe("7");
		});
	});

	it("renders summary amounts and percent badges", async () => {
		renderWithProviders(<Summary days={DEFAULT_PERIOD} />);

		await waitFor(() => {
			expect(screen.getByText(formatPrice(100, "en"))).toBeInTheDocument();
		});

		expect(screen.getByText(formatPrice(250, "en"))).toBeInTheDocument();
		expect(screen.getByText(formatPrice(150, "en"))).toBeInTheDocument();
		expect(screen.getByText("+12.5%")).toBeInTheDocument();
		expect(screen.getByText("-3.2%")).toBeInTheDocument();
		expect(screen.queryByText("0.0%")).not.toBeInTheDocument();
		expect(
			screen.getByText(t("common.expenses", { ns: "common" })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("common.incomes", { ns: "common" })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("common.net-balance", { ns: "common" })),
		).toBeInTheDocument();
		expect(
			screen.getAllByText(t("summary.vs-previous-period", { ns: "dashboard" })),
		).toHaveLength(2);
	});

	it("shows empty copy and no percent badge when amount is 0", async () => {
		server.use(
			http.get("*/dashboard/summary", () =>
				HttpResponse.json({
					data: {
						expenses: { amount: 0, percentChange: 12.5 },
						incomes: { amount: 0, percentChange: null },
						netBalance: { amount: 0, percentChange: -3.2 },
					},
				}),
			),
		);

		renderWithProviders(<Summary days={DEFAULT_PERIOD} />);

		expect(
			await screen.findAllByText(t("summary.empty", { ns: "dashboard" })),
		).toHaveLength(3);
		expect(screen.queryByText("+12.5%")).not.toBeInTheDocument();
		expect(screen.queryByText("-3.2%")).not.toBeInTheDocument();
		expect(
			screen.queryByText(t("summary.vs-previous-period", { ns: "dashboard" })),
		).not.toBeInTheDocument();
	});

	it("shows skeleton while summary is loading", async () => {
		server.use(
			http.get("*/dashboard/summary", async () => {
				await new Promise(() => undefined);
				return HttpResponse.json({ data: {} });
			}),
		);

		const { container } = renderWithProviders(
			<Summary days={DEFAULT_PERIOD} />,
		);

		await waitFor(() => {
			expect(
				container.querySelectorAll('[data-slot="skeleton"]').length,
			).toBeGreaterThan(0);
		});
	});
});
