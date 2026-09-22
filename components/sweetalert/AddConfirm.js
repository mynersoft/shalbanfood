"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/**
 * showAddConfirm
 * @param {string} itemName - Name of the item to show in modal
 * @param {function} onConfirm - Function to call when user confirms
 */
export const showAddConfirm = (itemName = "item", onConfirm) => {
	return MySwal.fire({
		title: `Do you want to add this ${itemName}?`,
		text: "Make sure all information is correct!",
		icon: "question",
		showCancelButton: true,
		confirmButtonText: "Yes, add it",
		cancelButtonText: "Cancel",
		confirmButtonColor: "#28a745",
		cancelButtonColor: "#6c757d",
	}).then((result) => {
		if (result.isConfirmed) {
			onConfirm();
			MySwal.fire("Added!", `The ${itemName} has been added.`, "success");
		} else {
			MySwal.fire("Cancelled", `The ${itemName} was not added.`, "info");
		}
	});
};
