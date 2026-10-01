'use client';

import { Eye, ChevronDown, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useSelector } from 'react-redux';

const OrderTable = ({
  orders,
  onViewOrder,
  onStatusUpdate,
  getStatusColor,
  getStatusIcon,
}) => {
  	const user = useSelector((state) => state.user.user);

  if (!orders || orders.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" className="px-4 py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">No orders found</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">
                  {order.invoice || order._id?.slice(-8)}
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-gray-900">
                    {order.customer?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.customer?.phone ||
                      order.customer?.email ||
                      'No contact'}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDate(order.updatedAt)}
              </td>
              <td className="px-4 py-3 font-semibold text-gray-900">
                {formatCurrency(order.total || order.totalAmount)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status?.charAt(0).toUpperCase() +
                      order.status?.slice(1) || 'Unknown'}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewOrder(order)}
                    className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        onStatusUpdate(order._id, e.target.value)
                      }
                      className={`appearance-none cursor-pointer px-3 py-1.5 rounded-lg border text-sm font-medium capitalize transition-colors w-32 ${
                        order.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                          : order.status === 'processing'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : order.status === 'shipped'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                              : order.status === 'delivered'
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : order.status === 'cancelled'
                                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <option
                        value="pending"
                        className="bg-white text-gray-900"
                      >
                        Pending
                      </option>
                      <option
                        value="processing"
                        className="bg-white text-gray-900"
                      >
                        Processing
                      </option>
                      <option
                        value="shipped"
                        className="bg-white text-gray-900"
                      >
                        Shipped
                      </option>
                      <option
                        value="delivered"
                        className="bg-white text-gray-900"
                      >
                        Delivered
                      </option>
                      <option
                        value="cancelled"
                        className="bg-white text-gray-900"
                      >
                        Cancelled
                      </option>
                      <option
                        value="refunded"
                        className="bg-white text-gray-900"
                      >
                        Refunded
                      </option>
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-current opacity-50" />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;