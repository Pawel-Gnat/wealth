import { i18n } from "@repo/common/i18n";
import { toast } from "sonner";

export const notifyTooManyRequests = (response: Response) => {
	const seconds = Number(response.headers.get("retry-after"));

	if (!Number.isInteger(seconds) || seconds < 1) {
		return;
	}

	toast.error(i18n.t("toast.error.too-many-requests", { count: seconds }));
};
