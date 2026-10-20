import { render, screen } from "@testing-library/react";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { lazyPage } from "./lazy-page";

const Page = () => <div>page ready</div>;

describe("lazyPage", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("returns the page component when the import succeeds", async () => {
		const route = lazyPage(async () => Page);
		const resolved = await route();

		expect(resolved.Component).toBe(Page);
	});

	it("returns the chunk error when the import fails", async () => {
		const load = vi.fn(async () => {
			throw new Error("chunk failed");
		});
		const route = lazyPage(load);
		const resolved = await route();
		const Fallback = resolved.Component;

		render(<Fallback />);

		expect(screen.getByText(t("route-chunk-error.title"))).toBeInTheDocument();
		expect(
			screen.getByText(t("route-chunk-error.description")),
		).toBeInTheDocument();
		expect(load).toHaveBeenCalledOnce();
	});
});
