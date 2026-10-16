import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
	RouteChunkLoadProvider,
	useRouteChunkLoad,
} from "./route-chunk-load-context";

const deferred = () => {
	let resolve: (value: string) => void = () => {};
	let reject: (reason?: unknown) => void = () => {};
	const promise = new Promise<string>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};

const Probe = ({ task }: { task: () => Promise<string> }) => {
	const { isRetrying, retryChunk } = useRouteChunkLoad();

	return (
		<div>
			<div data-testid="retrying">{isRetrying ? "yes" : "no"}</div>
			<button
				type="button"
				onClick={() => {
					void retryChunk(task).catch(() => {});
				}}
			>
				retry
			</button>
		</div>
	);
};

describe("route chunk load context", () => {
	it("throws when used outside the provider", () => {
		expect(() => render(<Probe task={() => Promise.resolve("ok")} />)).toThrow(
			"useRouteChunkLoad must be used within RouteChunkLoadProvider",
		);
	});

	it("is idle until a retry starts", () => {
		render(
			<RouteChunkLoadProvider>
				<Probe task={() => Promise.resolve("ok")} />
			</RouteChunkLoadProvider>,
		);

		expect(screen.getByTestId("retrying")).toHaveTextContent("no");
	});

	it("stays retrying until the import settles", async () => {
		const user = userEvent.setup();
		const pending = deferred();

		render(
			<RouteChunkLoadProvider>
				<Probe task={() => pending.promise} />
			</RouteChunkLoadProvider>,
		);

		await user.click(screen.getByRole("button", { name: "retry" }));
		expect(screen.getByTestId("retrying")).toHaveTextContent("yes");

		pending.resolve("ok");
		expect(await screen.findByText("no")).toBeInTheDocument();
	});

	it("clears the flag when the import fails", async () => {
		const user = userEvent.setup();
		const pending = deferred();

		render(
			<RouteChunkLoadProvider>
				<Probe task={() => pending.promise} />
			</RouteChunkLoadProvider>,
		);

		await user.click(screen.getByRole("button", { name: "retry" }));
		pending.reject(new Error("chunk failed"));

		expect(await screen.findByText("no")).toBeInTheDocument();
	});
});
