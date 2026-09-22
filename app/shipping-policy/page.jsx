// app/shipping-policy/page.tsx
import React from 'react';
import { 
  FaTruck, 
  FaShippingFast, 
  FaMapMarkerAlt, 
  FaClock, 
  FaBoxOpen,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaPhoneAlt,
  FaQuestionCircle,
  FaUndo,
  FaShieldAlt,
  FaHome,
  FaStore
} from 'react-icons/fa';

const ShippingPolicyPage = () => {
  const lastUpdated = "২৫ ডিসেম্বর, ২০২৪";
  
  const shippingZones = [
    {
      zone: 'ঢাকা শহর',
      areas: ['গুলশান', 'বনানী', 'ধানমন্ডি', 'মোহাম্মদপুর', 'মিরপুর', 'উত্তরা', 'ডিএনসিসি'],
      deliveryTime: '১-২ দিন',
      fee: '৬০ টাকা',
      freeOver: '১০০০+ টাকার অর্ডার',
      icon: <FaHome className="text-blue-500" />
    },
    {
      zone: 'ঢাকা জেলা',
      areas: ['নারায়ণগঞ্জ', 'গাজীপুর', 'সাভার', 'কেরাণীগঞ্জ'],
      deliveryTime: '২-৩ দিন',
      fee: '৮০ টাকা',
      freeOver: '১৫০০+ টাকার অর্ডার',
      icon: <FaMapMarkerAlt className="text-green-500" />
    },
    {
      zone: 'বিভাগীয় শহর',
      areas: ['চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'সিলেট', 'বরিশাল', 'রংপুর'],
      deliveryTime: '৩-৪ দিন',
      fee: '১২০ টাকা',
      freeOver: '২০০০+ টাকার অর্ডার',
      icon: <FaStore className="text-purple-500" />
    },
    {
      zone: 'জেলা শহর',
      areas: ['ফরিদপুর', 'কুমিল্লা', 'নোয়াখালী', 'জামালপুর', 'পঞ্চগড়'],
      deliveryTime: '৪-৫ দিন',
      fee: '১৫০ টাকা',
      freeOver: '৩০০০+ টাকার অর্ডার',
      icon: <FaTruck className="text-orange-500" />
    },
    {
      zone: 'উপজেলা',
      areas: ['সমস্ত উপজেলা পর্যায়'],
      deliveryTime: '৫-৭ দিন',
      fee: '২০০ টাকা',
      freeOver: '৫০০০+ টাকার অর্ডার',
      icon: <FaShippingFast className="text-red-500" />
    }
  ];

  const deliveryPartners = [
    {
      name: 'সুন্দরবন কুরিয়ার',
      coverage: 'সারা দেশ',
      tracking: true,
      cod: true,
      time: '২-৭ দিন',
      rating: '৪.৮/৫'
    },
    {
      name: 'সনি এক্সপ্রেস',
      coverage: 'মেট্রো শহর',
      tracking: true,
      cod: true,
      time: '১-৩ দিন',
      rating: '৪.৭/৫'
    },
    {
      name: 'পাঠাও',
      coverage: 'ঢাকা বিভাগ',
      tracking: true,
      cod: true,
      time: '১-২ দিন',
      rating: '৪.৯/৫'
    },
    {
      name: 'ই-কুরিয়ার',
      coverage: 'সব বিভাগীয় শহর',
      tracking: true,
      cod: true,
      time: '৩-৫ দিন',
      rating: '৪.৬/৫'
    }
  ];

  const shippingTimeline = [
    {
      stage: 'অর্ডার প্রসেসিং',
      time: '২৪ ঘণ্টা',
      description: 'অর্ডার যাচাই ও প্রস্তুতকরণ',
      status: 'প্রতিটি অর্ডার'
    },
    {
      stage: 'শিপিং প্রস্তুত',
      time: '২৪-৪৮ ঘণ্টা',
      description: 'প্যাকেজিং এবং হ্যান্ডওভার',
      status: 'স্টক পণ্যের জন্য'
    },
    {
      stage: 'ট্রানজিট',
      time: 'অবস্থানভেদ',
      description: 'কুরিয়ারে হস্তান্তর',
      status: 'ট্র্যাকিং নম্বর প্রাপ্তি'
    },
    {
      stage: 'ডেলিভারি',
      time: '১-৭ দিন',
      description: 'আপনার ঠিকানায় পৌঁছানো',
      status: 'ডেলিভারি পার্টনার'
    }
  ];

  const shippingCosts = [
    {
      weight: '০-০.৫ কেজি',
      dhaka: '৬০ টাকা',
      divisional: '১২০ টাকা',
      district: '১৫০ টাকা',
      upazila: '২০০ টাকা'
    },
    {
      weight: '০.৫-১ কেজি',
      dhaka: '৮০ টাকা',
      divisional: '১৪০ টাকা',
      district: '১৮০ টাকা',
      upazila: '২৪০ টাকা'
    },
    {
      weight: '১-২ কেজি',
      dhaka: '১০০ টাকা',
      divisional: '১৬০ টাকা',
      district: '২২০ টাকা',
      upazila: '৩০০ টাকা'
    },
    {
      weight: '২-৫ কেজি',
      dhaka: '১৫০ টাকা',
      divisional: '২৫০ টাকা',
      district: '৩৫০ টাকা',
      upazila: '৫০০ টাকা'
    }
  ];

  const deliveryOptions = [
    {
      type: 'স্ট্যান্ডার্ড ডেলিভারি',
      time: '৩-৭ কার্যদিবস',
      fee: 'শুরু ৬০ টাকা',
      features: ['ফ্রি শিপিং নির্দিষ্ট অর্ডারে', 'ট্র্যাকিং সুবিধা', 'ক্যাশ অন ডেলিভারি'],
      icon: <FaTruck className="text-blue-500" />
    },
    {
      type: 'এক্সপ্রেস ডেলিভারি',
      time: '১-৩ কার্যদিবস',
      fee: 'অতিরিক্ত ১০০ টাকা',
      features: ['অগ্রাধিকার প্রসেসিং', '২৪/৭ ট্র্যাকিং', 'ডেডিকেটেড সাপোর্ট'],
      icon: <FaShippingFast className="text-green-500" />
    },
    {
      type: 'সেমি-এক্সপ্রেস',
      time: '২-৪ কার্যদিবস',
      fee: 'অতিরিক্ত ৫০ টাকা',
      features: ['দ্রুত প্রসেসিং', 'রিয়েল-টাইম আপডেট', 'ফোন নোটিফিকেশন'],
      icon: <FaClock className="text-purple-500" />
    }
  ];

  const restrictions = [
    'আন্তর্জাতিক শিপিংয়ের জন্য আলাদা ব্যবস্থা',
    'বিপজ্জনক/নিষিদ্ধ পণ্য পাঠানো যায় না',
    '১০ কেজির বেশি পণ্যের জন্য অতিরিক্ত চার্জ',
    'সীমান্তবর্তী এলাকায় অতিরিক্ত সময় লাগতে পারে',
    'রাজনৈতিক বা প্রাকৃতিক অস্থিরতায় বিলম্ব',
    'ছুটির দিনে ডেলিভারি নেই'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-3">শিপিং ও ডেলিভারি নীতি</h1>
              <p className="text-blue-100 text-lg">সারা বাংলাদেশে নিরাপদ ও নির্ভরযোগ্য ডেলিভারি</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-white text-sm">সর্বশেষ হালনাগাদ:</p>
                <p className="text-white font-bold text-lg">{lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-4">
              <FaShippingFast className="text-blue-500 text-3xl" />
              <div>
                <h3 className="font-bold text-gray-800 text-lg">সারা বাংলাদেশে ডেলিভারি</h3>
                <p className="text-gray-600 text-sm">৬৪ জেলায় আমাদের সেবা</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <FaClock className="text-green-500 text-3xl" />
              <div>
                <h3 className="font-bold text-gray-800 text-lg">১-৭ দিনের মধ্যে</h3>
                <p className="text-gray-600 text-sm">দ্রুততম ডেলিভারি নিশ্চয়তা</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-4">
              <FaShieldAlt className="text-purple-500 text-3xl" />
              <div>
                <h3 className="font-bold text-gray-800 text-lg">নিরাপদ প্যাকেজিং</h3>
                <p className="text-gray-600 text-sm">পণ্য নিরাপত্তা গ্যারান্টি</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Shipping Zones */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-500" />
                ডেলিভারি জোন ও সময়
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-gray-300 p-4 text-left">জোন</th>
                      <th className="border border-gray-300 p-4 text-left">এলাকা</th>
                      <th className="border border-gray-300 p-4 text-left">ডেলিভারি সময়</th>
                      <th className="border border-gray-300 p-4 text-left">শিপিং চার্জ</th>
                      <th className="border border-gray-300 p-4 text-left">ফ্রি শিপিং</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingZones.map((zone, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-4">
                          <div className="flex items-center gap-2">
                            {zone.icon}
                            <span className="font-semibold">{zone.zone}</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 p-4">
                          <div className="flex flex-wrap gap-1">
                            {zone.areas.slice(0, 3).map((area, i) => (
                              <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">
                                {area}
                              </span>
                            ))}
                            {zone.areas.length > 3 && (
                              <span className="text-blue-600 text-sm">+{zone.areas.length - 3} টি</span>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 p-4">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                            {zone.deliveryTime}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-4 font-semibold text-gray-700">
                          {zone.fee}
                        </td>
                        <td className="border border-gray-300 p-4">
                          <span className="text-green-600 font-semibold">{zone.freeOver}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaClock className="text-purple-500" />
                শিপিং টাইমলাইন
              </h2>
              <div className="relative">
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-1 bg-blue-200 w-3/4 top-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {shippingTimeline.map((stage, index) => (
                    <div key={index} className="relative">
                      <div className="bg-white border-2 border-blue-100 rounded-xl p-6 text-center shadow-sm">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                            {index + 1}
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">{stage.stage}</h3>
                        <p className="text-gray-600 text-sm mb-3">{stage.description}</p>
                        <div className="bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full inline-block text-sm">
                          {stage.time}
                        </div>
                        <p className="text-gray-500 text-xs mt-3">{stage.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Delivery Options */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTruck className="text-green-500" />
                ডেলিভারি অপশন
              </h3>
              <div className="space-y-4">
                {deliveryOptions.map((option, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {option.icon}
                        <span className="font-semibold">{option.type}</span>
                      </div>
                      <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">
                        {option.time}
                      </span>
                    </div>
                    <p className="text-gray-700 font-semibold mb-3">{option.fee}</p>
                    <ul className="space-y-2">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <FaCheckCircle className="text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Partners */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">ডেলিভারি পার্টনার</h3>
              <div className="space-y-4">
                {deliveryPartners.map((partner, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{partner.name}</span>
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                        {partner.rating}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">কভারেজ:</span>
                        <span className="ml-2">{partner.coverage}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">সময়:</span>
                        <span className="ml-2">{partner.time}</span>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3">
                      <span className={`text-xs px-2 py-1 rounded ${partner.tracking ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {partner.tracking ? 'ট্র্যাকিং ✓' : 'ট্র্যাকিং ✗'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${partner.cod ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {partner.cod ? 'ক্যাশ অন ডেলিভারি ✓' : 'ক্যাশ অন ডেলিভারি ✗'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <FaPhoneAlt />
                ট্র্যাকিং সম্পর্কিত সাহায্য
              </h3>
              <p className="text-sm mb-4">আপনার অর্ডার ট্র্যাক করতে সমস্যা হলে</p>
              <div className="space-y-3">
                <a 
                  href="/track-order"
                  className="bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors block text-center"
                >
                  📦 অর্ডার ট্র্যাক করুন
                </a>
                <a 
                  href="tel:+8809678000000"
                  className="bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors block text-center"
                >
                  📞 কল করুন: ০৯৬৭৮-০০০০০০
                </a>
                <a 
                  href="/contact"
                  className="border-2 border-white text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors block text-center"
                >
                  💬 চ্যাট সমর্থন
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Cost Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">শিপিং খরচ বিস্তারিত (ওজন অনুযায়ী)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-gray-300 p-4 text-left">ওজন</th>
                  <th className="border border-gray-300 p-4 text-left">ঢাকা শহর</th>
                  <th className="border border-gray-300 p-4 text-left">বিভাগীয় শহর</th>
                  <th className="border border-gray-300 p-4 text-left">জেলা শহর</th>
                  <th className="border border-gray-300 p-4 text-left">উপজেলা</th>
                </tr>
              </thead>
              <tbody>
                {shippingCosts.map((cost, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-4 font-semibold">{cost.weight}</td>
                    <td className="border border-gray-300 p-4">{cost.dhaka}</td>
                    <td className="border border-gray-300 p-4">{cost.divisional}</td>
                    <td className="border border-gray-300 p-4">{cost.district}</td>
                    <td className="border border-gray-300 p-4">{cost.upazila}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            * ৫ কেজির উপরে প্রতি কেজিতে অতিরিক্ত ৫০ টাকা চার্জ প্রযোজ্য
          </p>
        </div>

        {/* Restrictions & Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaExclamationTriangle className="text-yellow-500" />
            গুরুত্বপূর্ণ নির্দেশনা ও বিধিনিষেধ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">ডেলিভারি বিধিনিষেধ:</h4>
              <ul className="space-y-2">
                {restrictions.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaUndo className="text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800">ডেলিভারি ব্যর্থ হলে</h4>
                  <p className="text-gray-600 text-sm">৩ বার চেষ্টার পর অর্ডার ক্যানসেল করা হবে এবং রিফান্ড করা হবে</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaBoxOpen className="text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800">প্যাকেজিং</h4>
                  <p className="text-gray-600 text-sm">সকল পণ্য নিরাপদ ও ওয়াটারপ্রুফ প্যাকেজিংয়ে পাঠানো হয়</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaCheckCircle className="text-purple-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800">ডেলিভারি নিশ্চয়তা</h4>
                  <p className="text-gray-600 text-sm">নির্ধারিত সময়ের মধ্যে ডেলিভারি না হলে বিশেষ ক্ষতিপূরণ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-col md:flex-row gap-4">
            <a 
              href="/my-orders"
              className="bg-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-700 transition-colors text-lg inline-flex items-center justify-center gap-3"
            >
              <FaShippingFast />
              আমার অর্ডার দেখুন
            </a>
            <a 
              href="/faq"
              className="bg-gray-100 text-gray-800 font-bold py-4 px-8 rounded-xl hover:bg-gray-200 transition-colors text-lg inline-flex items-center justify-center gap-3"
            >
              <FaQuestionCircle />
              শিপিং FAQ
            </a>
            <a 
              href="/contact"
              className="bg-green-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-green-700 transition-colors text-lg inline-flex items-center justify-center gap-3"
            >
              <FaPhoneAlt />
              সাহায্য প্রয়োজন?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;