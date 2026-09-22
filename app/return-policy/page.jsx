// app/return-policy/page.tsx
import React from 'react';
import { 
  FaUndo, 
  FaExchangeAlt, 
  FaTimesCircle, 
  FaCheckCircle, 
  FaTruck, 
  FaMoneyBillWave,
  FaClock,
  FaExclamationTriangle,
  FaBoxOpen,
  FaShieldAlt,
  FaPhoneAlt,
  FaQuestionCircle
} from 'react-icons/fa';

const ReturnPolicyPage = () => {
  const lastUpdated = "২৫ ডিসেম্বর, ২০২৪";
  
  const returnConditions = [
    {
      title: '৭ দিনের রিটার্ন নিশ্চয়তা',
      description: 'পণ্য পাওয়ার তারিখ থেকে ৭ দিনের মধ্যে রিটার্নের জন্য আবেদন করতে পারবেন',
      icon: <FaClock className="text-blue-500" />,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'মূল্য ফেরত',
      description: 'যোগ্য পণ্যের জন্য সম্পূর্ণ মূল্য ফেরত বা প্রতিস্থাপন',
      icon: <FaMoneyBillWave className="text-green-500" />,
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'বিনামূল্যে পিকআপ',
      description: 'ডোরস্টেপ থেকে বিনামূল্যে পণ্য সংগ্রহ',
      icon: <FaTruck className="text-purple-500" />,
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'দ্রুত প্রসেসিং',
      description: 'রিফান্ড অনুমোদনের ৫-১০ কার্যদিবসের মধ্যে',
      icon: <FaCheckCircle className="text-teal-500" />,
      color: 'bg-teal-50 border-teal-200'
    }
  ];

  const eligibleCategories = [
    {
      category: 'ইলেকট্রনিক্স',
      items: ['মোবাইল ফোন', 'ল্যাপটপ', 'ট্যাবলেট', 'ক্যামেরা'],
      period: '৭ দিন',
      conditions: 'আনবক্সড/অব্যবহৃত অবস্থায়'
    },
    {
      category: 'ফ্যাশন',
      items: ['পোশাক', 'জুতা', 'ব্যাগ'],
      period: '৭ দিন',
      conditions: 'ট্যাগসহ, অপরিষ্কার'
    },
    {
      category: 'গৃহস্থালী',
      items: ['বাসনপত্র', 'গ্যাজেট', 'ডেকোর'],
      period: '৭ দিন',
      conditions: 'মূল প্যাকেজিংয়ে'
    },
    {
      category: 'বই ও স্টেশনারি',
      items: ['বই', 'কলম', 'নোটবুক'],
      period: '৭ দিন',
      conditions: 'সিল না ভাঙ্গা অবস্থায়'
    }
  ];

  const nonReturnableItems = [
    'অভ্যন্তরীণ পণ্য (আন্ডারগার্মেন্টস, সুইমস্যুট)',
    'ব্যক্তিগত স্বাস্থ্য ও সৌন্দর্য পণ্য',
    'গিফ্ট কার্ড ও ডিজিটাল পণ্য',
    'পারফিউম ও কসমেটিক্স',
    'নির্দিষ্ট ইলেকট্রনিক্স (ইয়ারফোন, মেমরি কার্ড)',
    'কাস্টমাইজড/পার্সোনালাইজড পণ্য',
    'খাদ্য ও পানীয় পণ্য',
    'ফুল ও জীবন্ত গাছ'
  ];

  const returnProcess = [
    {
      step: "১",
      title: 'অনলাইনে রিটার্ন আবেদন করুন',
      description: 'আমার অর্ডার সেকশন থেকে রিটার্নের জন্য আবেদন করুন',
      time: '২৪ ঘণ্টার মধ্যে',
      icon: <FaUndo />
    },
    {
      step:" ২",
      title: 'পিকআপ সময় নিশ্চিত করুন',
      description: 'আমাদের প্রতিনিধি পণ্য সংগ্রহের সময়সূচী জানাবেন',
      time: '১-২ কার্যদিবস',
      icon: <FaTruck />
    },
    {
      step:" ৩",
      title: 'পণ্য পরিদর্শন',
      description: 'গুণগতমান এবং শর্ত যাচাই করা হবে',
      time: '২-৩ কার্যদিবস',
      icon: <FaBoxOpen />
    },
    {
      step:" ৪",
      title: 'রিফান্ড/প্রতিস্থাপন',
      description: 'রিফান্ড অনুমোদিত হলে টাকা ফেরত দেওয়া হবে',
      time: '৫-১০ কার্যদিবস',
      icon: <FaMoneyBillWave />
    }
  ];

  const refundMethods = [
    {
      method: 'bKash',
      time: '২৪-৪৮ ঘণ্টা',
      icon: '💰',
      description: 'সরাসরি আপনার bKash একাউন্টে'
    },
    {
      method: 'নগদ',
      time: '৫-৭ কার্যদিবস',
      icon: '💳',
      description: 'ব্যাংক ট্রান্সফার মাধ্যমে'
    },
    {
      method: 'ওয়ালেট ব্যালেন্স',
      time: '২৪ ঘণ্টা',
      icon: '👛',
      description: 'Tomartbd ওয়ালেটে ক্রেডিট'
    },
    {
      method: 'কার্ড রিফান্ড',
      time: '১০-১৫ কার্যদিবস',
      icon: '💳',
      description: 'ব্যাংকের উপর নির্ভরশীল'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-3">রিটার্ন ও রিফান্ড নীতি</h1>
              <p className="text-green-100 text-lg">সহজ রিটার্ন প্রক্রিয়া এবং দ্রুত রিফান্ড নিশ্চয়তা</p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white text-sm">সর্বশেষ হালনাগাদ:</p>
              <p className="text-white font-bold text-lg">{lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {returnConditions.map((item, index) => (
            <div key={index} className={`${item.color} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Return Process */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaUndo className="text-green-500" />
                রিটার্ন প্রক্রিয়া
              </h2>
              <div className="space-y-6">
                {returnProcess.map((step, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-800">{step.title}</h3>
                          <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                            {step.time}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{step.description}</p>
                        <div className="text-2xl text-green-500">{step.icon}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligible for Return */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaCheckCircle className="text-green-500" />
                রিটার্নের জন্য যোগ্য পণ্য
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eligibleCategories.map((cat, index) => (
                  <div key={index} className="border border-green-200 rounded-xl p-5 bg-green-50">
                    <h3 className="font-bold text-gray-800 text-lg mb-3">{cat.category}</h3>
                    <div className="mb-3">
                      <span className="text-sm font-semibold text-gray-600">পণ্য:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {cat.items.map((item, idx) => (
                          <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="font-semibold">সময়সীমা:</span>
                        <span className="ml-2 text-green-600 font-bold">{cat.period}</span>
                      </div>
                      <div>
                        <span className="font-semibold">শর্ত:</span>
                        <span className="ml-2">{cat.conditions}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Non-Returnable Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTimesCircle className="text-red-500" />
                রিটার্ন অযোগ্য পণ্য
              </h3>
              <ul className="space-y-3">
                {nonReturnableItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Refund Methods */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-500" />
                রিফান্ড পদ্ধতি
              </h3>
              <div className="space-y-4">
                {refundMethods.map((method, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-semibold">{method.method}</span>
                      </div>
                      <span className="bg-green-100 text-green-600 text-sm px-3 py-1 rounded-full">
                        {method.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Help */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <FaPhoneAlt />
                সাহায্য প্রয়োজন?
              </h3>
              <p className="text-sm mb-4">রিটার্ন সম্পর্কিত যেকোনো সমস্যায় আমাদের সাথে যোগাযোগ করুন</p>
              <div className="space-y-3">
                <a 
                  href="tel:+8809678000000"
                  className="bg-white text-green-600 font-semibold py-3 px-4 rounded-lg hover:bg-green-50 transition-colors block text-center"
                >
                  📞 ০৯৬৭৮-০০০০০০
                </a>
                <a 
                  href="mailto:support@tomartbd.com"
                  className="bg-green-700 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-800 transition-colors block text-center"
                >
                  ✉️ ইমেইল করুন
                </a>
                <a 
                  href="/contact"
                  className="border-2 border-white text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors block text-center"
                >
                  💬 লাইভ চ্যাট
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FaExclamationTriangle className="text-yellow-500" />
            গুরুত্বপূর্ণ নোট
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaShieldAlt className="text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800">নিরাপদ প্যাকেজিং</h4>
                  <p className="text-gray-600 text-sm">রিটার্নের সময় মূল প্যাকেজিং এবং সকল আনুষঙ্গিক জিনিস সহ পণ্য ফেরত দিন</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaClock className="text-blue-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800">সময়সীমা</h4>
                  <p className="text-gray-600 text-sm">রিটার্ন আবেদনের পর ২৪-৪৮ ঘণ্টার মধ্যে পিকআপ করা হবে</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaQuestionCircle className="text-purple-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800">রিফান্ড সময়</h4>
                  <p className="text-gray-600 text-sm">পণ্য পরিদর্শনের পর রিফান্ড প্রক্রিয়া শুরু হবে</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaExchangeAlt className="text-red-500 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-800">প্রতিস্থাপন</h4>
                  <p className="text-gray-600 text-sm">প্রতিস্থাপনের ক্ষেত্রে একই মডেলের স্টক থাকা সাপেক্ষে</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Return Button */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-col md:flex-row gap-4">
            <a 
              href="/my-orders"
              className="bg-green-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-green-700 transition-colors text-lg inline-flex items-center justify-center gap-3"
            >
              <FaUndo />
              এখনই রিটার্ন করুন
            </a>
            <a 
              href="/faq"
              className="bg-gray-100 text-gray-800 font-bold py-4 px-8 rounded-xl hover:bg-gray-200 transition-colors text-lg inline-flex items-center justify-center gap-3"
            >
              <FaQuestionCircle />
              রিটার্ন সম্পর্কিত FAQ
            </a>
          </div>
          <p className="text-gray-500 mt-4 text-sm">
            রিটার্নের জন্য "আমার অর্ডার" পৃষ্ঠা থেকে রিটার্ন রিকোয়েস্ট তৈরি করুন
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;