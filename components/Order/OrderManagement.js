'use client';

import React, { useState, useEffect } from 'react';
import { Download, ShoppingCart, AlertCircle, Clock } from 'lucide-react';
import { useOrders } from '@/hooks/useOrder';
import toast from 'react-hot-toast';
import StatsCard from '@/components/Order/StatsCard';
import OrderFilters from '@/components/Order/OrderFilters';
import OrderTable from '@/components/Order/OrderTable';
import OrderPagination from '@/components/Order/OrderPagination';
import OrderDetailsModal from '@/components/Order/OrderDetailsModal';

const OrderManagement = () => {
  const { data: ordersData = [], isLoading, isError, refetch } = useOrders();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Initialize orders when data loads
  useEffect(() => {
    if (ordersData && ordersData.length > 0) {
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    }
  }, [ordersData]);

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
          (order.invoice &&
            order.invoice.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.customer?.email &&
            order.customer.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (order.customer?.phone && order.customer.phone.includes(searchTerm))
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

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success(`Order status updated to ${newStatus}`, {
          icon: '✅',
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update order status', {
        icon: '❌',
      });
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return (
      colors[status?.toLowerCase()] ||
      'bg-gray-100 text-gray-800 border-gray-200'
    );
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleExport = () => {
    toast.success('Exporting orders data...', {
      icon: '📊',
    });
    // Export logic here
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="relative">
            <ShoppingCart className="h-16 w-16 text-gray-400 animate-pulse" />
            <Clock className="h-8 w-8 text-primary-600 animate-spin absolute -top-2 -right-2" />
          </div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
          <p className="text-sm text-gray-500">Fetching order data</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-8">
          <AlertCircle className="h-16 w-16 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Failed to load orders
            </h3>
            <p className="text-gray-600 mt-1">
              Unable to fetch order data from the server
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Clock className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Order Management
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2">
              Manage and track customer orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm sm:text-base">
              <PlusIcon className="w-4 h-4" />
              New Order
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCard orders={orders} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        {/* Filters */}
        <OrderFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Orders Table */}
        <OrderTable
          orders={paginatedOrders}
          onViewOrder={handleViewOrder}
          onStatusUpdate={handleStatusUpdate}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <OrderPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredOrders.length}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

// Custom Plus Icon component
const PlusIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

// Import missing icons
const Package = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const Truck = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
    />
  </svg>
);

const CheckCircle = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const XCircle = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default OrderManagement;