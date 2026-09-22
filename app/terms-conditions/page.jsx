
import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaShieldAlt, FaLock, FaTruck, FaUndo } from 'react-icons/fa';

const TermsConditionsPage = () => {
  const lastUpdated = "২৫ ডিসেম্বর, ২০২৪";
  
  const sections = [
    {
      id: 'acceptance',
      icon: <FaCheckCircle className="text-green-500" />,
      title: '১. শর্তাবলী গ্রহণ',
      content: 'Tomartbd ব্যবহারের মাধ্যমে আপনি আমাদের শর্তাবলী, গোপনীয়তা নীতি এবং রিটার্ন নীতিতে সম্মত হন। আমরা যেকোনো সময় শর্তাবলী পরিবর্তন করতে পারি এবং পরিবর্তনগুলো প্ল্যাটফর্মে প্রকাশের সাথে সাথেই কার্যকর হবে।'
    },
    {
      id: 'eligibility',
      icon: <FaExclamationTriangle className="text-yellow-500" />,
      title: '২. ব্যবহারের যোগ্যতা',
      content: 'আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে এবং বাংলাদেশের নাগরিক হতে হবে। আপনার দেওয়া সকল তথ্য সঠিক এবং হালনাগাদ থাকতে হবে। একটি অ্যাকাউন্ট শুধুমাত্র একজন ব্যবহারকারীর জন্য।'
    },
    {
      id: 'account',
      icon: <FaLock className="text-blue-500" />,
      title: '৩. অ্যাকাউন্ট ও নিরাপত্তা',
      content: 'আপনি আপনার অ্যাকাউন্টের সকল কার্যকলাপের জন্য দায়বদ্ধ। পাসওয়ার্ড গোপন রাখুন এবং কোনো অননুমোদিত অ্যাক্সেস সন্দেহ করলে অবিলম্বে আমাদের জানান।'
    },
    {
      id: 'orders',
      icon: <FaTruck className="text-purple-500" />,
      title: '৪. অর্ডার ও মূল্য',
      content: 'সমস্ত মূল্য বাংলাদেশী টাকায় (BDT) এবং সর্বশেষ মূল্য দেখানো হয়। অর্ডার চূড়ান্ত হওয়া শিপিং কনফার্মেশনের উপর নির্ভরশীল। আমরা ভুল মূল্য বা স্টক না থাকার কারণে অর্ডার বাতিল করতে পারি।'
    },
    {
      id: 'payment',
      icon: <FaShieldAlt className="text-indigo-500" />,
      title: '৫. পেমেন্ট পদ্ধতি',
      content: 'ক্যাশ অন ডেলিভারি (COD), bKash, Nagad, Rocket, কার্ড ও ব্যাংক ট্রান্সফার গ্রহণযোগ্য। প্রিপেইড অর্ডারের ক্ষেত্রে পেমেন্ট যাচাই হওয়ার পর প্রসেসিং শুরু হয়।'
    },
    {
      id: 'returns',
      icon: <FaUndo className="text-red-500" />,
      title: '৬. ফেরত ও রিফান্ড',
      content: 'আমাদের রিটার্ন পলিসি অনুসারে ফেরতের জন্য আবেদন করতে হবে। ভুল বা ত্রুটিপূর্ণ পণ্য প্রাপ্তির ৭ দিনের মধ্যে ফেরতের জন্য যোগ্য। রিফান্ড প্রক্রিয়ায় ৫-১০ কার্যদিবস সময় লাগতে পারে।'
    }
  ];

  const quickLinks = [
    { name: 'গোপনীয়তা নীতি', href: '/privacy-policy' },
    { name: 'রিটার্ন পলিসি', href: '/return-policy' },
    { name: 'শিপিং পলিসি', href: '/shipping-policy' },
    { name: 'সাপোর্ট', href: '/contact' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">শর্তাবলী ও নীতিমালা</h1>
              <p className="text-blue-100 text-lg">Tomartbd ব্যবহারের জন্য আমাদের নিয়ম ও শর্তাবলী</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white text-sm">সর্বশেষ হালনাগাদ:</p>
                <p className="text-white font-semibold">{lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b">Tomartbd ব্যবহারের শর্তাবলী</h2>
              
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <div 
                    key={section.id} 
                    id={section.id}
                    className="scroll-mt-24 border-l-4 border-blue-500 pl-6 py-2 hover:bg-blue-50 transition-colors rounded-r-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl mt-1">{section.icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Important Points */}
              <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-500" />
                  গুরুত্বপূর্ণ নির্দেশনা
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>অর্ডার করার আগে পণ্যের বিবরণ, মূল্য এবং রিভিউ ভালোভাবে দেখে নিন</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>ডেলিভারি সময়সীমা পণ্যের ধরন ও অবস্থানের উপর নির্ভরশীল</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>যেকোনো সমস্যায় ২৪/৭ সাপোর্টে যোগাযোগ করুন</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>বিক্রেতার তালিকাভুক্ত পণ্যের জন্য বিক্রেতার রিটার্ন পলিসি প্রযোজ্য</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-8">
              {/* Quick Links */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">দ্রুত লিংক</h3>
                <ul className="space-y-3">
                  {quickLinks.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href} 
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-3 rounded-lg block transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section Navigation */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">অধ্যায় সূচি</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition-colors"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Contact Box */}
              <div className="bg-gradient-to-br from-blue-500 to-teal-400 rounded-2xl shadow-lg p-6 mt-6 text-white">
                <h3 className="text-lg font-bold mb-3">প্রয়োজনে যোগাযোগ</h3>
                <p className="text-sm mb-4">শর্তাবলী সম্পর্কিত কোনো প্রশ্ন থাকলে?</p>
                <a 
                  href="/contact" 
                  className="bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors inline-block w-full text-center"
                >
                  সহায়তা নিন
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8 border-2 border-blue-100">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">সর্তকতা স্বীকারোক্তি</h3>
            <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
              Tomartbd ব্যবহার করার মাধ্যমে আপনি আমাদের সকল শর্তাবলী ও নীতিমালা পড়েছেন, বুঝেছেন এবং মেনে চলতে সম্মত আছেন বলে স্বীকার করছেন। শর্তাবলীতে পরিবর্তন হলে তা আমাদের ওয়েবসাইটে প্রকাশিত হবে এবং আপনার ব্যবহার চালিয়ে যাওয়া পরিবর্তিত শর্তাবলী মেনে নেওয়া বলে গণ্য হবে।
            </p>
            <div className="flex justify-center">
              <a 
                href="/"
                className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                হোমপেজে ফিরে যান
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;