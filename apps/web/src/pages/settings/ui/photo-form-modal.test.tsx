import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { HttpResponse, http } from "msw";
import { toast } from "sonner";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { MOCK_JPEG_FILE } from "@/test/mocks/jpeg-file";
import { MOCK_USER } from "@/test/mocks/user";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/servers";
import { PhotoFormModal } from "./photo-form-modal";

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe("PhotoFormModal", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
		vi.stubGlobal(
			"URL",
			Object.assign(URL, {
				createObjectURL: vi.fn(() => "blob:mock-photo"),
				revokeObjectURL: vi.fn(),
			}),
		);
	});

	beforeEach(() => {
		vi.mocked(toast.success).mockClear();
		vi.mocked(toast.error).mockClear();
	});

	const openModal = async () => {
		const userActions = userEvent.setup();
		renderWithProviders(<PhotoFormModal user={MOCK_USER} />);

		await userActions.click(
			screen.getByRole("button", {
				name: t("action.change-photo", { ns: "common" }),
			}),
		);

		const dialog = await screen.findByRole("dialog");
		const fileInput = within(dialog).getByLabelText(
			t("file.label", { ns: "form" }),
		);
		await userActions.upload(fileInput, MOCK_JPEG_FILE);

		return { userActions, dialog };
	};

	it("closes the modal and shows a success toast after a successful upload", async () => {
		const { userActions, dialog } = await openModal();

		await userActions.click(
			within(dialog).getByRole("button", {
				name: t("action.save", { ns: "common" }),
			}),
		);

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith(
				t("toast.success.photo-updated", { ns: "common" }),
			);
		});
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});

	it("keeps the modal open and shows an error toast when upload fails", async () => {
		server.use(
			http.put("*/settings/photo", () =>
				HttpResponse.json({ message: "Upload failed" }, { status: 500 }),
			),
		);

		const { userActions, dialog } = await openModal();

		await userActions.click(
			within(dialog).getByRole("button", {
				name: t("action.save", { ns: "common" }),
			}),
		);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				t("toast.error.photo-updated", { ns: "common" }),
			);
		});
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("does not close the modal while upload is pending", async () => {
		server.use(
			http.put("*/settings/photo", async () => {
				await new Promise(() => undefined);
				return HttpResponse.json({ data: { message: "user_photo_updated" } });
			}),
		);

		const { userActions, dialog } = await openModal();

		await userActions.click(
			within(dialog).getByRole("button", {
				name: t("action.save", { ns: "common" }),
			}),
		);

		await waitFor(() => {
			expect(
				within(dialog).getByRole("button", {
					name: t("action.save", { ns: "common" }),
				}),
			).toBeDisabled();
		});

		await userActions.keyboard("{Escape}");

		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});
});
