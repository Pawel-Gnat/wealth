import { screen, waitFor } from "@testing-library/react";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { RecordFormPage } from "./index";

const recordId = "01JTZKQX2GT6PHGQER0M8FS6K8";

const useParamsMock = vi.hoisted(() => vi.fn(() => ({})));

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();

	return {
		...actual,
		useParams: () => useParamsMock(),
	};
});

describe("RecordFormPage", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	beforeEach(() => {
		useParamsMock.mockReturnValue({});
	});

	it("renders the create form without fetching a record", () => {
		renderWithProviders(<RecordFormPage />);

		expect(
			screen.getByText(t("single.title-create", { ns: "records" })),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: t("action.create", { ns: "common" }),
			}),
		).toBeInTheDocument();
		expect(
			screen.queryByText(t("single.error.title", { ns: "records" })),
		).not.toBeInTheDocument();
	});

	it("loads the edit form from the default record handler", async () => {
		useParamsMock.mockReturnValue({ id: recordId });
		renderWithProviders(<RecordFormPage />);

		expect(
			await screen.findByText(t("single.title-edit", { ns: "records" })),
		).toBeInTheDocument();
		expect(
			await screen.findByRole("button", {
				name: t("action.save", { ns: "common" }),
			}),
		).toBeInTheDocument();
		expect(await screen.findByDisplayValue("Taxi")).toBeInTheDocument();
	});

	it("shows an error when the record cannot be loaded", async () => {
		useParamsMock.mockReturnValue({ id: recordId });
		server.use(
			http.get(`*/records/${recordId}`, () =>
				HttpResponse.json({ error: { message: "Not Found" } }, { status: 404 }),
			),
		);

		renderWithProviders(<RecordFormPage />);

		await waitFor(() => {
			expect(
				screen.getByText(t("single.error.title", { ns: "records" })),
			).toBeInTheDocument();
		});
		expect(
			screen.queryByRole("button", {
				name: t("action.save", { ns: "common" }),
			}),
		).not.toBeInTheDocument();
	});
});
