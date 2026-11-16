import {
	BUDGET_DELETED_MESSAGE,
	BUDGET_LEFT_MESSAGE,
	BUDGET_MEMBERS_INVITED_MESSAGE,
	BUDGET_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import { HttpResponse, http } from "msw";
import { MOCK_USER } from "../mocks/user";

const ROUTE = "*/budgets";

export const MOCK_BUDGET_ID = "01JTZKQX2GT6PHGQER0M8FS6KA";
export const MOCK_MEMBER_BUDGET_ID = "01JTZKQX2GT6PHGQER0M8FS6KB";

const getBudgetInvitesHandler = () => {
	return HttpResponse.json({ data: [] });
};

const getBudgetsHandler = () => {
	return HttpResponse.json({
		data: [
			{
				id: MOCK_BUDGET_ID,
				title: "Household",
				owner: {
					id: MOCK_USER.id,
					email: MOCK_USER.email,
					firstName: MOCK_USER.firstName ?? null,
					lastName: MOCK_USER.lastName ?? null,
					image: null,
				},
				members: [],
			},
			{
				id: MOCK_MEMBER_BUDGET_ID,
				title: "Shared",
				owner: {
					id: "01JTZKQX2GT6PHGQER0M8FS6KC",
					email: "owner@example.com",
					firstName: "Ola",
					lastName: "Nowak",
					image: null,
				},
				members: [
					{
						id: MOCK_USER.id,
						email: MOCK_USER.email,
						firstName: MOCK_USER.firstName ?? null,
						lastName: MOCK_USER.lastName ?? null,
						image: null,
						status: "active",
					},
				],
			},
		],
	});
};

const putBudgetHandler = () => {
	return HttpResponse.json({
		data: { message: BUDGET_UPDATED_MESSAGE },
	});
};

const postBudgetMembersHandler = () => {
	return HttpResponse.json({
		data: { message: BUDGET_MEMBERS_INVITED_MESSAGE },
	});
};

const deleteBudgetHandler = () => {
	return HttpResponse.json({
		data: { message: BUDGET_DELETED_MESSAGE },
	});
};

const deleteBudgetMembershipHandler = () => {
	return HttpResponse.json({
		data: { message: BUDGET_LEFT_MESSAGE },
	});
};

export const budgetHandlers = [
	http.get(`${ROUTE}/invites`, getBudgetInvitesHandler),
	http.get(ROUTE, getBudgetsHandler),
	http.put(`${ROUTE}/:id`, putBudgetHandler),
	http.post(`${ROUTE}/:id/members`, postBudgetMembersHandler),
	http.delete(`${ROUTE}/:id/membership`, deleteBudgetMembershipHandler),
	http.delete(`${ROUTE}/:id`, deleteBudgetHandler),
];
