import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { DOCUMENT_CONFIG } from "@/shared/config/document-config";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import type { RecordKind } from "@/shared/types/record-kind";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { DocumentDeleteDialog } from "./document-delete-dialog";

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const documentId = "01JTZKQX2GT6PHGQER0M8FS6K8";

const dialogKinds = [
	{
		kind: "expense",
		apiSegment: "expenses",
	},
	{
		kind: "income",
		apiSegment: "incomes",
	},
] as const satisfies readonly {
	kind: RecordKind;
	apiSegment: string;
}[];

describe.each(dialogKinds)("$kind DocumentDeleteDialog", ({
	kind,
	apiSegment,
}) => {
	const config = DOCUMENT_CONFIG[kind];
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	beforeEach(() => {
		vi.mocked(toast.success).mockClear();
		vi.mocked(toast.error).mockClear();
	});

	it("renders kind-specific copy and common action labels", () => {
		const onClose = vi.fn();

		renderWithProviders(
			<DocumentDeleteDialog id={documentId} kind={kind} onClose={onClose} />,
		);

		expect(
			screen.getByText(t("delete.title", { ns: config.i18nNamespace })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("delete.description", { ns: config.i18nNamespace })),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: t("action.cancel", { ns: "common" }),
			}),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		).toBeInTheDocument();
	});

	it("calls delete and onClose on successful confirm", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		renderWithProviders(
			<DocumentDeleteDialog id={documentId} kind={kind} onClose={onClose} />,
		);

		const dialog = screen.getByRole("alertdialog");
		await user.click(
			within(dialog).getByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		);

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith(
				t(config.toast.deleted, { ns: "common" }),
			);
			expect(onClose).toHaveBeenCalled();
		});
	});

	it("closes without deleting on cancel", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		let deleteCallCount = 0;

		server.use(
			http.delete(`*/${apiSegment}/:id`, () => {
				deleteCallCount += 1;
				return HttpResponse.json({ data: { message: "deleted" } });
			}),
		);

		renderWithProviders(
			<DocumentDeleteDialog id={documentId} kind={kind} onClose={onClose} />,
		);

		await user.click(
			screen.getByRole("button", {
				name: t("action.cancel", { ns: "common" }),
			}),
		);

		expect(onClose).toHaveBeenCalled();
		expect(deleteCallCount).toBe(0);
		expect(toast.success).not.toHaveBeenCalled();
	});

	it("keeps dialog open and shows error toast when delete fails", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		server.use(
			http.delete(`*/${apiSegment}/:id`, () =>
				HttpResponse.json({ message: "Delete failed" }, { status: 500 }),
			),
		);

		renderWithProviders(
			<DocumentDeleteDialog id={documentId} kind={kind} onClose={onClose} />,
		);

		const dialog = screen.getByRole("alertdialog");
		await user.click(
			within(dialog).getByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				t(config.toast.deleteError, { ns: "common" }),
			);
		});

		expect(onClose).not.toHaveBeenCalled();
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
	});

	it("does not dismiss while delete is pending", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		server.use(
			http.delete(`*/${apiSegment}/:id`, async () => {
				await new Promise(() => undefined);
				return HttpResponse.json({ data: { message: "deleted" } });
			}),
		);

		renderWithProviders(
			<DocumentDeleteDialog id={documentId} kind={kind} onClose={onClose} />,
		);

		const dialog = screen.getByRole("alertdialog");
		await user.click(
			within(dialog).getByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		);

		await waitFor(() => {
			expect(document.querySelector(".animate-spin")).toBeInTheDocument();
		});

		await user.keyboard("{Escape}");

		expect(onClose).not.toHaveBeenCalled();
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
	});
});
