import { screen, waitFor } from "@testing-library/react";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import { APP_ROUTES } from "@/app/routes";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { MOCK_BUDGET_ID, MOCK_MEMBER_BUDGET_ID } from "@/test/mocks/handlers";
import { renderWithProviders } from "@/test/render-with-providers";
import { RecordsListPage } from "./index";

const renderBudgetRecords = (budgetId: string) =>
	renderWithProviders(<RecordsListPage />, {
		initialEntries: [`/budgets/${budgetId}`],
		routePath: "/budgets/:budgetId",
	});

describe("RecordsListPage", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("renders page copy and an add link to the create route", async () => {
		renderWithProviders(<RecordsListPage />);

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

		expect(
			screen.queryByRole("button", {
				name: t("action.invite", { ns: "common" }),
			}),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", {
				name: t("action.leave", { ns: "common" }),
			}),
		).not.toBeInTheDocument();
	});

	it("shows owner actions on a budget the user owns", async () => {
		renderBudgetRecords(MOCK_BUDGET_ID);

		expect(
			screen.getByText(t("records.title", { ns: "budgets" })),
		).toBeInTheDocument();

		await waitFor(() => {
			expect(
				screen.getByRole("button", {
					name: t("action.invite", { ns: "common" }),
				}),
			).toBeInTheDocument();
		});

		expect(
			screen.getByRole("button", {
				name: t("action.edit", { ns: "common" }),
			}),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", {
				name: t("action.leave", { ns: "common" }),
			}),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("link", {
				name: t("action.add", { ns: "common" }),
			}),
		).toHaveAttribute("href", APP_ROUTES.budgets.add(MOCK_BUDGET_ID));
	});

	it("shows leave for an active member", async () => {
		renderBudgetRecords(MOCK_MEMBER_BUDGET_ID);

		await waitFor(() => {
			expect(
				screen.getByRole("button", {
					name: t("action.leave", { ns: "common" }),
				}),
			).toBeInTheDocument();
		});

		expect(
			screen.queryByRole("button", {
				name: t("action.invite", { ns: "common" }),
			}),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", {
				name: t("action.edit", { ns: "common" }),
			}),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		).not.toBeInTheDocument();
	});
});
