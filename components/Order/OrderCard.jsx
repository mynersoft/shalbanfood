// components/orders/OrderCard.jsx
const OrderCard = ({ order }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Card content - can be simplified version of the main order display */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
          <p className="text-sm text-gray-600">
            {new Date(order.date).toLocaleDateString()} • {order.items} items
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
          'bg-red-100 text-red-800'
        }`}>
          {order.status}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View Details →
        </button>
      </div>
    </div>
  );
};

export default OrderCard;