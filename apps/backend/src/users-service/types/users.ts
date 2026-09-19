export type CreateUserInput = {
	email: string;
	passwordHash: string;
	firstName?: string | undefined;
	lastName?: string | undefined;
};

export type UpdateUserDetailsInput = {
	firstName: string;
	lastName: string;
};
