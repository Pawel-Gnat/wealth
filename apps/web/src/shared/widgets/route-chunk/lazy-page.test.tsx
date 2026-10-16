import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { RouteChunkLoadProvider } from "@/context/route-chunk-load";
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
		const resolved = await route.lazy();

		expect(resolved.Component).toBe(Page);
	});

	it("returns the chunk error and retries the same import", async () => {
		const user = userEvent.setup();
		let shouldFail = true;
		const load = vi.fn(async () => {
			if (shouldFail) {
				throw new Error("chunk failed");
			}
			return Page;
		});
		const route = lazyPage(load);
		const resolved = await route.lazy();
		const Fallback = resolved.Component;

		render(
			<RouteChunkLoadProvider>
				<Fallback />
			</RouteChunkLoadProvider>,
		);

		expect(
			screen.getByRole("button", { name: t("action.try-again") }),
		).toBeInTheDocument();

		shouldFail = false;

		await user.click(
			screen.getByRole("button", { name: t("action.try-again") }),
		);

		expect(await screen.findByText("page ready")).toBeInTheDocument();
		expect(load).toHaveBeenCalledTimes(2);
	});
});
