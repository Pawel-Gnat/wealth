import { recordListParamsSchema } from "@repo/api/schemas";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter, useSearchParams } from "react-router";
import { describe, expect, it } from "vitest";
import { useUrlPagination } from "./use-url-pagination";

const schemas = {
	kind: recordListParamsSchema.shape.kind,
	budgetId: recordListParamsSchema.shape.budgetId,
	limit: recordListParamsSchema.shape.limit,
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
			<span data-testid="kind">{filters.kind ?? ""}</span>
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
			<button type="button" onClick={() => setFilter("limit", 0)}>
				invalid-limit
			</button>
			<button type="button" onClick={() => clearFilter("kind")}>
				clear-kind
			</button>
			<button type="button" onClick={() => setParams({ page: 2, limit: 20 })}>
				set-params
			</button>
		</>
	);
};

describe("useUrlPagination", () => {
	it("reads the page and record list filters from the url", () => {
		render(<PaginationProbe />, {
			wrapper: createRouter("/records?page=2&kind=income&limit=20"),
		});

		expect(screen.getByTestId("page")).toHaveTextContent("2");
		expect(screen.getByTestId("kind")).toHaveTextContent("income");
		expect(screen.getByTestId("limit")).toHaveTextContent("20");
	});

	it("drops invalid record list filters from the url", async () => {
		render(<PaginationProbe />, {
			wrapper: createRouter("/records?page=abc&kind=unknown&limit=nope"),
		});

		expect(await screen.findByTestId("search")).toHaveTextContent(/^$/);
		expect(screen.getByTestId("page")).toHaveTextContent("1");
		expect(screen.getByTestId("kind")).toHaveTextContent("");
		expect(screen.getByTestId("limit")).toHaveTextContent("");
	});

	it("writes a page and removes the first page from the url", async () => {
		const user = userEvent.setup();

		render(<PaginationProbe />, {
			wrapper: createRouter("/records?kind=expense"),
		});

		await user.click(screen.getByRole("button", { name: "set-page" }));

		expect(await screen.findByTestId("search")).toHaveTextContent(
			"kind=expense&page=3",
		);

		await user.click(screen.getByRole("button", { name: "reset-page" }));

		expect(await screen.findByTestId("search")).toHaveTextContent(
			"kind=expense",
		);
	});

	it("writes a valid limit and ignores an invalid one", async () => {
		const user = userEvent.setup();

		render(<PaginationProbe />, {
			wrapper: createRouter("/records?page=2"),
		});

		await user.click(screen.getByRole("button", { name: "invalid-limit" }));

		expect(screen.getByTestId("search")).toHaveTextContent("page=2");

		await user.click(screen.getByRole("button", { name: "set-limit" }));

		expect(await screen.findByTestId("search")).toHaveTextContent(
			"page=2&limit=30",
		);
		expect(screen.getByTestId("limit")).toHaveTextContent("30");
	});

	it("clears one filter and can update the page with a filter together", async () => {
		const user = userEvent.setup();

		render(<PaginationProbe />, {
			wrapper: createRouter("/records?page=4&kind=expense&limit=40"),
		});

		await user.click(screen.getByRole("button", { name: "clear-kind" }));

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
});
