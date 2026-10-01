import { ChevronDown, ChevronLeft, ChevronRight, Eye, Search, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

const FilterSearch = ({}) => {
  

 const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');









    // Filter and sort orders
    useEffect(() => {
      if (!orders.length) return;
  
      let result = [...orders];
  
      // Filter by search term
      if (searchTerm) {
        result = result.filter(
          (order) =>
            (order._id &&
              order._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.orderId &&
              order.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.customer?.name &&
              order.customer.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            order.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customer?.email &&
              order.customer.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (order.customer?.phone && order.customer.phone.includes) ||
            searchTerm
        );
      }
  
      // Filter by status
      if (selectedStatus !== 'all') {
        result = result.filter((order) => order.status === selectedStatus);
      }
  
      // Sort orders
      result.sort((a, b) => {
        let aValue, bValue;
  
        switch (sortBy) {
          case 'date':
            aValue = new Date(a.createdAt || a.date || 0);
            bValue = new Date(b.createdAt || b.date || 0);
            break;
          case 'total':
            aValue = a.total || a.totalAmount || 0;
            bValue = b.total || b.totalAmount || 0;
            break;
          case 'customer':
            aValue = a.customer?.name?.toLowerCase() || '';
            bValue = b.customer?.name?.toLowerCase() || '';
            break;
          default:
            aValue = a.orderId || a._id;
            bValue = b.orderId || b._id;
        }
  
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
  
      setFilteredOrders(result);
      setCurrentPage(1);
    }, [searchTerm, selectedStatus, sortBy, sortOrder, orders]);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="total">Sort by Total</option>
            <option value="customer">Sort by Customer</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSearch;