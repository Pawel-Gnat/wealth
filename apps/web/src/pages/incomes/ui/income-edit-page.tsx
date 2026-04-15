import { useParams } from "react-router";

export function IncomeEditPage() {
	const { id } = useParams<{ id: string }>();
	return (
		<div>
			<h1 className="text-2xl font-semibold">Edit income {id}</h1>
		</div>
	);
}
