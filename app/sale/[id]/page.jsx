"use client";
import { useEffect } from "react";
import { fetchSingleSale } from "@/redux/saleSlice";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";

export default function SaleInvoice() {
    const dispatch = useDispatch();
    const { id } = useParams();
    const { singleSale, loading } = useSelector((state) => state.sales);

    useEffect(() => {
        dispatch(fetchSingleSale(id));
    }, [id]);

    if (loading || !singleSale)
        return <div className="p-5 text-center">Loading...</div>;

    return (
        <>
           <style jsx global>{`
  @media print {
    /* Hide buttons, navigation, headers, and any UI not part of invoice */
    .hide-on-print {
      display: none !important;
    }

    body {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
      background: #fff;
      color: #000;
    }

    .print-invoice {
      background: #fff !important;
      color: #000 !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 auto !important;
      max-width: 100% !important;
    }

    table, th, td {
      border: 1px solid #000 !important;
      border-collapse: collapse !important;
    }

    th, td {
      color: #000 !important;
      padding: 6px !important;
      font-size: 12pt !important;
    }

    h1, h2, h3, p, span {
      color: #000 !important;
    }
  }
`}</style>

            <div className="print-invoice max-w-4xl mx-auto bg-gray-950 text-gray-500 p-10 rounded-lg mt-10 shadow-lg">
                {/* Header Section */}
                <div className="flex justify-between items-start border-b border-gray-700 pb-4 mb-6">
                    <div>
                        <h1 className="text-lg font-semibold text-white">
                            Bismillah Telecom & Servicing
                        </h1>
                        <p className="text-sm text-gray-300">
                            Address: Aushnara, Madhupur, Tangail
                        </p>
                        <p className="text-sm text-gray-300">Mobile: 01868944080</p>
                        <p className="text-sm text-gray-300">
                            Date: {new Date(singleSale.date).toLocaleDateString("en-US")}
                        </p>
                    </div>

                    <div className="text-right text-sm mt-10">
                        <p>
                            <span className="text-gray-400">Customer:</span>{" "}
                            <span className="font-semibold">{singleSale.customer?.name || "N/A"}</span>
                        </p>
                        <p>
                            <span className="text-gray-400">Phone:</span>{" "}
                            {singleSale.customer?.phone || "N/A"}
                        </p>
                        <p>
                            <span className="text-gray-400">Invoice:</span>{" "}
                            <span className="font-mono text-gray-100">{singleSale.invoice}</span>
                        </p>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full border border-gray-700 border-collapse mb-6 text-sm">
                    <thead className="bg-gray-800 text-gray-200">
                        <tr>
                            <th className="border border-gray-700 p-2">Item</th>
                            <th className="border border-gray-700 p-2">Qty</th>
                            <th className="border border-gray-700 p-2">Price</th>
                            <th className="border border-gray-700 p-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {singleSale.items?.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-900 transition-colors">
                                <td className="border border-gray-800 p-2">{item.name}</td>
                                <td className="border border-gray-800 p-2 text-center">{item.qty}</td>
                                <td className="border border-gray-800 p-2 text-right">{item.price}</td>
                                <td className="border border-gray-800 p-2 text-right">{item.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="text-right text-sm space-y-1">
                    <p>Subtotal: {singleSale.subtotal} Tk</p>
                    <p>Discount: {singleSale.discount} Tk</p>
                    <p className="text-lg font-semibold text-white">Total: {singleSale.total} Tk</p>
                </div>

                {/* Print Button */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => window.print()}
                        className="hide-on-print bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                    >
                        🖨️ Print PDF
                    </button>
                </div>
            </div>
        </>
    );
}