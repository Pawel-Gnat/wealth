import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentType } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { RouteChunkLoadProvider } from "@/context/route-chunk-load";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { RouteChunkError } from "./route-chunk-error";

const LoadedPage = () => <div>page ready</div>;

const renderError = (load: () => Promise<ComponentType>) =>
	render(
		<RouteChunkLoadProvider>
			<RouteChunkError load={load} />
		</RouteChunkLoadProvider>,
	);

const deferred = () => {
	let resolve: (page: ComponentType) => void = () => {};
	const promise = new Promise<ComponentType>((res) => {
		resolve = res;
	});
	return { promise, resolve };
};

describe("RouteChunkError", () => {
	beforeAll(async () => {
		await init18nWeb({ lng: "en" });
	});

	it("shows the chunk error and try again button", () => {
		renderError(() => Promise.resolve(LoadedPage));

		expect(screen.getByText("Couldn't load this page.")).toBeInTheDocument();
		expect(
			screen.getByText("Check your connection and try again."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Try again" }),
		).toBeInTheDocument();
	});

	it("loads the page when try again succeeds", async () => {
		const user = userEvent.setup();
		const load = vi.fn(async () => LoadedPage);
		renderError(load);

		await user.click(screen.getByRole("button", { name: "Try again" }));

		expect(await screen.findByText("page ready")).toBeInTheDocument();
		expect(load).toHaveBeenCalledOnce();
	});

	it("keeps the error when the import fails", async () => {
		const user = userEvent.setup();
		renderError(() => Promise.reject(new Error("chunk failed")));

		await user.click(screen.getByRole("button", { name: "Try again" }));

		expect(
			await screen.findByRole("button", { name: "Try again" }),
		).toBeEnabled();
		expect(screen.getByText("Couldn't load this page.")).toBeInTheDocument();
		expect(screen.queryByText("page ready")).not.toBeInTheDocument();
	});

	it("ignores another click while the import is in flight", async () => {
		const user = userEvent.setup();
		const pending = deferred();
		const load = vi.fn(() => pending.promise);
		renderError(load);

		await user.click(screen.getByRole("button", { name: "Try again" }));
		expect(screen.getByRole("button")).toBeDisabled();

		await user.click(screen.getByRole("button"));
		expect(load).toHaveBeenCalledOnce();

		pending.resolve(LoadedPage);
		expect(await screen.findByText("page ready")).toBeInTheDocument();
	});

	it("shows the loaded page on the next visit without importing again", async () => {
		const user = userEvent.setup();
		const load = vi.fn(async () => LoadedPage);
		const first = renderError(load);

		await user.click(screen.getByRole("button", { name: "Try again" }));
		expect(await screen.findByText("page ready")).toBeInTheDocument();
		first.unmount();

		renderError(load);

		expect(screen.getByText("page ready")).toBeInTheDocument();
		expect(load).toHaveBeenCalledOnce();
	});
});
