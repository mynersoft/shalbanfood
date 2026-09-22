export const formatCurrency = (amount, currency = 'BDT') => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatNumber = (number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    pending: 'yellow',
    processing: 'blue',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red',
    returned: 'orange',
    inactive: 'gray',
    out_of_stock: 'red',
    in_stock: 'green',
    low_stock: 'yellow',
  };
  return colors[status] || 'gray';
};