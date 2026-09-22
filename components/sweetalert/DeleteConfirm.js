"use client";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const showDeleteConfirm = (itemName = "item", onConfirm) => {
	return MySwal.fire({
		title: `Are you sure you want to delete this ${itemName}?`,
		text: "This action cannot be undone!",
		icon: "warning",
		showCancelButton: true,
		confirmButtonText: "Yes, delete it",
		cancelButtonText: "Cancel",
		confirmButtonColor: "#d33",
		cancelButtonColor: "#3085d6",
	}).then((result) => {
		if (result.isConfirmed) {
			onConfirm();
			MySwal.fire(
				"Deleted!",
				`The ${itemName} has been deleted.`,
				"success"
			);
		} else {
			MySwal.fire("Cancelled", `The ${itemName} is safe.`, "info");
		}
	});
};
