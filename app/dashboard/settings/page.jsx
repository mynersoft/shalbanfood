'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Bell,
  Shield,
  User,
  Lock,
  Mail,
  Globe,
  Database,
  Palette,
  Clock,
  DollarSign,
  FileText,
  Users,
  CreditCard,
  Smartphone,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Upload,
  Trash2,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from 'next-themes';

const AdminSettings = () => {
  const router = useRouter();
  const { theme, setTheme, themes } = useTheme();
  
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Shalban Food Admin',
    siteUrl: 'https://shalbanfood.vercel.app',
    adminEmail: 'admin@shalbanfood.vercel.app',
    timezone: 'Asia/Dhaka',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    currency: 'BDT',
    language: 'en',
    maintenanceMode: false,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAttempts: 5,
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
    },
    ipWhitelist: [],
    activityLogs: true,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      newOrders: true,
      newUsers: true,
      systemAlerts: true,
      marketing: false,
    },
    pushNotifications: {
      orderUpdates: true,
      userActivities: true,
      systemMaintenance: true,
    },
    smsNotifications: {
      criticalAlerts: true,
      orderConfirmations: false,
    },
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: theme,
    primaryColor: '#3B82F6',
    sidebarStyle: 'expanded',
    dashboardLayout: 'grid',
    fontSize: 'medium',
    reduceAnimations: false,
    highContrast: false,
  });

  // User Management Settings
  const [userSettings, setUserSettings] = useState({
    userRegistration: true,
    emailVerification: true,
    defaultUserRole: 'user',
    profileVisibility: 'public',
    allowAvatarUpload: true,
    maxAvatarSize: 2, // MB
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: true,
    paypalEnabled: true,
    bKashEnabled: true,
    nagadEnabled: true,
    currency: 'BDT',
    taxRate: 7.5,
    shippingCost: 60,
    codEnabled: true,
  });

  // API Settings
  const [apiSettings, setApiSettings] = useState({
    apiEnabled: true,
    generateNewKey: false,
    apiKey: 'sk_live_********',
    rateLimit: 100,
    webhookUrl: '',
    corsOrigins: ['https://tomartbd.com'],
  });

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save based on active tab
      const settingsToSave = {
        general: generalSettings,
        security: securitySettings,
        notifications: notificationSettings,
        appearance: appearanceSettings,
        users: userSettings,
        payment: paymentSettings,
        api: apiSettings,
      }[activeTab];
      
      // Here you would make an API call to save settings
      console.log(`Saving ${activeTab} settings:`, settingsToSave);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate new API key
  const generateApiKey = () => {
    const newKey = `sk_live_${Math.random().toString(36).substr(2, 32)}`;
    setApiSettings({ ...apiSettings, apiKey: newKey });
  };

  // Handle file upload for logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle logo upload logic here
      console.log('Uploading logo:', file);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      // Reset logic here
      console.log('Resetting settings');
    }
  };

  // Settings tabs
  const tabs = [
    { id: 'general', label: 'General', icon: <Globe className="h-4 w-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="h-4 w-4" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'api', label: 'API', icon: <Database className="h-4 w-4" /> },
  ];

  // Timezone options
  const timezones = [
    'Asia/Dhaka',
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  // Currency options
  const currencies = [
    { code: 'BDT', name: 'Bangladeshi Taka' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'INR', name: 'Indian Rupee' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your admin panel settings and preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Save Status Indicator */}
          {saveStatus && (
            <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
              saveStatus === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              {saveStatus === 'success' ? (
                <Check className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
              <span>
                {saveStatus === 'success' 
                  ? 'Settings saved successfully!' 
                  : 'Failed to save settings. Please try again.'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <nav className="p-4">
                  <ul className="space-y-1">
                    {tabs.map((tab) => (
                      <li key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {tab.icon}
                          <span>{tab.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      General Settings
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Site Name
                          </label>
                          <input
                            type="text"
                            value={generalSettings.siteName}
                            onChange={(e) => setGeneralSettings({
                              ...generalSettings,
                              siteName: e.target.value
                            })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Site URL
                          </label>
                          <input
                            type="url"
                            value={generalSettings.siteUrl}
                            onChange={(e) => setGeneralSettings({
                              ...generalSettings,
                              siteUrl: e.target.value
                            })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Admin Email
                        </label>
                        <input
                          type="email"
                          value={generalSettings.adminEmail}
                          onChange={(e) => setGeneralSettings({
                            ...generalSettings,
                            adminEmail: e.target.value
                          })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Timezone
                          </label>
                          <select
                            value={generalSettings.timezone}
                            onChange={(e) => setGeneralSettings({
                              ...generalSettings,
                              timezone: e.target.value
                            })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            {timezones.map(tz => (
                              <option key={tz} value={tz}>{tz}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Currency
                          </label>
                          <select
                            value={generalSettings.currency}
                            onChange={(e) => setGeneralSettings({
                              ...generalSettings,
                              currency: e.target.value
                            })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            {currencies.map(curr => (
                              <option key={curr.code} value={curr.code}>
                                {curr.code} - {curr.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Language
                          </label>
                          <select
                            value={generalSettings.language}
                            onChange={(e) => setGeneralSettings({
                              ...generalSettings,
                              language: e.target.value
                            })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="en">English</option>
                            <option value="bn">Bengali</option>
                            <option value="ar">Arabic</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Maintenance Mode
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Take your site offline for maintenance
                          </p>
                        </div>
                        <button
                          onClick={() => setGeneralSettings({
                            ...generalSettings,
                            maintenanceMode: !generalSettings.maintenanceMode
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            generalSettings.maintenanceMode
                              ? 'bg-red-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              generalSettings.maintenanceMode
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Logo Upload */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Brand Logo
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            Drag & drop your logo here or click to upload
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Recommended: 200x60px, PNG or SVG format
                          </p>
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg cursor-pointer transition-colors inline-block"
                          >
                            Upload Logo
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Appearance Settings
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Theme
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {['light', 'dark', 'system'].map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setTheme(t);
                                setAppearanceSettings({
                                  ...appearanceSettings,
                                  theme: t
                                });
                              }}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                theme === t
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                              }`}
                            >
                              <div className={`w-full h-24 rounded ${
                                t === 'light' 
                                  ? 'bg-gray-100' 
                                  : t === 'dark' 
                                    ? 'bg-gray-800' 
                                    : 'bg-gradient-to-r from-gray-100 to-gray-800'
                              }`}></div>
                              <div className="mt-3 text-center">
                                <p className="font-medium text-gray-900 dark:text-white capitalize">
                                  {t} Theme
                                </p>
                                {theme === t && (
                                  <p className="text-sm text-primary-600 mt-1">
                                    Active
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Primary Color
                        </h3>
                        <div className="flex items-center space-x-4">
                          <input
                            type="color"
                            value={appearanceSettings.primaryColor}
                            onChange={(e) => setAppearanceSettings({
                              ...appearanceSettings,
                              primaryColor: e.target.value
                            })}
                            className="w-16 h-16 cursor-pointer rounded-lg"
                          />
                          <div>
                            <p className="text-gray-700 dark:text-gray-300">
                              Selected Color: {appearanceSettings.primaryColor}
                            </p>
                            <p className="text-sm text-gray-500">
                              This color will be used for buttons, links, and highlights
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sidebar Style
                          </label>
                          <select
                            value={appearanceSettings.sidebarStyle}
                            onChange={(e) => setAppearanceSettings({
                              ...appearanceSettings,
                              sidebarStyle: e.target.value
                            })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          >
                            <option value="expanded">Expanded</option>
                            <option value="collapsed">Collapsed</option>
                            <option value="compact">Compact</option>
                            <option value="floating">Floating</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Font Size
                          </label>
                          <select
                            value={appearanceSettings.fontSize}
                            onChange={(e) => setAppearanceSettings({
                              ...appearanceSettings,
                              fontSize: e.target.value
                            })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="xlarge">Extra Large</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              Reduce Animations
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Minimize animations for better performance
                            </p>
                          </div>
                          <button
                            onClick={() => setAppearanceSettings({
                              ...appearanceSettings,
                              reduceAnimations: !appearanceSettings.reduceAnimations
                            })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              appearanceSettings.reduceAnimations
                                ? 'bg-primary-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                appearanceSettings.reduceAnimations
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              High Contrast Mode
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Increase contrast for better readability
                            </p>
                          </div>
                          <button
                            onClick={() => setAppearanceSettings({
                              ...appearanceSettings,
                              highContrast: !appearanceSettings.highContrast
                            })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              appearanceSettings.highContrast
                                ? 'bg-primary-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                appearanceSettings.highContrast
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Security Settings
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Require 2FA for all admin accounts
                          </p>
                        </div>
                        <button
                          onClick={() => setSecuritySettings({
                            ...securitySettings,
                            twoFactorAuth: !securitySettings.twoFactorAuth
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            securitySettings.twoFactorAuth
                              ? 'bg-primary-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              securitySettings.twoFactorAuth
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Password Policy
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-700 dark:text-gray-300">
                                Minimum Password Length
                              </p>
                              <p className="text-sm text-gray-500">
                                {securitySettings.passwordPolicy.minLength} characters
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSecuritySettings({
                                  ...securitySettings,
                                  passwordPolicy: {
                                    ...securitySettings.passwordPolicy,
                                    minLength: Math.max(6, securitySettings.passwordPolicy.minLength - 1)
                                  }
                                })}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg"
                              >
                                -
                              </button>
                              <span className="w-12 text-center">
                                {securitySettings.passwordPolicy.minLength}
                              </span>
                              <button
                                onClick={() => setSecuritySettings({
                                  ...securitySettings,
                                  passwordPolicy: {
                                    ...securitySettings.passwordPolicy,
                                    minLength: securitySettings.passwordPolicy.minLength + 1
                                  }
                                })}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {Object.entries(securitySettings.passwordPolicy)
                            .filter(([key]) => key !== 'minLength')
                            .map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                                    {key.replace('require', 'Require ')}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {key.includes('Uppercase') ? 'Include uppercase letters' :
                                     key.includes('Numbers') ? 'Include numbers' :
                                     'Include special characters'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => setSecuritySettings({
                                    ...securitySettings,
                                    passwordPolicy: {
                                      ...securitySettings.passwordPolicy,
                                      [key]: !value
                                    }
                                  })}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    value
                                      ? 'bg-primary-500'
                                      : 'bg-gray-300 dark:bg-gray-600'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      value ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Session Management
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Max Login Attempts
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={securitySettings.loginAttempts}
                              onChange={(e) => setSecuritySettings({
                                ...securitySettings,
                                loginAttempts: parseInt(e.target.value)
                              })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Session Timeout (minutes)
                            </label>
                            <input
                              type="number"
                              min="5"
                              max="240"
                              value={securitySettings.sessionTimeout}
                              onChange={(e) => setSecuritySettings({
                                ...securitySettings,
                                sessionTimeout: parseInt(e.target.value)
                              })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          IP Whitelist
                        </h3>
                        <div className="space-y-3">
                          {securitySettings.ipWhitelist.map((ip, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <input
                                type="text"
                                value={ip}
                                onChange={(e) => {
                                  const newList = [...securitySettings.ipWhitelist];
                                  newList[index] = e.target.value;
                                  setSecuritySettings({
                                    ...securitySettings,
                                    ipWhitelist: newList
                                  });
                                }}
                                placeholder="192.168.1.1"
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                              />
                              <button
                                onClick={() => setSecuritySettings({
                                  ...securitySettings,
                                  ipWhitelist: securitySettings.ipWhitelist.filter((_, i) => i !== index)
                                })}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => setSecuritySettings({
                              ...securitySettings,
                              ipWhitelist: [...securitySettings.ipWhitelist, '']
                            })}
                            className="px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-gray-400 transition-colors"
                          >
                            + Add IP Address
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add more tabs for Notifications, Users, Payment, API following similar pattern */}
                
                {/* Quick Preview - Add remaining tabs with similar structure */}
                {activeTab === 'notifications' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Notification Settings
                    </h2>
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Notification settings configuration</p>
                      <p className="text-sm">(Implementation similar to above sections)</p>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      User Management Settings
                    </h2>
                    {/* Similar structure for user settings */}
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      Payment Settings
                    </h2>
                    {/* Payment gateway configurations */}
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      API Settings
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            API Access
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enable/Disable API access for third-party applications
                          </p>
                        </div>
                        <button
                          onClick={() => setApiSettings({
                            ...apiSettings,
                            apiEnabled: !apiSettings.apiEnabled
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            apiSettings.apiEnabled
                              ? 'bg-primary-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              apiSettings.apiEnabled
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          API Key
                        </h3>
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={apiSettings.apiKey}
                            readOnly
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                          />
                          <button
                            onClick={generateApiKey}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center space-x-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span>Regenerate</span>
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Keep this key secret. Regenerate if compromised.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;