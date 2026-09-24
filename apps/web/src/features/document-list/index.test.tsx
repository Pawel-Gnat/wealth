import { screen, waitFor } from "@testing-library/react";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import { DOCUMENT_CONFIG } from "@/features/config/document-config";
import type { RecordKind } from "@/features/model/record-kind";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { DocumentList } from "./index";

const listKinds = [
	"expense",
	"income",
] as const satisfies readonly RecordKind[];

describe.each(listKinds)("$kind DocumentList", (kind) => {
	const config = DOCUMENT_CONFIG[kind];
	let t: TFunction;

	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("renders page copy and an add link to the create route", async () => {
		renderWithProviders(<DocumentList kind={kind} />);

		expect(
			screen.getByText(t("list.title", { ns: config.i18nNamespace })),
		).toBeInTheDocument();
		expect(
			screen.getByText(t("list.subtitle", { ns: config.i18nNamespace })),
		).toBeInTheDocument();

		const addLink = screen.getByRole("link", {
			name: t("action.add", { ns: "common" }),
		});

		expect(addLink).toHaveAttribute("href", config.addRoute);

		await waitFor(() => {
			expect(
				screen.getByRole("link", {
					name: t("action.preview", { ns: "common" }),
				}),
			).toBeInTheDocument();
		});
	});
});
