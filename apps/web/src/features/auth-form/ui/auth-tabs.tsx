import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/lib/ui/tabs";

import { SigninForm } from "./signin-form";
import { SignupForm } from "./signup-form";

const TABS = {
	signin: "signin",
	signup: "signup",
} as const;

export function AuthTabs() {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<string>(TABS.signin);

	return (
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
	);
}
