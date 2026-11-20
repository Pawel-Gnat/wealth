import { pageSchema } from "@repo/api/schemas";
import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";

export const useUrlPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const rawPage = searchParams.get("page");
	const parsedPage = pageSchema.safeParse(rawPage);

	const page = rawPage !== null && parsedPage.success ? parsedPage.data : 1;

	const setPage = useCallback(
		(value: number) => {
			const result = pageSchema.safeParse(value);

			if (!result.success) return;

			setSearchParams(
				(prev) => {
					const params = new URLSearchParams(prev);

					if (result.data === 1) {
						params.delete("page");
					} else {
						params.set("page", String(result.data));
					}

					return params;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	useEffect(() => {
		if (rawPage !== null && (page === 1 || !parsedPage.success)) {
			setPage(1);
		}
	}, [rawPage, page, parsedPage.success, setPage]);

	return { page, setPage };
};
