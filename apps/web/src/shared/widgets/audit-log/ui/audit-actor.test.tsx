import type { User } from "@repo/api/types";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";
import { init18nWeb } from "@/shared/lib/i18n/i18n";
import { renderWithProviders } from "@/test/render-with-providers";
import { AuditActor } from "./audit-actor";

const actor: User = {
	id: "user-1",
	email: "john@example.com",
	firstName: "John",
	lastName: "Doe",
};

describe("AuditActor", () => {
	beforeAll(async () => {
		await init18nWeb({ lng: "en" });
	});

	it("shows the avatar and the full name in the tooltip", async () => {
		const user = userEvent.setup();

		renderWithProviders(<AuditActor actorId={actor.id} users={[actor]} />);

		expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
		expect(screen.getByText("JD")).toBeInTheDocument();

		await user.hover(screen.getByText("JD"));

		expect(await screen.findAllByText("John Doe")).not.toHaveLength(0);
	});

	it("uses the email when the person has no name", async () => {
		const user = userEvent.setup();

		const nameless: User = {
			id: "user-2",
			email: "ada@example.com",
			firstName: null,
			lastName: null,
		};

		renderWithProviders(
			<AuditActor actorId={nameless.id} users={[nameless]} />,
		);

		await user.hover(screen.getByText("AD"));

		expect(await screen.findAllByText("ada@example.com")).not.toHaveLength(0);
	});

	it("shows an unknown user when the actor is missing", () => {
		renderWithProviders(<AuditActor actorId={null} users={[actor]} />);

		expect(screen.getByText("Unknown user")).toBeInTheDocument();
		expect(screen.queryByText("JD")).not.toBeInTheDocument();
	});

	it("shows an unknown user when the actor is not in the list", () => {
		renderWithProviders(<AuditActor actorId="someone-else" users={[actor]} />);

		expect(screen.getByText("Unknown user")).toBeInTheDocument();
	});
});
