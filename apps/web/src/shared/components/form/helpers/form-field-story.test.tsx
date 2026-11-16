import { screen } from "@testing-library/react";
import type { TFunction } from "i18next";
import { beforeAll, describe, expect, it } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { FormInput } from "../form-input";
import { FormFieldStory } from "./form-field-story";

type EmailValues = {
	email: string;
};

let t: TFunction;

describe("FormFieldStory", () => {
	beforeAll(async () => {
		t = (await init18nWeb({ lng: "en" })) as TFunction;
	});

	it("renders an empty field", () => {
		renderWithProviders(
			<FormFieldStory<EmailValues> defaultValues={{ email: "" }}>
				{(control) => (
					<FormInput
						name="email"
						label={t("email.label", { ns: "form" })}
						control={control}
					/>
				)}
			</FormFieldStory>,
		);

		expect(screen.getByRole("textbox")).toHaveValue("");
		expect(screen.getByRole("textbox")).toBeEnabled();
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("shows the translated field error", async () => {
		renderWithProviders(
			<FormFieldStory<EmailValues>
				defaultValues={{ email: "" }}
				error={{ name: "email", message: "form:email.invalid" }}
			>
				{(control) => (
					<FormInput
						name="email"
						label={t("email.label", { ns: "form" })}
						control={control}
					/>
				)}
			</FormFieldStory>,
		);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			t("email.invalid", { ns: "form" }),
		);
	});

	it("disables the field through the form", () => {
		renderWithProviders(
			<FormFieldStory<EmailValues> defaultValues={{ email: "" }} disabled>
				{(control) => (
					<FormInput
						name="email"
						label={t("email.label", { ns: "form" })}
						control={control}
					/>
				)}
			</FormFieldStory>,
		);

		expect(screen.getByRole("textbox")).toBeDisabled();
	});
});
