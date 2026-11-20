export type ApiResponse<T> = {
	data: T;
};

export type ApiCursorPaginatedResponse<T> = ApiResponse<Array<T>> & {
	pagination: {
		next?: string;
	};
};

export type ApiOffsetPaginatedResponse<T> = ApiResponse<Array<T>> & {
	pagination: {
		page: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
};
