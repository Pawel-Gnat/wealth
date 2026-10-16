import { type ComponentType, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouteChunkLoad } from "@/context/route-chunk-load";
import { Button, ErrorState } from "@/shared/components";

type RouteChunkErrorProps = {
	load: () => Promise<ComponentType>;
};

const loadedChunks = new Map<RouteChunkErrorProps["load"], ComponentType>();

export const RouteChunkError = ({ load }: RouteChunkErrorProps) => {
	const { t } = useTranslation();
	const { isRetrying, retryChunk } = useRouteChunkLoad();
	const [Page, setPage] = useState<ComponentType | null>(
		() => loadedChunks.get(load) ?? null,
	);

	const retry = () => {
		if (isRetrying || Page) {
			return;
		}

		void retryChunk(async () => {
			const loaded = await load();
			loadedChunks.set(load, loaded);
			setPage(() => loaded);
		}).catch(() => {});
	};

	if (Page) {
		return <Page />;
	}

	return (
		<div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
			<ErrorState
				title={t("route-chunk-error.title")}
				description={t("route-chunk-error.description")}
			/>
			<Button onClick={retry} isLoading={isRetrying} disabled={isRetrying}>
				{t("action.try-again")}
			</Button>
		</div>
	);
};
