import type { ReactNode } from "react";
import { useAuth } from "@/context/auth";
import { PageLoader } from "@/shared/widgets/page-loader";
import { SessionResolveError } from "@/shared/widgets/session-resolve-error";

export const AuthSessionStatus = ({ children }: { children: ReactNode }) => {
	const {
		isAuthLoading,
		isResolvingSession,
		isBootstrapError,
		retryBootstrap,
	} = useAuth();

	if (isResolvingSession || isAuthLoading) {
		return <PageLoader />;
	}

	if (isBootstrapError) {
		return <SessionResolveError onRetry={retryBootstrap} />;
	}

	return children;
};
