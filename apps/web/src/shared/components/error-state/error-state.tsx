import { TextError } from "../typography";

type ErrorStateProps = {
	text: string;
};

export const ErrorState = ({ text }: ErrorStateProps) => {
	return (
		<TextError
			size="sm"
			className="text-center border border-destructive rounded-md p-4"
		>
			{text}
		</TextError>
	);
};
