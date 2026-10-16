import { act, render, screen } from "@testing-library/react";
import type { TFunction } from "i18next";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { LOADER_DELAY, LOADER_MIN_DURATION } from "@/shared/hooks/use-loader";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { RouteLoadingBar } from "./route-loading-bar";

describe("RouteLoadingBar", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("stays hidden until the loader delay elapses", async () => {
		vi.useFakeTimers();
		const view = render(<RouteLoadingBar isLoading={false} />);
		view.rerender(<RouteLoadingBar isLoading />);

		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();

		await act(() => vi.advanceTimersByTimeAsync(LOADER_DELAY - 1));
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();

		await act(() => vi.advanceTimersByTimeAsync(1));
		expect(
			screen.getByRole("progressbar", { name: t("common.loading") }),
		).toBeInTheDocument();
	});

	it("keeps the bar for the minimum duration after loading ends", async () => {
		vi.useFakeTimers();
		const view = render(<RouteLoadingBar isLoading={false} />);
		view.rerender(<RouteLoadingBar isLoading />);

		await act(() => vi.advanceTimersByTimeAsync(LOADER_DELAY));
		view.rerender(<RouteLoadingBar isLoading={false} />);

		await act(() => vi.advanceTimersByTimeAsync(LOADER_MIN_DURATION - 1));
		expect(screen.getByRole("progressbar")).toBeInTheDocument();

		await act(() => vi.advanceTimersByTimeAsync(1));
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
	});

	it("does not show the bar when loading ends before the delay", async () => {
		vi.useFakeTimers();
		const view = render(<RouteLoadingBar isLoading={false} />);
		view.rerender(<RouteLoadingBar isLoading />);

		await act(() => vi.advanceTimersByTimeAsync(LOADER_DELAY - 1));
		view.rerender(<RouteLoadingBar isLoading={false} />);
		await act(() =>
			vi.advanceTimersByTimeAsync(LOADER_DELAY + LOADER_MIN_DURATION),
		);

		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
	});

	it("announces loading politely and keeps a static full-width bar when motion is reduced", async () => {
		vi.useFakeTimers();
		const view = render(<RouteLoadingBar isLoading={false} />);
		view.rerender(<RouteLoadingBar isLoading />);

		await act(() => vi.advanceTimersByTimeAsync(LOADER_DELAY));

		const bar = screen.getByRole("progressbar", { name: t("common.loading") });
		expect(bar).toHaveAttribute("aria-live", "polite");

		const segment = bar.firstElementChild;
		expect(segment).toHaveClass("motion-safe:animate-route-loading");
		expect(segment).toHaveClass("motion-reduce:w-full");
	});
});
