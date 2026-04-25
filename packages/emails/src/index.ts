import { createElement } from "react";
import { render, toPlainText } from "react-email";

import WelcomeEmail, { type WelcomeEmailProps } from "./emails/welcome.js";

export async function renderWelcomeEmail(params: WelcomeEmailProps) {
	const html = await render(
		createElement(WelcomeEmail, {
			...params,
		}),
	);
	const text = toPlainText(html);
	const subject = `Welcome`;
	return { html, text, subject };
}
