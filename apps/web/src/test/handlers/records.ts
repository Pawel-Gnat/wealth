import {
	RECORD_CREATED_MESSAGE,
	RECORD_DELETED_MESSAGE,
	RECORD_UPDATED_MESSAGE,
} from "@repo/api/schemas";
import { HttpResponse, http } from "msw";

const ROUTE = "*/records";

const getRecordsListHandler = () => {
	return HttpResponse.json({
		data: [
			{
				id: "01JTZKQX2GT6PHGQER0M8FS6K8",
				date: "2024-03-01T12:00:00.000Z",
				kind: "expense",
				totalAmount: 123.45,
			},
		],
		pagination: {},
	});
};

const postRecordCreateHandler = () => {
	return HttpResponse.json({
		data: { message: RECORD_CREATED_MESSAGE },
	});
};

const getRecordByIdHandler = () => {
	return HttpResponse.json({
		data: {
			id: "01JTZKQX2GT6PHGQER0M8FS6K8",
			date: "2024-03-01T12:00:00.000Z",
			kind: "expense",
			totalAmount: 123.45,
			lineItems: [
				{
					id: "01JTZKQX2GT6PHGQER0M8FS6K9",
					title: "Taxi",
					quantity: 1,
					singleAmount: 123.45,
				},
			],
		},
	});
};

const putRecordUpdateHandler = () => {
	return HttpResponse.json({
		data: { message: RECORD_UPDATED_MESSAGE },
	});
};

const deleteRecordHandler = () => {
	return HttpResponse.json({
		data: { message: RECORD_DELETED_MESSAGE },
	});
};

export const recordHandlers = [
	http.get(`${ROUTE}/:id`, getRecordByIdHandler),
	http.get(ROUTE, getRecordsListHandler),
	http.post(ROUTE, postRecordCreateHandler),
	http.put(`${ROUTE}/:id`, putRecordUpdateHandler),
	http.delete(`${ROUTE}/:id`, deleteRecordHandler),
];
