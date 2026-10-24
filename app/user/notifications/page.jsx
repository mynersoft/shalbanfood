import NotificationList from '@/components/notifications/NotificationList';
import EnablePushNotifications from '@/components/notifications/EnablePushNotifications';

export default function NotificationsPage() {
	return (
		<main className="space-y-6 p-4 md:p-6">
			<div className="rounded-xl border border-gray-200 bg-white p-4">
				<h2 className="font-semibold text-gray-900">
					ব্রাউজার নোটিফিকেশন
				</h2>

				<p className="mt-1 mb-4 text-sm text-gray-500">
					অর্ডারের আপডেট ও গুরুত্বপূর্ণ খবর ডিভাইসে পেতে Push
					Notification চালু করুন।
				</p>

				<EnablePushNotifications />
			</div>

			<NotificationList />
		</main>
	);
}
