import { describe, expect, it } from "vitest";
import { hasPermission, isAuthor, isMember, isOwner } from "./index";
import type { BudgetAccess, RecordAccess } from "./types";

const ownerId = "owner";

const MOCKS = {
	budgets: {
		shared: {
			ownerId,
		},
	},
	users: {
		owner: {
			id: ownerId,
			membership: null,
		},
		member: {
			id: "member",
			membership: "active",
		},
		invitee: {
			id: "invitee",
			membership: "pending",
		},
		stranger: {
			id: "stranger",
			membership: null,
		},
	},
} as const;

type MockUser = (typeof MOCKS.users)[keyof typeof MOCKS.users];

const budgetAccess = (user: MockUser): BudgetAccess => ({
	ownerId: MOCKS.budgets.shared.ownerId,
	membership: user.membership,
});

const budgetRecord = (authorId: string, user: MockUser): RecordAccess => ({
	authorId,
	budget: budgetAccess(user),
});

const personalRecord = (authorId: string): RecordAccess => ({
	authorId,
	budget: null,
});

describe("hasPermission", () => {
	it("lets the owner manage the budget but not leave it", () => {
		const user = MOCKS.users.owner;
		const budget = budgetAccess(user);

		expect(hasPermission(user.id, "budgets", "view", budget)).toBe(true);
		expect(hasPermission(user.id, "budgets", "edit", budget)).toBe(true);
		expect(hasPermission(user.id, "budgets", "delete", budget)).toBe(true);
		expect(hasPermission(user.id, "budgets", "invite", budget)).toBe(true);
		expect(hasPermission(user.id, "budgets", "cancelInvite", budget)).toBe(
			true,
		);
		expect(hasPermission(user.id, "budgets", "leave", budget)).toBe(false);
		expect(hasPermission(user.id, "budgets", "acceptInvite", budget)).toBe(
			false,
		);
		expect(hasPermission(user.id, "budgets", "rejectInvite", budget)).toBe(
			false,
		);
		expect(isOwner(user.id, budget)).toBe(true);
		expect(isMember(user.id, budget)).toBe(false);
	});

	it("lets a member leave, view, and create budget records without editing someone else's", () => {
		const user = MOCKS.users.member;
		const budget = budgetAccess(user);
		const ownRecord = budgetRecord(user.id, user);
		const otherRecord = budgetRecord("someone-else", user);

		expect(hasPermission(user.id, "budgets", "view", budget)).toBe(true);
		expect(hasPermission(user.id, "budgets", "leave", budget)).toBe(true);
		expect(hasPermission(user.id, "budgets", "edit", budget)).toBe(false);
		expect(hasPermission(user.id, "budgets", "invite", budget)).toBe(false);
		expect(hasPermission(user.id, "records", "create", ownRecord)).toBe(true);
		expect(hasPermission(user.id, "records", "view", otherRecord)).toBe(true);
		expect(hasPermission(user.id, "records", "edit", otherRecord)).toBe(false);
		expect(hasPermission(user.id, "records", "delete", otherRecord)).toBe(
			false,
		);
	});

	it("lets the author view, edit, and delete their budget record", () => {
		const user = MOCKS.users.member;
		const record = budgetRecord(user.id, user);

		expect(isAuthor(user.id, record)).toBe(true);
		expect(hasPermission(user.id, "records", "view", record)).toBe(true);
		expect(hasPermission(user.id, "records", "edit", record)).toBe(true);
		expect(hasPermission(user.id, "records", "delete", record)).toBe(true);
	});

	it("lets the author view, edit, and delete a personal record", () => {
		const user = MOCKS.users.member;
		const record = personalRecord(user.id);

		expect(isAuthor(user.id, record)).toBe(true);
		expect(hasPermission(user.id, "records", "view", record)).toBe(true);
		expect(hasPermission(user.id, "records", "edit", record)).toBe(true);
		expect(hasPermission(user.id, "records", "delete", record)).toBe(true);
	});

	it("denies a budget record after the author loses access", () => {
		const user = MOCKS.users.member;
		const record: RecordAccess = {
			authorId: user.id,
			budget: {
				ownerId: MOCKS.budgets.shared.ownerId,
				membership: null,
			},
		};

		expect(isAuthor(user.id, record)).toBe(false);
		expect(hasPermission(user.id, "records", "view", record)).toBe(false);
		expect(hasPermission(user.id, "records", "edit", record)).toBe(false);
		expect(hasPermission(user.id, "records", "delete", record)).toBe(false);
	});

	it("lets an invitee accept or reject the invite without opening the budget", () => {
		const user = MOCKS.users.invitee;
		const budget = budgetAccess(user);
		const record = budgetRecord(user.id, user);

		expect(hasPermission(user.id, "budgets", "acceptInvite", budget)).toBe(
			true,
		);
		expect(hasPermission(user.id, "budgets", "rejectInvite", budget)).toBe(
			true,
		);
		expect(hasPermission(user.id, "budgets", "view", budget)).toBe(false);
		expect(hasPermission(user.id, "budgets", "leave", budget)).toBe(false);
		expect(hasPermission(user.id, "records", "create", record)).toBe(false);
	});

	it("denies access to a stranger, a signed-out user, and someone else's personal record", () => {
		const stranger = MOCKS.users.stranger;
		const budget = budgetAccess(stranger);

		expect(hasPermission(stranger.id, "budgets", "view", budget)).toBe(false);
		expect(
			hasPermission(null, "budgets", "view", budgetAccess(MOCKS.users.owner)),
		).toBe(false);
		expect(
			hasPermission(
				MOCKS.users.member.id,
				"records",
				"view",
				personalRecord("someone-else"),
			),
		).toBe(false);
	});
});
