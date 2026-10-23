'use client';

import { useCallback, useEffect, useState } from 'react';
import {
	Save,
	RefreshCw,
	Store,
	Truck,
	CreditCard,
	FileText,
	Search,
	Settings2,
	LoaderCircle,
	CheckCircle2,
	AlertCircle,
} from 'lucide-react';

const inputClass =
	'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white';

const cardClass =
	'rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950';

const defaultSettings = {
	store: {
		site_name: 'Shalban Food',
		site_name_bn: 'শালবন ফুড',
		tagline: 'স্বাদের সাথে আস্থার বন্ধন।',
		phone: '01603816721',
		whatsapp: '01603816721',
		email: '',
		address: 'Madhupur, Tangail, Bangladesh',
		website: 'https://www.shalbanfood.shop',
		facebook: 'https://facebook.com/shalbanfood',
		instagram: '',
		youtube: '',
		tiktok: '',
	},
	order: {
		enableOrders: true,
		minimumOrder: 0,
		autoConfirmOrders: false,
		allowGuestCheckout: true,
		stockCheck: true,
		orderPrefix: 'SF',
	},
	delivery: {
		enabled: true,
		freeDeliveryAbove: 0,
		madhupur: { enabled: true, charge: 0 },
		dhaka: { enabled: true, charge: 60 },
		tangail: { enabled: true, charge: 80 },
		outside: { enabled: true, charge: 120 },
		estimatedDays: '2-5 working days',
	},
	payment: {
		currency: 'BDT',
		cod: { enabled: true },
		bkash: { enabled: true, number: '01603816721', type: 'Personal' },
		nagad: { enabled: false, number: '', type: 'Personal' },
	},
	invoice: {
		enabled: true,
		showLogo: true,
		showPhone: true,
		showAddress: true,
		footerText: 'ধন্যবাদ Shalban Food-এর সাথে থাকার জন্য।',
	},
	seo: {
		title: 'Shalban Food | খাঁটি মধু, ঘি ও প্রাকৃতিক খাবার',
		description:
			'Shalban Food থেকে খাঁটি মধু, গাওয়া ঘি, শুকনো খাবার ও প্রাকৃতিক খাদ্যপণ্য অর্ডার করুন।',
		keywords:
			'Shalban Food, খাঁটি মধু, লিচু ফুলের মধু, কালোজিরা মধু, সুন্দরবনের মধু, গাওয়া ঘি',
		ogImage: '',
		googleVerification: '',
	},
	system: {
		maintenanceMode: false,
		showMaintenanceMessage:
			'আমাদের ওয়েবসাইট বর্তমানে maintenance mode-এ আছে।',
	},
};

function Field({ label, value, onChange, type = 'text', placeholder }) {
	return (
		<label className="block min-w-0">
			<span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
				{label}
			</span>
			<input
				className={inputClass}
				type={type}
				value={value ?? ''}
				placeholder={placeholder || ''}
				min={type === 'number' ? 0 : undefined}
				onChange={(e) =>
					onChange(
						type === 'number'
							? e.target.value === ''
								? 0
								: Number(e.target.value)
							: e.target.value
					)
				}
			/>
		</label>
	);
}

