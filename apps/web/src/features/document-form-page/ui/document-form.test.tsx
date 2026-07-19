import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DOCUMENT_CONFIG } from "@/shared/config/document-config";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { queryKeys } from "@/shared/lib/tanstack/query-key-factory";
import type { RecordKind } from "@/shared/types/record-kind";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { DocumentForm } from "./document-form";

const { navigateMock } = vi.hoisted(() => ({
	navigateMock: vi.fn(),
}));

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const formKinds = [
	{ kind: "expense", apiSegment: "expenses" },
	{ kind: "income", apiSegment: "incomes" },
] as const satisfies readonly { kind: RecordKind; apiSegment: string }[];

describe.each(formKinds)("$kind DocumentForm", ({ kind, apiSegment }) => {
	const config = DOCUMENT_CONFIG[kind];
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	beforeEach(() => {
		vi.mocked(toast.success).mockClear();
		vi.mocked(toast.error).mockClear();
		navigateMock.mockClear();
	});

	describe("validation", () => {
		it("shows title field error when submitting with empty line title", async () => {
			const user = userEvent.setup();
			renderWithProviders(<DocumentForm kind={kind} />);

			const createButton = screen.getByRole("button", {
				name: t("action.create", { ns: "common" }),
			});

			await user.click(createButton);

			expect(
				await screen.findByText(t("line-item.required", { ns: "form" })),
			).toBeInTheDocument();
		});

		it("shows price field error when submitting with price below 0.01", async () => {
			const user = userEvent.setup();
			renderWithProviders(<DocumentForm kind={kind} />);

			const createButton = screen.getByRole("button", {
				name: t("action.create", { ns: "common" }),
			});
			const lineItemLabel = screen.getByLabelText(
				t(config.lineItemLabelKey, { ns: "form" }),
			);
			const priceInput = screen.getByLabelText(
				t("single-amount.label", { ns: "form" }),
			);

			await user.type(lineItemLabel, "Coffee");
			fireEvent.input(priceInput, { target: { value: "0" } });
			await user.click(createButton);

			expect(
				await screen.findByText(t("single-amount.min", { ns: "form" })),
			).toBeInTheDocument();
		});

		it("shows quantity field error when submitting with quantity below 1", async () => {
			const user = userEvent.setup();
			renderWithProviders(<DocumentForm kind={kind} />);

			const createButton = screen.getByRole("button", {
				name: t("action.create", { ns: "common" }),
			});
			const lineItemLabel = screen.getByLabelText(
				t(config.lineItemLabelKey, { ns: "form" }),
			);
			const quantityInput = screen.getByLabelText(
				t("quantity.label", { ns: "form" }),
			);

			await user.type(lineItemLabel, "Taxi");
			fireEvent.input(quantityInput, { target: { value: "0" } });
			await user.click(createButton);

			expect(
				await screen.findByText(t("quantity.min", { ns: "form" })),
			).toBeInTheDocument();
		});

		it("add button click creates a new line item", async () => {
			const user = userEvent.setup();
			renderWithProviders(<DocumentForm kind={kind} />);

			const addButton = screen.getByRole("button", {
				name: t("action.add", { ns: "common" }),
			});

			await user.click(addButton);

			const lineItemInputs = screen.getAllByLabelText(
				t(config.lineItemLabelKey, { ns: "form" }),
			);
			expect(lineItemInputs).toHaveLength(2);
		});
	});

	describe("form submission", () => {
		it("shows success toast and navigates after create", async () => {
			const user = userEvent.setup();
			const { queryClient } = renderWithProviders(<DocumentForm kind={kind} />);
			const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

			const createButton = screen.getByRole("button", {
				name: t("action.create", { ns: "common" }),
			});
			const lineItemLabel = screen.getByLabelText(
				t(config.lineItemLabelKey, { ns: "form" }),
			);

			await user.type(lineItemLabel, "Lunch meeting");
			await user.click(createButton);

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith(
					t(config.toast.created, { ns: "common" }),
				);
			});

			expect(navigateMock).toHaveBeenCalledWith(config.listRoute);
			expect(invalidateSpy).toHaveBeenCalledWith({
				queryKey: queryKeys.dashboard.all(),
			});
		});

		it("shows error toast on API error", async () => {
			const user = userEvent.setup();
			server.use(
				http.post(`*/${apiSegment}`, () =>
					HttpResponse.json(
						{ error: { message: "Bad Request" } },
						{ status: 400 },
					),
				),
			);

			renderWithProviders(<DocumentForm kind={kind} />);

			const createButton = screen.getByRole("button", {
				name: t("action.create", { ns: "common" }),
			});
			const lineItemLabel = screen.getByLabelText(
				t(config.lineItemLabelKey, { ns: "form" }),
			);

			await user.type(lineItemLabel, "Valid row");
			await user.click(createButton);

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith(
					t(config.toast.createError, { ns: "common" }),
				);
			});

			expect(navigateMock).not.toHaveBeenCalled();
		});

		it("updates document when documentId is provided", async () => {
			const user = userEvent.setup();
			const documentId = "01JTZKQX2GT6PHGQER0M8FS6K8";
			renderWithProviders(
				<DocumentForm
					kind={kind}
					documentId={documentId}
					initialValues={{
						date: new Date("2024-03-01T12:00:00.000Z"),
						lineItems: [{ title: "Taxi", quantity: 1, singleAmount: 123.45 }],
					}}
				/>,
			);

			const saveButton = screen.getByRole("button", {
				name: t("action.save", { ns: "common" }),
			});
			await user.click(saveButton);

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith(
					t(config.toast.updated, { ns: "common" }),
				);
			});

			expect(navigateMock).toHaveBeenCalledWith(config.listRoute);
		});
	});
});
