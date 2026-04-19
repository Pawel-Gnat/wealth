import { useTranslation } from "react-i18next";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/lib/ui/tabs";

import { SigninForm } from "./signin-form";
import { SignupForm } from "./signup-form";

export function AuthTabs() {
	const { t } = useTranslation();

	return (
		<Tabs defaultValue="signin" className="w-full max-w-sm">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="signin">
					{t("action.signin", { ns: "common" })}
				</TabsTrigger>
				<TabsTrigger value="signup">
					{t("action.signup", { ns: "common" })}
				</TabsTrigger>
			</TabsList>
			<TabsContent value="signin">
				<SigninForm />
			</TabsContent>
			<TabsContent value="signup">
				<SignupForm />
			</TabsContent>
		</Tabs>
	);
}
