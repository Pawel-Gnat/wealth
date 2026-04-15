import { useParams } from "react-router";

export function ExpenseEditPage() {
	const { id } = useParams<{ id: string }>();
	return (
		<div>
			<h1 className="text-2xl font-semibold">Edit expense {id}</h1>
		</div>
	);
}
