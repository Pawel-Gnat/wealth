import { render, screen } from "@testing-library/react";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { lazyPage } from "./lazy-page";

const captureException = vi.hoisted(() => vi.fn());

vi.mock("@repo/observability/browser", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@repo/observability/browser")>();

	return {
		...actual,
		captureException,
	};
});

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
		const error = new Error("chunk failed");
		const load = vi.fn(async () => {
			throw error;
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
		expect(captureException).toHaveBeenCalledWith(error);
	});
});
