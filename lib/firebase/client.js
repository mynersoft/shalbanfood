import { getApp, getApps, initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { app };

export async function getFirebaseMessaging() {
	// Firebase Messaging শুধুমাত্র browser-এ চালু হবে
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const supported = await isSupported();

		if (!supported) {
			return null;
		}

		return getMessaging(app);
	} catch (error) {
		console.error('Firebase Messaging initialization failed:', error);
		return null;
	}
}
