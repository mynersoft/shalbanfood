'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function MaintenanceToast() {
    useEffect(() => {
        const key = 'shalban-maintenance-toast-shown';

        // একই ব্রাউজারে একবার দেখাবে
        if (sessionStorage.getItem(key)) return;

        const timer = setTimeout(() => {
            toast(
                (t) => (
                    <div style={{
                        width: '100%',
                        maxWidth: '340px',
                        color: '#222',
                    }}>
                        <strong style={{
                            display: 'block',
                            fontSize: '16px',
                            marginBottom: '8px',
                        }}>
                            শালবন ফুড
                        </strong>

                        <p style={{
                            margin: '0 0 10px',
                            fontSize: '14px',
                            lineHeight: '1.7',
                        }}>
                            আমাদের ওয়েবসাইটের কাজ চলমান রয়েছে।
                            সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে
                            দুঃখিত।
                        </p>

                        <p style={{
                            margin: '0 0 12px',
                            fontSize: '14px',
                        }}>
                            কোনো সমস্যা হলে WhatsApp-এ যোগাযোগ করুন।
                        </p>

                        <a
                            href="https://wa.me/8801603816721"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => toast.dismiss(t.id)}
                            style={{
                                display: 'inline-block',
                                background: '#16a34a',
                                color: '#fff',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                            }}
                        >
                            WhatsApp: 01603816721
                        </a>
                    </div>
                ),
                {
                    duration: 5000,
                    position: 'top-center',
                    style: {
                        padding: '16px',
                        borderRadius: '12px',
                        maxWidth: 'calc(100vw - 24px)',
                    },
                }
            );

            sessionStorage.setItem(key, 'true');
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return null;
}