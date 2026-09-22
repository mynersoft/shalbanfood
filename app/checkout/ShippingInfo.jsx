import { Building, MapPin, Phone } from 'lucide-react';
import React, { useState } from 'react';

const ShippingInfo = ({ orderData, handleChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MapPin className="text-blue-600" size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          Shipping Information
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Building size={16} />
              Area
            </div>
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your full address"
            name="address.area"
            value={orderData.address.area}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              Thana
            </div>
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your city"
            name="address.thana"
            value={orderData.address.thana}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              City
            </div>
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your city"
            name="address.city"
            value={orderData.address.city}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Phone size={16} />
              Phone Number
            </div>
          </label>
          <input
            type="tel"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="01XXXXXXXXX"
            name="phone"
            value={orderData.phone}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
