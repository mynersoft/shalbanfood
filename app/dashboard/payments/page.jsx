import CommissionReport from "../components/CommissionReport";
import VendorPayout from "../components/VendorPayout";
import Settings from "../components/Settings";

export default function PaymentsPage() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Admin Payments Dashboard</h1>

      {/* Commission Report */}
      <div className="mb-8">
        <CommissionReport />
      </div>

      {/* Vendor Payout */}
      <div className="mb-8">
        <VendorPayout />
      </div>

      {/* Settings */}
      <div className="mb-8">
        <Settings />
      </div>
    </div>
  );
}