import { and, eq } from "drizzle-orm";
import { budgetMemberTable } from "../../database-service/tables/index";
import type { DatabaseTransaction } from "../../database-service/types/types";

export const listActiveParticipantIds = async (
	tx: DatabaseTransaction,
	budgetId: string,
	ownerId: string,
) => {
	const members = await tx
		.select({ userId: budgetMemberTable.userId })
		.from(budgetMemberTable)
		.where(
			and(
				eq(budgetMemberTable.budgetId, budgetId),
				eq(budgetMemberTable.status, "active"),
			),
		);

	return [...new Set([ownerId, ...members.map((member) => member.userId)])];
};

export const otherParticipantIds = (
	participantIds: string[],
	actorId: string,
) => {
	if (participantIds.length < 2) {
		return [];
	}

	return participantIds.filter((participantId) => participantId !== actorId);
};
