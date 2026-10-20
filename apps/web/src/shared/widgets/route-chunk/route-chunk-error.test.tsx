import { render, screen } from "@testing-library/react";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { RouteChunkError } from "./route-chunk-error";

describe("RouteChunkError", () => {
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("asks the user to refresh the browser", () => {
		render(<RouteChunkError />);

		expect(screen.getByText(t("route-chunk-error.title"))).toBeInTheDocument();
		expect(
			screen.getByText(t("route-chunk-error.description")),
		).toBeInTheDocument();
	});
});
