import { screen, waitFor } from "@testing-library/react";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import { APP_ROUTES } from "@/app/routes";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { DocumentList } from "./index";

describe("DocumentList", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("renders page copy and an add link to the create route", async () => {
		renderWithProviders(<DocumentList />);

		expect(
			screen.getByText(t("list.title", { ns: "records" })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("list.subtitle", { ns: "records" })),
		).toBeInTheDocument();

		const addLink = screen.getByRole("link", {
			name: t("action.add", { ns: "common" }),
		});

		expect(addLink).toHaveAttribute("href", APP_ROUTES.records.add);

		await waitFor(() => {
			expect(
				screen.getByRole("link", {
					name: t("action.preview", { ns: "common" }),
				}),
			).toBeInTheDocument();
		});
	});
});
