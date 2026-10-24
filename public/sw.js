// public/sw.js
// বিদ্যমান PWA code এবং event handlers অক্ষত রাখবে।

importScripts(
	'https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js'
);
importScripts(
	'https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js'
);

firebase.initializeApp({
	apiKey: 'AIzaSyBIBkOqXb240AZe6byZwxU3gVWXatvy2Lg',
	authDomain: 'shalbanfood-15bcf.firebaseapp.com',
	projectId: 'shalbanfood-15bcf',
	storageBucket: 'shalbanfood-15bcf.firebasestorage.app',
	messagingSenderId: 'G-9LRMR5PQQY',
	appId: '1:1097229394360:web:f13235071185f4a6a72f4d',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
	// Notification payload থাকলে FCM/browser সাধারণত
	// নিজেই notification প্রদর্শন করে।
	// একই notification আবার showNotification() দিয়ে
	// প্রদর্শন করবে না।
	console.log('Background notification received:', payload);
});
