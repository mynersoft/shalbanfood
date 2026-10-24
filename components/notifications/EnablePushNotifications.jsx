'use client';

import { useState } from 'react';
import { getToken } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase/client';

export default function EnablePushNotifications() {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');

	async function enablePush() {
		setLoading(true);
		setMessage('');

		try {
			if (
				!('Notification' in window) ||
				!('serviceWorker' in navigator)
			) {
				throw new Error('এই ব্রাউজারে Push Notification সমর্থিত নয়।');
			}

			if (!window.isSecureContext) {
				throw new Error('HTTPS ওয়েবসাইট থেকে চেষ্টা করুন।');
			}

			const permission = await Notification.requestPermission();

			if (permission !== 'granted') {
				throw new Error('Notification permission দেওয়া হয়নি।');
			}

			const messaging = await getFirebaseMessaging();

			if (!messaging) {
				throw new Error('Firebase Messaging এই ব্রাউজারে সমর্থিত নয়।');
			}

			const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

			if (!vapidKey) {
				throw new Error('Firebase VAPID public key পাওয়া যায়নি।');
			}

			// বিদ্যমান PWA Service Worker ব্যবহার করবে।
			const registration =
				await navigator.serviceWorker.register('/sw.js');

			await navigator.serviceWorker.ready;

			const token = await getToken(messaging, {
				vapidKey,
				serviceWorkerRegistration: registration,
			});

			if (!token) {
				throw new Error('FCM token পাওয়া যায়নি।');
			}

			const response = await fetch('/api/push/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'same-origin',
				body: JSON.stringify({ token }),
			});

			const result = await response
				.json()
				.catch();

			if (!response.ok || !result.success) {
				console.log(result);

				throw new Error(result.message || 'Token সংরক্ষণ করা যায়নি।');
			}

			// কেবল local device marker; সার্ভারের token-এর বিকল্প নয়।
			localStorage.setItem('shalban_push_enabled', 'true');

			setMessage('শালবন ফুডের Push Notification চালু হয়েছে!');
		} catch (error) {
			console.error('Push setup failed:', error);
			setMessage(error.message || 'Push চালু করা যায়নি।');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-2">
			<button
				type="button"
				onClick={enablePush}
				disabled={loading}
				className="rounded-lg bg-[#1f5d3b] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
				{loading ? 'চালু হচ্ছে...' : '🔔 নোটিফিকেশন চালু করুন'}
			</button>

			{message && (
				<p role="status" aria-live="polite" className="text-sm">
					{message}
				</p>
			)}
		</div>
	);
}
