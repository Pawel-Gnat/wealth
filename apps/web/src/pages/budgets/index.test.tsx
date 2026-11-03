import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { useNavigate } from "react-router";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { APP_ROUTES } from "@/app/routes";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { BudgetsPage } from "./index";

const BudgetsHarness = () => {
	const navigate = useNavigate();

	return (
		<>
			<button
				type="button"
				onClick={() => navigate(`${APP_ROUTES.budgets.list}#invitations`)}
			>
				open-invitations
			</button>
			<BudgetsPage />
		</>
	);
};

describe("BudgetsPage invitations anchor", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	beforeEach(() => {
		HTMLElement.prototype.scrollIntoView = vi.fn();
	});

	it("does not scroll without the invitations hash", async () => {
		renderWithProviders(<BudgetsPage />, {
			initialEntries: [APP_ROUTES.budgets.list],
			routePath: APP_ROUTES.budgets.list,
		});

		expect(
			await screen.findByText(t("invitations.title", { ns: "budgets" })),
		).toBeInTheDocument();
		expect(document.getElementById("invitations")).toBeInTheDocument();
		expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
	});

	it("scrolls to the invitations card when the hash is present", async () => {
		renderWithProviders(<BudgetsPage />, {
			initialEntries: [`${APP_ROUTES.budgets.list}#invitations`],
			routePath: APP_ROUTES.budgets.list,
		});

		expect(
			await screen.findByText(t("invitations.title", { ns: "budgets" })),
		).toBeInTheDocument();

		await waitFor(() => {
			expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
		});
	});

	it("scrolls when the page is already open and the hash appears", async () => {
		const user = userEvent.setup();

		renderWithProviders(<BudgetsHarness />, {
			initialEntries: [APP_ROUTES.budgets.list],
			routePath: APP_ROUTES.budgets.list,
		});

		expect(
			await screen.findByText(t("invitations.title", { ns: "budgets" })),
		).toBeInTheDocument();
		expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();

		await user.click(screen.getByRole("button", { name: "open-invitations" }));

		await waitFor(() => {
			expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
		});
	});
});
