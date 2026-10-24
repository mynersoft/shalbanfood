import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

function getAdminApp() {
	const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
	const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
	const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

	if (!projectId || !clientEmail || !privateKey) {
		throw new Error(
			'Firebase Admin credentials are missing. Check server environment variables.'
		);
	}

	const appName = 'shalban-food-admin';

	const existingApp = getApps().find((app) => app.name === appName);

	if (existingApp) {
		return existingApp;
	}

	return initializeApp(
		{
			credential: cert({
				projectId,
				clientEmail,
				privateKey: privateKey.replace(/\\n/g, '\n'),
			}),
		},
		appName
	);
}

export function getFCM() {
	return getMessaging(getAdminApp());
}
