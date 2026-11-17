import { HttpResponse, http } from "msw";

const ROUTE = "*/dashboard";

const getDashboardSummaryHandler = () => {
	return HttpResponse.json({
		data: {
			expenses: { amount: 100, percentChange: 12.5 },
			incomes: { amount: 250, percentChange: null },
			netBalance: { amount: 150, percentChange: -3.2 },
		},
	});
};

const getDashboardCumulativeChartHandler = () => {
	return HttpResponse.json({
		data: {
			points: [
				{
					date: "2024-07-01T00:00:00.000Z",
					expenses: 100,
					incomes: 50,
				},
			],
		},
	});
};

const getDashboardDailyChartHandler = () => {
	return HttpResponse.json({
		data: {
			points: [
				{
					date: "2024-07-01T00:00:00.000Z",
					expenses: 40,
					incomes: 25,
				},
			],
		},
	});
};

export const dashboardHandlers = [
	http.get(`${ROUTE}/summary`, getDashboardSummaryHandler),
	http.get(`${ROUTE}/cumulative-chart`, getDashboardCumulativeChartHandler),
	http.get(`${ROUTE}/daily-chart`, getDashboardDailyChartHandler),
];
