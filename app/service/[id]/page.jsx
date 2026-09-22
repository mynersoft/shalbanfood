"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";

export default function ServiceView() {
	const dispatch = useDispatch();
	const { id } = useParams();
	const { current, loading } = useSelector((s) => ({
		current: s.service.current,
		loading: s.service.loading,
	}));

	useEffect(() => {
		if (id) dispatch(fetchService(id));
	}, [id, dispatch]);

	if (loading || !current) return <div className="p-4">Loading...</div>;

	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-3">Service Record</h2>
			<p>
				<strong>Customer:</strong> {current.customerName}
			</p>
			<p>
				<strong>Phone:</strong> {current.phone}
			</p>
			<p>
				<strong>Device:</strong> {current.servicingeDevice}
			</p>
			<p>
				<strong>Bill:</strong> {current.billAmount} Tk
			</p>
			<p>
				<strong>Warranty:</strong>{" "}
				{current.warranty?.hasWarranty
					? `${current.warranty.warrantyMonths} months`
					: "No"}
			</p>
			<p className="mt-3">
				<strong>Notes:</strong> {current.notes}
			</p>
		</div>
	);
}
