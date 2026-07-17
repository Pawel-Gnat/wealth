let refreshPromise: Promise<string | null> | null = null;

export const resetRefreshMutex = (): void => {
	refreshPromise = null;
};

export const withRefreshMutex = async (
	refresh: () => Promise<string | null>,
): Promise<string | null> => {
	if (!refreshPromise) {
		refreshPromise = refresh().finally(() => {
			refreshPromise = null;
		});
	}

	return refreshPromise;
};
