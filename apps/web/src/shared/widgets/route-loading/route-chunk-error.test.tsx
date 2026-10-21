import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { RouteChunkError } from "./route-chunk-error";

describe("RouteChunkError", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("asks the user to refresh the browser", () => {
		render(<RouteChunkError />);

		expect(screen.getByText(t("route-chunk-error.title"))).toBeInTheDocument();
		expect(
			screen.getByText(t("route-chunk-error.description")),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: t("action.refresh") }),
		).toBeInTheDocument();
	});

	it("reloads the page when refresh is clicked", async () => {
		const user = userEvent.setup();
		const reload = vi.fn();

		vi.stubGlobal("location", { reload });
		render(<RouteChunkError />);

		await user.click(screen.getByRole("button", { name: t("action.refresh") }));

		expect(reload).toHaveBeenCalledOnce();
	});
});
