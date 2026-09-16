export type ApiResponse<T> = {
	data: T;
};

export type ApiPaginatedResponse<T> = ApiResponse<Array<T>> & {
	pagination: {
		next?: string;
	};
};
