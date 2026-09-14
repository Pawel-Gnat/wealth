import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/shared/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/lib/ui/tabs";
import { SigninForm } from "./ui/signin-form";
import { SignupForm } from "./ui/signup-form";

const TABS = {
	signin: "signin",
	signup: "signup",
} as const;

export const AuthPage = () => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<string>(TABS.signin);

	return (
		<Card
			className="min-w-xs sm:min-w-sm"
			title={
				activeTab === TABS.signin
					? t("signin.title", { ns: "auth" })
					: t("signup.title", { ns: "auth" })
			}
			subtitle={
				activeTab === TABS.signin
					? t("signin.description", { ns: "auth" })
					: t("signup.description", { ns: "auth" })
			}
		>
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full max-w-sm"
			>
				<TabsList className="w-full">
					<TabsTrigger value={TABS.signin}>
						{t("action.signin", { ns: "common" })}
					</TabsTrigger>
					<TabsTrigger value={TABS.signup}>
						{t("action.signup", { ns: "common" })}
					</TabsTrigger>
				</TabsList>
				<TabsContent value={TABS.signin}>
					<SigninForm />
				</TabsContent>
				<TabsContent value={TABS.signup}>
					<SignupForm onSignedUp={() => setActiveTab(TABS.signin)} />
				</TabsContent>
			</Tabs>
		</Card>
	);
};
