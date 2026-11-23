export const offsetPagination = ({
	page,
	total,
	limit,
}: {
	page: number;
	total: number;
	limit: number;
}) => ({
	page,
	totalPages: Math.ceil(total / limit),
	hasNextPage: page * limit < total,
	hasPreviousPage: page > 1,
});
