import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { ButtonPrimary, Card, FormInput } from "@/shared/components";
import { useUserDetailsForm } from "../hooks/use-user-details-form";

type DetailsProps = {
	user: User;
};

export const Details = ({ user }: DetailsProps) => {
	const { t } = useTranslation();
	const { control, isLoading, updateDetails } = useUserDetailsForm(user);

	return (
		<Card
			title={t("personal-details.title", { ns: "settings" })}
			contentClassName="flex flex-col gap-4"
		>
			<form onSubmit={updateDetails} className="flex flex-col gap-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<FormInput
						name="firstName"
						label={t("first-name.label", { ns: "form" })}
						placeholder={t("first-name.placeholder", { ns: "form" })}
						control={control}
						icon="user"
					/>
					<FormInput
						name="lastName"
						label={t("last-name.label", { ns: "form" })}
						placeholder={t("last-name.placeholder", { ns: "form" })}
						control={control}
						icon="user"
					/>
				</div>
				<ButtonPrimary
					className="w-fit ml-auto"
					isLoading={isLoading}
					disabled={isLoading}
				>
					{t("action.update", { ns: "common" })}
				</ButtonPrimary>
			</form>
		</Card>
	);
};