function Toggle({ label, description, checked, onChange }) {
	return (
		<div className="flex items-center justify-between gap-4 py-3">
			<div>
				<p className="text-sm font-medium text-gray-800 dark:text-gray-200">
					{label}
				</p>
				{description && (
					<p className="mt-1 text-xs text-gray-500">{description}</p>
				)}
			</div>

			<button
				type="button"
				role="switch"
				aria-checked={Boolean(checked)}
				onClick={() => onChange(!checked)}
				className={`relative h-6 w-11 shrink-0 rounded-full transition ${
					checked ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
				}`}>
				<span
					className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
						checked ? 'left-6' : 'left-1'
					}`}
				/>
			</button>
		</div>
	);
}

function Section({ title, description, icon: Icon, children }) {
	return (
		<section className={cardClass}>
			<div className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
				<div className="rounded-lg bg-green-50 p-2 text-green-700 dark:bg-green-950 dark:text-green-400">
					<Icon size={19} />
				</div>
				<div>
					<h2 className="font-semibold text-gray-900 dark:text-white">
						{title}
					</h2>
					{description && (
						<p className="mt-1 text-sm text-gray-500">
							{description}
						</p>
					)}
				</div>
			</div>
			{children}
		</section>
	);
}

export default function AdminSettings() {
	const [settings, setSettings] = useState(defaultSettings);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [status, setStatus] = useState(null);

	const loadSettings = useCallback(async () => {
		setLoading(true);
		setStatus(null);

		try {
			const response = await fetch('/api/settings', {
				cache: 'no-store',
			});
			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || 'Settings লোড করা যায়নি।');
			}

			// Preserve model defaults if a field is absent in an older document.
			setSettings((previous) => ({
				...previous,
				...result.data,
				store: { ...previous.store, ...result.data.store },
				order: { ...previous.order, ...result.data.order },
				delivery: {
					...previous.delivery,
					...result.data.delivery,
					madhupur: {
						...previous.delivery.madhupur,
						...result.data.delivery?.madhupur,
					},
					dhaka: {
						...previous.delivery.dhaka,
						...result.data.delivery?.dhaka,
					},
					tangail: {
						...previous.delivery.tangail,
						...result.data.delivery?.tangail,
					},
					outside: {
						...previous.delivery.outside,
						...result.data.delivery?.outside,
					},
				},
				payment: {
					...previous.payment,
					...result.data.payment,
					cod: {
						...previous.payment.cod,
						...result.data.payment?.cod,
					},
					bkash: {
						...previous.payment.bkash,
						...result.data.payment?.bkash,
					},
					nagad: {
						...previous.payment.nagad,
						...result.data.payment?.nagad,
					},
				},
				invoice: { ...previous.invoice, ...result.data.invoice },
				seo: { ...previous.seo, ...result.data.seo },
				system: { ...previous.system, ...result.data.system },
			}));
		} catch (error) {
			setStatus({
				type: 'error',
				message: error.message || 'Settings লোড করতে সমস্যা হয়েছে।',
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadSettings();
	}, [loadSettings]);

	const update = (path, value) => {
		setSettings((current) => {
			const next = { ...current };
			const keys = path.split('.');
			let target = next;
			let source = current;

			for (let i = 0; i < keys.length - 1; i++) {
				target[keys[i]] = { ...source[keys[i]] };
				target = target[keys[i]];
				source = source[keys[i]];
			}

			target[keys[keys.length - 1]] = value;
			return next;
		});
	};

	// handle save settings
	const saveSettings = async (event) => {
		event.preventDefault();
		setSaving(true);
		setStatus(null);

		try {
			const response = await fetch('/api/settings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					store: settings.store,
					order: settings.order,
					delivery: settings.delivery,
					payment: settings.payment,
					invoice: settings.invoice,
					seo: settings.seo,
					system: settings.system,
				}),
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || 'Settings সেভ করা যায়নি।');
			}

			if (result.data) {
				setSettings((current) => ({
					...current,
					...result.data,
				}));
			}

			setStatus({
				type: 'success',
				message: 'Settings সফলভাবে সেভ হয়েছে।',
			});
		} catch (error) {
			setStatus({
				type: 'error',
				message: error.message || 'Settings সেভ করা যায়নি।',
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-64 items-center justify-center gap-2 text-sm text-gray-500">
				<LoaderCircle className="animate-spin" size={20} />
				Settings লোড হচ্ছে...
			</div>
		);
	}

	return (
		<form
			onSubmit={saveSettings}
			className="min-h-screen space-y-5 bg-gray-50 p-4 text-gray-900 dark:bg-gray-900 dark:text-white sm:p-6">
			<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-bold">Store Settings</h1>
					<p className="mt-1 text-sm text-gray-500">
						Shalban Food-এর প্রয়োজনীয় দোকান ও ওয়েবসাইট সেটিংস
					</p>
				</div>

				<div className="flex gap-2">
					<button
						type="button"
						onClick={loadSettings}
						disabled={saving}
						className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium dark:border-gray-700 dark:bg-gray-950">
						<RefreshCw size={16} />
						Reload
					</button>
					<button
						type="submit"
						disabled={saving}
						className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">
						{saving ? (
							<LoaderCircle className="animate-spin" size={16} />
						) : (
							<Save size={16} />
						)}
						{saving ? 'সেভ হচ্ছে...' : 'Save Changes'}
					</button>
				</div>
			</header>

			{status && (
				<div
					role="status"
					className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
						status.type === 'success'
							? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300'
							: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300'
					}`}>
					{status.type === 'success' ? (
						<CheckCircle2 size={18} />
					) : (
						<AlertCircle size={18} />
					)}
					{status.message}
				</div>
			)}

			<Section
				title="দোকানের তথ্য"
				description="কাস্টমারদের কাছে প্রদর্শিত মূল তথ্য ও যোগাযোগের মাধ্যম"
				icon={Store}>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field
						label="সাইটের নাম"
						value={settings.store.site_name}
						onChange={(v) => update('store.site_name', v)}
					/>
					<Field
						label="সাইটের নাম বাংলা"
						value={settings.store.site_name_bn}
						onChange={(v) => update('store.site_name_bn', v)}
					/>
					<Field
						label="স্লোগান"
						value={settings.store.tagline}
						onChange={(v) => update('store.tagline', v)}
					/>
					<Field
						label="ফোন নম্বর"
						value={settings.store.phone}
						onChange={(v) => update('store.phone', v)}
					/>
					<Field
						label="WhatsApp নম্বর"
						value={settings.store.whatsapp}
						onChange={(v) => update('store.whatsapp', v)}
					/>
					<Field
						label="সাপোর্ট ইমেইল"
						type="email"
						value={settings.store.email}
						onChange={(v) => update('store.email', v)}
					/>
					<Field
						label="ওয়েবসাইট URL"
						value={settings.store.website}
						onChange={(v) => update('store.website', v)}
					/>
					<div className="sm:col-span-2">
						<Field
							label="ঠিকানা"
							value={settings.store.address}
							onChange={(v) => update('store.address', v)}
						/>
					</div>
					<Field
						label="Facebook URL"
						value={settings.store.facebook}
						onChange={(v) => update('store.facebook', v)}
					/>
					<Field
						label="Instagram URL"
						value={settings.store.instagram}
						onChange={(v) => update('store.instagram', v)}
					/>
					<Field
						label="YouTube URL"
						value={settings.store.youtube}
						onChange={(v) => update('store.youtube', v)}
					/>
					<Field
						label="TikTok URL"
						value={settings.store.tiktok}
						onChange={(v) => update('store.tiktok', v)}
					/>
				</div>
			</Section>

			<Section
				title="অর্ডার সেটিংস"
				description="অর্ডার নেওয়া ও স্টক যাচাইয়ের নিয়ম"
				icon={Settings2}>
				<div className="grid gap-4 sm:grid-cols-2">
					<Field
						label="সর্বনিম্ন অর্ডার মূল্য (৳)"
						type="number"
						value={settings.order.minimumOrder}
						onChange={(v) => update('order.minimumOrder', v)}
					/>
					<Field
						label="অর্ডার নম্বরের Prefix"
						value={settings.order.orderPrefix}
						onChange={(v) => update('order.orderPrefix', v)}
					/>
				</div>
				<div className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
					<Toggle
						label="অর্ডার গ্রহণ চালু"
						checked={settings.order.enableOrders}
						onChange={(v) => update('order.enableOrders', v)}
					/>
					<Toggle
						label="Guest Checkout"
						description="অ্যাকাউন্ট ছাড়াই অর্ডার করতে পারবে"
						checked={settings.order.allowGuestCheckout}
						onChange={(v) => update('order.allowGuestCheckout', v)}
					/>
					<Toggle
						label="অর্ডারের সময় স্টক যাচাই"
						checked={settings.order.stockCheck}
						onChange={(v) => update('order.stockCheck', v)}
					/>
					<Toggle
						label="অর্ডার স্বয়ংক্রিয়ভাবে Confirm"
						checked={settings.order.autoConfirmOrders}
						onChange={(v) => update('order.autoConfirmOrders', v)}
					/>
				</div>
			</Section>

			<Section
				title="ডেলিভারি চার্জ"
				description="প্রতিটি এলাকার ডেলিভারি চার্জ ও ফ্রি ডেলিভারির সীমা"
				icon={Truck}>
				<Toggle
					label="ডেলিভারি চালু"
					checked={settings.delivery.enabled}
					onChange={(v) => update('delivery.enabled', v)}
				/>
				<div className="mt-3 grid gap-4 sm:grid-cols-2">
					<Field
						label="এই টাকার অর্ডারে ফ্রি ডেলিভারি (৳)"
						type="number"
						value={settings.delivery.freeDeliveryAbove}
						onChange={(v) =>
							update('delivery.freeDeliveryAbove', v)
						}
					/>
					<Field
						label="আনুমানিক ডেলিভারি সময়"
						value={settings.delivery.estimatedDays}
						onChange={(v) => update('delivery.estimatedDays', v)}
					/>
				</div>

				<div className="mt-5 space-y-4">
					{[
						['madhupur', 'মধুপুর'],
						['dhaka', 'ঢাকা'],
						['tangail', 'টাঙ্গাইল (মধুপুর ছাড়া)'],
						['outside', 'অন্যান্য এলাকা'],
					].map(([key, label]) => (
						<div
							key={key}
							className="rounded-lg border border-gray-100 p-4 dark:border-gray-800">
							<div className="mb-3 flex items-center justify-between gap-3">
								<p className="text-sm font-semibold">{label}</p>
								<Toggle
									label="চালু"
									checked={settings.delivery[key].enabled}
									onChange={(v) =>
										update(`delivery.${key}.enabled`, v)
									}
								/>
							</div>
							<Field
								label="ডেলিভারি চার্জ (৳)"
								type="number"
								value={settings.delivery[key].charge}
								onChange={(v) =>
									update(`delivery.${key}.charge`, v)
								}
							/>
						</div>
					))}
				</div>
			</Section>

			<Section
				title="পেমেন্ট"
				description="কাস্টমারদের জন্য যেসব পেমেন্ট পদ্ধতি চালু থাকবে"
				icon={CreditCard}>
				<div className="space-y-3 divide-y divide-gray-100 dark:divide-gray-800">
					<Toggle
						label="Cash on Delivery (COD)"
						checked={settings.payment.cod.enabled}
						onChange={(v) => update('payment.cod.enabled', v)}
					/>
					<div className="pt-3">
						<Toggle
							label="bKash চালু"
							checked={settings.payment.bkash.enabled}
							onChange={(v) => update('payment.bkash.enabled', v)}
						/>
						<div className="grid gap-4 pb-3 sm:grid-cols-2">
							<Field
								label="bKash নম্বর"
								value={settings.payment.bkash.number}
								onChange={(v) =>
									update('payment.bkash.number', v)
								}
							/>
							<label className="block">
								<span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
									bKash অ্যাকাউন্টের ধরন
								</span>
								<select
									className={inputClass}
									value={settings.payment.bkash.type}
									onChange={(e) =>
										update(
											'payment.bkash.type',
											e.target.value
										)
									}>
									<option value="Personal">Personal</option>
									<option value="Merchant">Merchant</option>
								</select>
							</label>
						</div>
					</div>
					<div className="pt-3">
						<Toggle
							label="Nagad চালু"
							checked={settings.payment.nagad.enabled}
							onChange={(v) => update('payment.nagad.enabled', v)}
						/>
						<div className="grid gap-4 pb-3 sm:grid-cols-2">
							<Field
								label="Nagad নম্বর"
								value={settings.payment.nagad.number}
								onChange={(v) =>
									update('payment.nagad.number', v)
								}
							/>
							<label className="block">
								<span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
									Nagad অ্যাকাউন্টের ধরন
								</span>
								<select
									className={inputClass}
									value={settings.payment.nagad.type}
									onChange={(e) =>
										update(
											'payment.nagad.type',
											e.target.value
										)
									}>
									<option value="Personal">Personal</option>
									<option value="Merchant">Merchant</option>
								</select>
							</label>
						</div>
					</div>
				</div>
			</Section>

			<Section
				title="ইনভয়েস"
				description="অর্ডারের ইনভয়েসে কী কী তথ্য দেখানো হবে"
				icon={FileText}>
				<div className="divide-y divide-gray-100 dark:divide-gray-800">
					<Toggle
						label="ইনভয়েস চালু"
						checked={settings.invoice.enabled}
						onChange={(v) => update('invoice.enabled', v)}
					/>
					<Toggle
						label="লোগো দেখান"
						checked={settings.invoice.showLogo}
						onChange={(v) => update('invoice.showLogo', v)}
					/>
					<Toggle
						label="ফোন নম্বর দেখান"
						checked={settings.invoice.showPhone}
						onChange={(v) => update('invoice.showPhone', v)}
					/>
					<Toggle
						label="ঠিকানা দেখান"
						checked={settings.invoice.showAddress}
						onChange={(v) => update('invoice.showAddress', v)}
					/>
				</div>
				<div className="mt-4">
					<Field
						label="ইনভয়েসের নিচের লেখা"
						value={settings.invoice.footerText}
						onChange={(v) => update('invoice.footerText', v)}
					/>
				</div>
			</Section>

			<Section
				title="SEO সেটিংস"
				description="সার্চ ইঞ্জিনে ওয়েবসাইটের পরিচিতি"
				icon={Search}>
				<div className="space-y-4">
					<Field
						label="Meta Title"
						value={settings.seo.title}
						onChange={(v) => update('seo.title', v)}
					/>
					<label className="block">
						<span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
							Meta Description
						</span>
						<textarea
							className={inputClass}
							rows={3}
							value={settings.seo.description}
							onChange={(e) =>
								update('seo.description', e.target.value)
							}
						/>
					</label>
					<label className="block">
						<span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
							Keywords
						</span>
						<textarea
							className={inputClass}
							rows={2}
							value={settings.seo.keywords}
							onChange={(e) =>
								update('seo.keywords', e.target.value)
							}
						/>
					</label>
					<Field
						label="Open Graph Image URL"
						value={settings.seo.ogImage}
						onChange={(v) => update('seo.ogImage', v)}
					/>
					<Field
						label="Google Site Verification Code"
						value={settings.seo.googleVerification}
						onChange={(v) => update('seo.googleVerification', v)}
					/>
				</div>
			</Section>

			<Section
				title="সিস্টেম"
				description="ওয়েবসাইট রক্ষণাবেক্ষণ সংক্রান্ত সেটিংস"
				icon={Settings2}>
				<Toggle
					label="Maintenance Mode"
					description="চালু করলে সাইটের public pages-এ maintenance ব্যবস্থা কার্যকর করতে হবে।"
					checked={settings.system.maintenanceMode}
					onChange={(v) => update('system.maintenanceMode', v)}
				/>
				<div className="mt-3">
					<label className="block">
						<span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
							Maintenance Message
						</span>
						<textarea
							className={inputClass}
							rows={2}
							value={settings.system.showMaintenanceMessage}
							onChange={(e) =>
								update(
									'system.showMaintenanceMessage',
									e.target.value
								)
							}
						/>
					</label>
				</div>
			</Section>

			<div className="flex justify-end pb-4">
				<button
					type="submit"
					disabled={saving}
					className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">
					<Save size={17} />
					{saving ? 'সেভ হচ্ছে...' : 'Save All Settings'}
				</button>
			</div>
		</form>
	);
}
