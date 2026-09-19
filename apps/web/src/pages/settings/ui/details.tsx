import type { User } from "@repo/api/types";
import { useTranslation } from "react-i18next";
import { Card, Form, FormInput } from "@/shared/components";
import { useUserDetailsForm } from "../hooks/use-user-details-form";

type DetailsProps = {
	user: User;
};

export const Details = ({ user }: DetailsProps) => {
	const { t } = useTranslation();
	const { control, isPending, updateDetails } = useUserDetailsForm(user);

	return (
		<Card title={t("personal-details.title", { ns: "settings" })}>
			<Form
				onSubmit={updateDetails}
				submitText={t("action.update", { ns: "common" })}
				isPending={isPending}
			>
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
			</Form>
		</Card>
	);
};
