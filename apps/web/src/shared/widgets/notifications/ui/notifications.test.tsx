import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { delay, HttpResponse, http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { Notifications } from "./notifications";

const openPanel = async () => {
	const user = userEvent.setup();
	renderWithProviders(<Notifications />);

	await user.click(
		screen.getByRole("button", { name: t("title", { ns: "notifications" }) }),
	);
};

let t: TFunction;

describe("Notifications", () => {
	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("shows the list and mark all when a notification is unread", async () => {
		await openPanel();

		expect(
			await screen.findByText(
				t("budget.member.invited.title", { ns: "notifications" }),
			),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				t("budget.member.invited.body", {
					ns: "notifications",
					budget: "Household",
				}),
			),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("new", { ns: "notifications" })),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: t("mark-all", { ns: "notifications" }),
			}),
		).toBeInTheDocument();
	});

	it("shows the empty state and hides mark all", async () => {
		server.use(
			http.get("*/notifications", () => HttpResponse.json({ data: [] })),
		);

		await openPanel();

		expect(
			await screen.findByText(t("empty.title", { ns: "notifications" })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("empty.description", { ns: "notifications" })),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", {
				name: t("mark-all", { ns: "notifications" }),
			}),
		).not.toBeInTheDocument();
	});

	it("shows the error state and hides mark all", async () => {
		server.use(
			http.get("*/notifications", () =>
				HttpResponse.json({ message: "Server error" }, { status: 500 }),
			),
		);

		await openPanel();

		expect(
			await screen.findByText(
				t("error.title", { ns: "notifications" }),
				undefined,
				{
					timeout: 3000,
				},
			),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("error.description", { ns: "notifications" })),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", {
				name: t("mark-all", { ns: "notifications" }),
			}),
		).not.toBeInTheDocument();
	});

	it("shows a skeleton and keeps the header while the list is loading", async () => {
		server.use(
			http.get("*/notifications", async () => {
				await delay("infinite");
				return HttpResponse.json({ data: [] });
			}),
		);

		await openPanel();

		expect(
			screen.getByText(t("title", { ns: "notifications" })),
		).toBeInTheDocument();
		expect(document.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3);
		expect(
			screen.queryByRole("button", {
				name: t("mark-all", { ns: "notifications" }),
			}),
		).not.toBeInTheDocument();
	});

	it("hides mark all when every notification is read", async () => {
		server.use(
			http.get("*/notifications", () =>
				HttpResponse.json({
					data: [
						{
							id: "01JTZKQX2GT6PHGQER0M8FS6KD",
							event: "budget.member.invited",
							metadata: {
								budgetId: "01JTZKQX2GT6PHGQER0M8FS6KA",
								budgetName: "Household",
							},
							readAt: "2026-10-29T08:00:00.000Z",
							createdAt: "2026-10-29T07:14:00.000Z",
						},
					],
				}),
			),
		);

		await openPanel();

		expect(
			await screen.findByText(
				t("budget.member.invited.title", { ns: "notifications" }),
			),
		).toBeInTheDocument();
		expect(
			screen.queryByText(t("new", { ns: "notifications" })),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", {
				name: t("mark-all", { ns: "notifications" }),
			}),
		).not.toBeInTheDocument();
	});
});
