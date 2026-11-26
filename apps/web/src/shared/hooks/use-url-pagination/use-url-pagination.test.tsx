import { recordListParamsSchema } from "@repo/api/schemas";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode, useEffect, useRef } from "react";
import { MemoryRouter, useNavigate, useSearchParams } from "react-router";
import { describe, expect, it } from "vitest";
import { useUrlPagination } from "./use-url-pagination";
import { textFilter } from "./utils/url-pagination";

const schemas = {
	type: textFilter(recordListParamsSchema.shape.type),
	budgetId: textFilter(recordListParamsSchema.shape.budgetId),
	limit: textFilter(recordListParamsSchema.shape.limit),
};

const createRouter = (initialEntry: string) => {
	return ({ children }: { children: ReactNode }) => (
		<MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
	);
};

const PaginationProbe = () => {
	const { page, filters, setPage, setFilter, clearFilter, setParams } =
		useUrlPagination(schemas);
	const [params] = useSearchParams();

	return (
		<>
			<span data-testid="page">{page}</span>
			<span data-testid="type">{filters.type ?? ""}</span>
			<span data-testid="limit">{filters.limit ?? ""}</span>
			<span data-testid="search">{params.toString()}</span>
			<button type="button" onClick={() => setPage(3)}>
				set-page
			</button>
			<button type="button" onClick={() => setPage(1)}>
				reset-page
			</button>
			<button type="button" onClick={() => setFilter("limit", 30)}>
				set-limit
			</button>
			<button type="button" onClick={() => clearFilter("type")}>
				clear-type
			</button>
			<button type="button" onClick={() => setParams({ page: 2, limit: 20 })}>
				set-params
			</button>
			<button type="button" onClick={() => setParams({ page: 1, type: null })}>
				clear-type-and-page
			</button>
		</>
	);
};

describe("useUrlPagination", () => {
	it("reads the page and record list filters from the url", () => {
		render(<PaginationProbe />, {
			wrapper: createRouter("/records?page=2&type=income&limit=20"),
		});

		expect(screen.getByTestId("page")).toHaveTextContent("2");
		expect(screen.getByTestId("type")).toHaveTextContent("income");
		expect(screen.getByTestId("limit")).toHaveTextContent("20");
	});

	it("drops invalid record list filters from the url", async () => {
		render(<PaginationProbe />, {
			wrapper: createRouter("/records?page=abc&type=unknown&limit=nope"),
		});

		expect(await screen.findByTestId("search")).toHaveTextContent(/^$/);
		expect(screen.getByTestId("page")).toHaveTextContent("1");
		expect(screen.getByTestId("type")).toHaveTextContent("");
		expect(screen.getByTestId("limit")).toHaveTextContent("");
	});

	it("writes a page and removes the first page from the url", async () => {
		const user = userEvent.setup();

		render(<PaginationProbe />, {
			wrapper: createRouter("/records?type=expense"),
		});

		await user.click(screen.getByRole("button", { name: "set-page" }));

		expect(await screen.findByTestId("search")).toHaveTextContent(
			"type=expense&page=3",
		);

		await user.click(screen.getByRole("button", { name: "reset-page" }));

		expect(await screen.findByTestId("search")).toHaveTextContent(
			"type=expense",
		);
	});

	it("drops a limit outside the page sizes and writes a valid one", async () => {
		const user = userEvent.setup();

		render(<PaginationProbe />, {
			wrapper: createRouter("/records?page=2&limit=15"),
		});

		expect(await screen.findByTestId("search")).toHaveTextContent("page=2");
		expect(screen.getByTestId("limit")).toHaveTextContent("");

		await user.click(screen.getByRole("button", { name: "set-limit" }));

		expect(await screen.findByTestId("search")).toHaveTextContent(
			"page=2&limit=30",
		);
		expect(screen.getByTestId("limit")).toHaveTextContent("30");
	});

	it("clears one filter and can update the page with a filter together", async () => {
		const user = userEvent.setup();

		render(<PaginationProbe />, {
			wrapper: createRouter("/records?page=4&type=expense&limit=40"),
		});

		await user.click(screen.getByRole("button", { name: "clear-type" }));

		expect(await screen.findByTestId("search")).toHaveTextContent(
			"page=4&limit=40",
		);

		await user.click(screen.getByRole("button", { name: "set-params" }));

		expect(await screen.findByTestId("search")).toHaveTextContent(
			"page=2&limit=20",
		);
		expect(screen.getByTestId("page")).toHaveTextContent("2");
		expect(screen.getByTestId("limit")).toHaveTextContent("20");
	});

	it("clears a filter and the page in one update", async () => {
		const user = userEvent.setup();

		render(<PaginationProbe />, {
			wrapper: createRouter("/records?page=4&type=expense&limit=40"),
		});

		await user.click(
			screen.getByRole("button", { name: "clear-type-and-page" }),
		);

		expect(await screen.findByTestId("search")).toHaveTextContent("limit=40");
		expect(screen.getByTestId("page")).toHaveTextContent("1");
		expect(screen.getByTestId("type")).toHaveTextContent("");
	});

	it("keeps a filter written while an invalid url is normalized", async () => {
		const NormalizeProbe = () => {
			const { filters, setParams } = useUrlPagination(schemas);
			const [params] = useSearchParams();
			const started = useRef(false);

			useEffect(() => {
				if (started.current) return;

				started.current = true;
				setParams({ limit: 30 });
			}, [setParams]);

			return (
				<>
					<span data-testid="limit">{filters.limit ?? ""}</span>
					<span data-testid="search">{params.toString()}</span>
				</>
			);
		};

		render(<NormalizeProbe />, {
			wrapper: createRouter("/records?type=unknown"),
		});

		expect(await screen.findByTestId("search")).toHaveTextContent("limit=30");
		expect(screen.getByTestId("limit")).toHaveTextContent("30");
	});

	it("restores filters when navigation goes back", async () => {
		const user = userEvent.setup();
		const HistoryProbe = () => {
			const { filters, setFilter } = useUrlPagination(schemas);
			const navigate = useNavigate();

			return (
				<>
					<span data-testid="type">{filters.type ?? ""}</span>
					<button type="button" onClick={() => setFilter("type", "income")}>
						set-income
					</button>
					<button type="button" onClick={() => navigate(-1)}>
						back
					</button>
				</>
			);
		};

		render(<HistoryProbe />, {
			wrapper: createRouter("/records?type=expense"),
		});

		expect(screen.getByTestId("type")).toHaveTextContent("expense");

		await user.click(screen.getByRole("button", { name: "set-income" }));

		expect(await screen.findByTestId("type")).toHaveTextContent("income");

		await user.click(screen.getByRole("button", { name: "back" }));

		expect(await screen.findByTestId("type")).toHaveTextContent("expense");
	});
});
