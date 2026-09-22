import HomePage from './HomePage';

export const metadata = {
  title: 'Shalban Food | Premium Honey, Ghee & Natural Food Products',
  description:
    'Shalban Food থেকে সংগ্রহ করুন সুন্দরবনের মধু, কালোজিরা মধু, ঘি এবং বিভিন্ন মানসম্মত প্রাকৃতিক খাদ্যপণ্য।',
  keywords: [
    'Shalban Food',
    'সুন্দরবনের মধু',
    'কালোজিরা মধু',
    'মধু',
    'ঘি',
    'Natural Food',
    'Honey Bangladesh',
  ],
  openGraph: {
    title: 'Shalban Food | Premium Honey & Natural Food Products',
    description:
      'সুন্দরবনের মধু, কালোজিরা মধু, ঘি ও মানসম্মত প্রাকৃতিক খাদ্যপণ্য।',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Shalban Food',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shalban Food | Premium Honey & Natural Food Products',
    description:
      'সুন্দরবনের মধু, কালোজিরা মধু, ঘি ও মানসম্মত প্রাকৃতিক খাদ্যপণ্য।',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <HomePage />;
}