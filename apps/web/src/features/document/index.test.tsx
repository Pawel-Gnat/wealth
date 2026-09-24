import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DOCUMENT_CONFIG } from "@/features/config/document-config";
import type { RecordKind } from "@/features/model/record-kind";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { Document } from "./index";

const documentId = "01JTZKQX2GT6PHGQER0M8FS6K8";

const useParamsMock = vi.hoisted(() => vi.fn(() => ({})));

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();

	return {
		...actual,
		useParams: () => useParamsMock(),
	};
});

const documentKinds = [
	{
		kind: "expense",
		apiSegment: "expenses",
		lineItemTitle: "Taxi",
	},
	{
		kind: "income",
		apiSegment: "incomes",
		lineItemTitle: "Salary",
	},
] as const satisfies readonly {
	kind: RecordKind;
	apiSegment: string;
	lineItemTitle: string;
}[];

describe.each(documentKinds)("$kind Document", ({
	kind,
	apiSegment,
	lineItemTitle,
}) => {
	const config = DOCUMENT_CONFIG[kind];
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	beforeEach(() => {
		useParamsMock.mockReturnValue({ id: documentId });
	});

	it("renders nothing when document id is missing", () => {
		useParamsMock.mockReturnValue({});
		const { container } = renderWithProviders(<Document kind={kind} />);

		expect(container).toBeEmptyDOMElement();
	});

	it("renders page copy, actions, and document content", async () => {
		renderWithProviders(<Document kind={kind} />);

		expect(
			screen.getByText(t("single.title", { ns: config.i18nNamespace })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("single.description", { ns: config.i18nNamespace })),
		).toBeInTheDocument();

		const editLink = await screen.findByRole("link", {
			name: t("action.edit", { ns: "common" }),
		});

		expect(editLink).toHaveAttribute("href", config.editRoute(documentId));
		expect(
			screen.getByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		).toBeInTheDocument();

		expect(await screen.findByText(lineItemTitle)).toBeInTheDocument();
		expect(
			screen.getByText(t("common.total", { ns: "common" })),
		).toBeInTheDocument();
	});

	it("opens the delete dialog from the delete action", async () => {
		const user = userEvent.setup();
		renderWithProviders(<Document kind={kind} />);

		await user.click(
			await screen.findByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		);

		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(
			screen.getByText(t("delete.title", { ns: config.i18nNamespace })),
		).toBeInTheDocument();
	});

	it("shows an error when the document cannot be loaded", async () => {
		server.use(
			http.get(`*/${apiSegment}/${documentId}`, () =>
				HttpResponse.json({ error: { message: "Not Found" } }, { status: 404 }),
			),
		);

		renderWithProviders(<Document kind={kind} />);

		await waitFor(() => {
			expect(
				screen.getByText(t("single.error.title", { ns: config.i18nNamespace })),
			).toBeInTheDocument();
		});
		expect(screen.queryByText(lineItemTitle)).not.toBeInTheDocument();
	});
});
