import { Head, Html, Preview, Tailwind } from "react-email";
import { Body, Button, Heading, Hr, Section, Text } from "../components/index";
import tailwindConfig from "../tailwind.config";

export type WelcomeEmailProps = {
	firstName: string;
	lastName: string;
	passwordSetupLink: string;
};

export default function WelcomeEmail({
	firstName,
	lastName,
	passwordSetupLink,
}: WelcomeEmailProps) {
	return (
		<Html>
			<Head />
			<Tailwind config={tailwindConfig}>
				<Preview>Welcome</Preview>
				<Body>
					<Section>
						<Heading className="m-0 mb-4">Welcome!</Heading>

						<Text className="m-0 mb-2">
							Welcome{" "}
							<strong>
								{firstName} {lastName}
							</strong>
							,
						</Text>
						<Button href={passwordSetupLink}>Setup your password</Button>
						<Text className="m-0 mb-2">
							This link will expire in 7 days for security reasons.
						</Text>
						<Text className="m-0 mb-2">
							After setting your password, you will be able to login and manage
							your profile.
						</Text>
						<Hr />
						<Text size="sm" className="m-0 mb-1">
							See you soon!
						</Text>
					</Section>
				</Body>
			</Tailwind>
		</Html>
	);
}

WelcomeEmail.PreviewProps = {
	firstName: "Test",
	lastName: "User",
	passwordSetupLink: "https://example.com/password-setup",
} satisfies WelcomeEmailProps;
