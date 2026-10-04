export default function Settings() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>

      {/* Commission Rate */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Commission Rate (%)</label>
        <input
          type="number"
          defaultValue={10}
          className="border p-2 rounded w-1/3"
        />
      </div>

      {/* Website Settings */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Website Name</label>
        <input
          type="text"
          defaultValue="MahirProStore"
          className="border p-2 rounded w-1/3"
        />
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Save Settings
      </button>
    </div>
  );
}