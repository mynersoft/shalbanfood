'use client';

export default function Invoice({ order }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Invoice</h2>

      <div className="space-y-2">
        <p>
          <strong>Order ID:</strong> {order?._id || order?.id || 'N/A'}
        </p>

        <p>
          <strong>Customer:</strong> {order?.name || 'N/A'}
        </p>

        <p>
          <strong>Phone:</strong> {order?.phone || 'N/A'}
        </p>

        <p>
          <strong>Total:</strong> ৳{order?.totalAmount || order?.total || 0}
        </p>
      </div>
    </div>
  );
}