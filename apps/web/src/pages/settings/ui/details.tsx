import type { User } from "@repo/api/types";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ButtonPrimary, Card, FormInput } from "@/shared/components";

type DetailsValues = {
	firstName: string;
	lastName: string;
};

type DetailsProps = {
	user: User;
};

export const Details = ({ user }: DetailsProps) => {
	const { t } = useTranslation();
	const form = useForm<DetailsValues>({
		defaultValues: {
			firstName: user.firstName ?? "",
			lastName: user.lastName ?? "",
		},
	});

	return (
		<Card
			title={t("personal-details.title", { ns: "settings" })}
			contentClassName="flex flex-col gap-4"
		>
			<div className="grid gap-4 sm:grid-cols-2">
				<FormInput
					name="firstName"
					label={t("first-name.label", { ns: "form" })}
					placeholder={t("first-name.placeholder", { ns: "form" })}
					control={form.control}
					icon="user"
				/>
				<FormInput
					name="lastName"
					label={t("last-name.label", { ns: "form" })}
					placeholder={t("last-name.placeholder", { ns: "form" })}
					control={form.control}
					icon="user"
				/>
			</div>
			<ButtonPrimary type="button" className="w-fit ml-auto">
				{t("action.update", { ns: "common" })}
			</ButtonPrimary>
		</Card>
	);
};
