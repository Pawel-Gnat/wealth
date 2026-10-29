import { AUTH_AUDIT_EVENTS } from "@repo/api/events";
import { screen, within } from "@testing-library/react";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { MOCK_USER } from "@/test/mocks/user";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { AuditLog } from "./audit-log";

const params = { actions: [...AUTH_AUDIT_EVENTS] };

describe("AuditLog", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("shows the signed-in sentence, the actor avatar", async () => {
		renderWithProviders(<AuditLog params={params} users={[MOCK_USER]} />);

		expect(
			await screen.findByText(t("auth.signed-in", { ns: "events" })),
		).toBeInTheDocument();
		expect(screen.getByText("JD")).toBeInTheDocument();
		expect(screen.queryByText("auth.signed-in")).not.toBeInTheDocument();
		expect(screen.queryByText("John Doe")).not.toBeInTheDocument();

		const dataRow = screen.getAllByRole("row")[1];
		if (!dataRow) {
			throw new Error("Missing audit row");
		}
		const cells = within(dataRow).getAllByRole("cell");

		expect(cells[2]).toHaveTextContent(t("auth.signed-in", { ns: "events" }));
		expect(
			screen.getByText(t("pagination.rows-per-page", { ns: "common" })),
		).toBeInTheDocument();
	});

	it("shows an unknown user when the actor is not in the list", async () => {
		renderWithProviders(<AuditLog params={params} users={[]} />);

		expect(
			await screen.findByText(t("unknown-user", { ns: "audits" })),
		).toBeInTheDocument();
		expect(screen.queryByText("JD")).not.toBeInTheDocument();
	});

	it("keeps the header and hides pagination when the list is empty", async () => {
		server.use(http.get("*/audits", () => HttpResponse.json({ data: [] })));

		renderWithProviders(<AuditLog params={params} users={[MOCK_USER]} />);

		expect(
			await screen.findByText(t("empty.title", { ns: "audits" })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("empty.description", { ns: "audits" })),
		).toBeInTheDocument();
		expect(screen.getByText(t("actor", { ns: "audits" }))).toBeInTheDocument();
		expect(
			screen.queryByText(t("pagination.rows-per-page", { ns: "common" })),
		).not.toBeInTheDocument();
	});

	it("replaces the table with an error state", async () => {
		server.use(
			http.get("*/audits", () =>
				HttpResponse.json({ message: "Server error" }, { status: 500 }),
			),
		);

		renderWithProviders(<AuditLog params={params} users={[MOCK_USER]} />);

		expect(
			await screen.findByText(t("error.title", { ns: "audits" })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("error.description", { ns: "audits" })),
		).toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
	});
});
