import type { I18N_RESOURCES } from "@repo/common/i18n";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { AlertModal } from "./alert-modal";

type EnResources = (typeof I18N_RESOURCES)["en"];

describe("AlertModal", () => {
	let t: TFunction;
	let defaultProps: {
		open: boolean;
		title: EnResources["expenses"]["delete"]["title"];
		description: EnResources["expenses"]["delete"]["description"];
		cancelText: EnResources["common"]["action"]["cancel"];
		confirmText: EnResources["common"]["action"]["delete"];
		onConfirm: ReturnType<typeof vi.fn>;
		onOpenChange: ReturnType<typeof vi.fn>;
	};

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
		defaultProps = {
			open: true,
			title: t("delete.title", { ns: "expenses" }),
			description: t("delete.description", { ns: "expenses" }),
			cancelText: t("action.cancel", { ns: "common" }),
			confirmText: t("action.delete", { ns: "common" }),
			onConfirm: vi.fn(),
			onOpenChange: vi.fn(),
		};
	});

	it("shows confirm text when not confirming", () => {
		render(<AlertModal {...defaultProps} isConfirming={false} />);

		expect(
			screen.getByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		).toBeInTheDocument();
		expect(document.querySelector(".animate-spin")).not.toBeInTheDocument();
	});

	it("shows a loader instead of confirm text while confirming", () => {
		render(<AlertModal {...defaultProps} isConfirming />);

		expect(
			screen.queryByRole("button", {
				name: t("action.delete", { ns: "common" }),
			}),
		).not.toBeInTheDocument();
		expect(document.querySelector(".animate-spin")).toBeInTheDocument();
	});

	it("does not propagate onOpenChange(false) while confirming", async () => {
		const user = userEvent.setup();
		const onOpenChange = vi.fn();

		render(
			<AlertModal {...defaultProps} isConfirming onOpenChange={onOpenChange} />,
		);

		await user.keyboard("{Escape}");

		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it("propagates onOpenChange(false) when not confirming", async () => {
		const user = userEvent.setup();
		const onOpenChange = vi.fn();

		render(
			<AlertModal
				{...defaultProps}
				isConfirming={false}
				onOpenChange={onOpenChange}
			/>,
		);

		await user.keyboard("{Escape}");

		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
