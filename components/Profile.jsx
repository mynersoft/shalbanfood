'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { updateUser } from '@/store/slices/authSlice';
import { toast, Toaster } from 'react-hot-toast';
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Image,
  Store,
  Building,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function Profile() {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  console.log(session);

	const { user } = useSelector((state) => state.user);
	console.log(user);
	
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    address: {
      area: '',
      thana: '',
      city: '',
    },
    shopName: '',
    shopAddress: '',
    bankName: '',
    bankBranch: '',
    bankAccount: '',
  });

  const [avatarPreview, setAvatarPreview] = useState('');

  // Initialize form data when user data is available
  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      avatar: user.avatar ?? '',
      address: {
        area: user.address?.area ?? '',
        thana: user.address?.thana ?? '',
        city: user.address.city ?? '',
      },
      shopName: user.shopName ?? '',
      shopAddress: user.shopAddress ?? '',
      bankName: user.bankName ?? '',
      bankBranch: user.bankBranch ?? '',
      bankAccount: user.bankAccount ?? '',
    });

    setAvatarPreview(user.avatar || '');
  }, [user]);

  // Handle avatar URL changes
  useEffect(() => {
    if (formData.avatar) setAvatarPreview(formData.avatar);
  }, [formData.avatar]);

  /* ---------------- UPDATE MUTATION ---------------- */
  const updateProfile = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Update failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      dispatch(updateUser(data.user));
      toast.success('Profile updated successfully!', {
        duration: 3000,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update profile', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (field, value) => {
    setFormData({
      ...formData,
      address: { ...formData.address, [field]: value },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          success: {
            iconTheme: { primary: '#10B981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl md:text-4xl font-bold text-gray-900">
            Profile
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Avatar & Status */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={() => setAvatarPreview('')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => setAvatarPreview('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="w-full space-y-3">
                <div className="relative">
                  <Image className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="Paste image URL"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Enter a valid image URL for your profile picture
                </p>
              </div>

              {updateProfile.isPending && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-blue-700 font-medium">
                      Updating profile...
                    </span>
                  </div>
                </div>
              )}

              {updateProfile.isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">
                      Profile updated successfully!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <User className="w-4 h-4 mr-2" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Mail className="w-4 h-4 mr-2" /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Phone className="w-4 h-4 mr-2" /> Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  {/* Single Address Fields */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <MapPin className="w-4 h-4 mr-2" /> Address Area
                    </label>
                    <input
                      type="text"
                      value={formData.address.area}
                      onChange={(e) =>
                        handleAddressChange('area', e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      Thana
                    </label>
                    <input
                      type="text"
                      value={formData.address.thana}
                      onChange={(e) =>
                        handleAddressChange('thana', e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        handleAddressChange('city', e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              {user?.role === 'seller' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center mb-6 pb-3 border-b border-gray-200">
                    <Store className="w-6 h-6 mr-3 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Business Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Shop Name
                      </label>
                      <input
                        type="text"
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Your shop name"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Shop Address
                      </label>
                      <input
                        type="text"
                        name="shopAddress"
                        value={formData.shopAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Complete shop address"
                      />
                    </div>

                    {/* Bank Info */}
                    <div className="md:col-span-2 mt-2 mb-4">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 mr-2 text-green-600" />
                        <h4 className="text-lg font-medium text-gray-800">
                          Bank Details
                        </h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        For payment processing
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="e.g., Chase Bank"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Bank Branch
                      </label>
                      <input
                        type="text"
                        name="bankBranch"
                        value={formData.bankBranch}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Branch location"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center text-sm font-medium text-gray-700">
                        <CreditCard className="w-4 h-4 mr-2" /> Account Number
                      </label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter your account number"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="px-8 py-3.5 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}