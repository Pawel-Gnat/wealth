import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

	it("reveals a password and hides it again", async () => {
		const user = userEvent.setup();

		renderWithProviders(
			<FormFieldStory<{ password: string }> defaultValues={{ password: "" }}>
				{(control) => (
					<FormInput
						name="password"
						label={t("password.label", { ns: "form" })}
						type="password"
						control={control}
					/>
				)}
			</FormFieldStory>,
		);

		const input = screen.getByLabelText(t("password.label", { ns: "form" }));
		await user.type(input, "Secret1!");
		expect(input).toHaveAttribute("type", "password");

		await user.click(
			screen.getByRole("button", {
				name: t("password.show", { ns: "form" }),
			}),
		);

		expect(input).toHaveAttribute("type", "text");
		expect(input).toHaveValue("Secret1!");

		await user.click(
			screen.getByRole("button", {
				name: t("password.hide", { ns: "form" }),
			}),
		);

		expect(input).toHaveAttribute("type", "password");
	});
});
