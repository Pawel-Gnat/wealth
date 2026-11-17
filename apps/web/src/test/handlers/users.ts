import { HttpResponse, http } from "msw";

const ROUTE = "*/users";

const getUsersSearchHandler = () => {
	return HttpResponse.json({
		data: [
			{
				id: "01JTZKQX2GT6PHGQER0M8FS6K9",
				email: "anna@example.com",
				firstName: "Anna",
				lastName: "Kowalska",
				image: null,
			},
		],
		hasMore: false,
	});
};

export const userHandlers = [
	http.get(`${ROUTE}/search`, getUsersSearchHandler),
];
