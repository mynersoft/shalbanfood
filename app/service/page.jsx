"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchServices,
    deleteService,
} from "@/redux/serviceSlice";
import { useRouter } from "next/navigation";
import ServiceFormModal from "@/components/modal/ServiceFormModal";
import toast from "react-hot-toast";

export default function ServiceListPage() {
    const [mode, setMode] = useState("add"); 
    const [currentRecord, setCurrentRecord] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const { list, totalServices, totalBill, lastMonth } = useSelector(
        (s) => s.service
    );

    const [range, setRange] = useState("daily"); 

    useEffect(() => {
        dispatch(fetchServices({ type: range }));
    }, [dispatch, range]);

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this service?")) {
            toast.promise(dispatch(deleteService(id)).unwrap(), {
                loading: "Deleting...",
                success: "Service deleted!",
                error: "Delete failed",
            });
        }
    };

    const printRecord = (record) => {
        const html = `
      <html>
      <head>
        <style>
          body{font-family: Poppins; padding:20px;}
          table{width:100%; border-collapse: collapse;}
          th, td{border:1px solid #ccc; padding:8px; text-align:left;}
        </style>
      </head>
      <body>
        <h2>Service Record</h2>
        <p><strong>ID:</strong> ${record._id}</p>
        <p><strong>Customer:</strong> ${record.customerName || "N/A"}</p>
        <p><strong>Phone:</strong> ${record.phone || "N/A"}</p>
        <p><strong>Device:</strong> ${record.servicingeDevice}</p>
        <p><strong>Bill:</strong> ${record.billAmount} Tk</p>
        <p><strong>Warranty:</strong> ${
            record.warranty?.hasWarranty
                ? record.warranty.warrantyMonths + " months"
                : "No"
        }</p>
        <p><strong>Notes:</strong> ${record.notes || ""}</p>
        <hr/>
        <p>Printed: ${new Date().toLocaleString()}</p>
      </body>
      </html>
    `;
        const w = window.open("", "", "width=800,height=900");
        w.document.write(html);
        w.document.close();
        w.print();
    };

    const handleEdit = (rec) => {
        setCurrentRecord(rec);
        setMode("edit");
        setModalOpen(true);
    };

    return (
        <>
            <ServiceFormModal
                open={modalOpen}
                mode={mode}
                currentRecord={currentRecord}
                onClose={() => setModalOpen(false)}
            />

            <div className="p-6 text-gray-200 bg-gray-900 min-h-screen">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-md focus:outline-none">
                        <option value="daily">Today</option>
                        <option value="weekly">This Week</option>
                        <option value="monthly">This Month</option>
                    </select>

                    <div className="flex gap-4">
                        <div className="bg-gray-800 p-4 rounded shadow min-w-[120px]">
                            <div className="text-sm text-gray-400">Total services</div>
                            <div className="text-2xl font-bold">
                                <span className="text-red-500">
                                    {lastMonth?.totalServices || 0}
                                </span>{" "}
                                / {totalServices || 0}
                            </div>
                        </div>

                        <div className="bg-gray-800 p-4 rounded shadow min-w-[120px]">
                            <div className="text-sm text-gray-400">Total bill</div>
                            <div className="text-2xl font-bold">
                                <span className="text-red-500">
                                    {lastMonth?.totalBill || 0}
                                </span>{" "}
                                / {totalBill || 0} Tk
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setMode("add");
                            setCurrentRecord(null);
                            setModalOpen(true);
                        }}
                        className="bg-green-600 px-4 py-2 rounded">
                        Add Service
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-gray-800 p-4 rounded shadow">
                    <table className="w-full text-sm">
                        <thead className="text-left text-gray-300">
                            <tr>
                                <th className="p-2">Customer</th>
                                <th className="p-2">Phone</th>
                                <th className="p-2">Device</th>
                                <th className="p-2 text-right">Bill</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {list?.map((rec) => (
                                <tr
                                    key={rec._id}
                                    className="border-t border-gray-700 hover:bg-gray-700/40">
                                    <td className="p-2">{rec.customerName}</td>
                                    <td className="p-2">{rec.phone}</td>
                                    <td className="p-2">{rec.servicingeDevice}</td>
                                    <td className="p-2 text-right">
                                        {rec.billAmount} Tk
                                    </td>

                                    <td className="p-2 flex gap-2">
                                        <button
                                            className="bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-700"
                                            onClick={() => printRecord(rec)}>
                                            Print
                                        </button>

                                        <button
                                            onClick={() => handleEdit(rec)}
                                            className="bg-yellow-600 px-2 py-1 rounded hover:bg-yellow-700">
                                            Edit
                                        </button>

                                        <button
                                            className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                                            onClick={() => handleDelete(rec._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {list.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="p-4 text-center text-gray-400">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}