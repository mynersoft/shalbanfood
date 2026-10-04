const dummyData = [
  { vendor: "Vendor A", totalSales: 50000, commission: 5000 },
  { vendor: "Vendor B", totalSales: 30000, commission: 3000 },
  { vendor: "Vendor C", totalSales: 100000, commission: 10000 },
];

export default function CommissionReport() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Commission Report</h2>
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 text-left">Vendor</th>
            <th className="px-4 py-2 text-left">Total Sales (BDT)</th>
            <th className="px-4 py-2 text-left">Commission (BDT)</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2">{item.vendor}</td>
              <td className="px-4 py-2">{item.totalSales}</td>
              <td className="px-4 py-2">{item.commission}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}