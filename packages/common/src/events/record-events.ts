const recordMutationEvents = (kind: "expense" | "income") =>
	({
		created: `${kind}.created`,
		updated: `${kind}.updated`,
		deleted: `${kind}.deleted`,
	}) as const;

export const RECORD_EVENTS = {
	expense: recordMutationEvents("expense"),
	income: recordMutationEvents("income"),
} as const;
