import { screen, waitFor } from "@testing-library/react";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";
import { formatPrice } from "@/shared/helpers/price";
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

		renderWithProviders(<Summary />);

		expect(
			await screen.findByText(t("summary.error", { ns: "dashboard" })),
		).toBeInTheDocument();
	});

	it("renders summary amounts and percent badges", async () => {
		renderWithProviders(<Summary />);

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
			screen.getByText(t("common.net_balance", { ns: "common" })),
		).toBeInTheDocument();
	});

	it("shows skeleton while summary is loading", async () => {
		server.use(
			http.get("*/dashboard/summary", async () => {
				await new Promise(() => undefined);
				return HttpResponse.json({ data: {} });
			}),
		);

		const { container } = renderWithProviders(<Summary />);

		await waitFor(() => {
			expect(
				container.querySelectorAll('[data-slot="skeleton"]').length,
			).toBeGreaterThan(0);
		});
	});
});
