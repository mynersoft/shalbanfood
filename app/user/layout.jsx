
'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setSidebar } from '@/redux/store/slices/uiSlice';
import UserHeader from '@/components/user/UserHeader';
import UserSidebar from '@/components/user/UserSidebar';
import AuthGuard from '@/components/auth/AuthGuard';

const Layout = ({ children }) => {
    const dispatch = useDispatch();
    const { sidebarOpen } = useSelector((state) => state.ui);

    useEffect(() => {
        const handleResize = () => {
            // Desktop: sidebar open by default
            // Mobile: sidebar closed by default
            dispatch(setSidebar(window.innerWidth >= 768));
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [dispatch]);

    const closeMobileSidebar = () => {
        dispatch(setSidebar(false));
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Close sidebar"
                        onClick={closeMobileSidebar}
                        className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    />
                )}

                {/* Sidebar */}
                <div
                    className={`
                        fixed inset-y-0 left-0 z-50
                        transition-transform duration-300 ease-in-out
                        ${
                            sidebarOpen
                                ? 'translate-x-0'
                                : '-translate-x-full'
                        }
                        md:translate-x-0
                    `}
                >
                    <UserSidebar />
                </div>

                {/* Main Content */}
                <main
                    className={`
                        min-h-screen min-w-0
                        transition-[margin] duration-300
                        ml-0
                        ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}
                    `}
                >
                    <div className="mx-auto w-full max-w-[1600px] p-3 sm:p-5 lg:p-6">
                        <UserHeader />

                        <div className="mt-4 sm:mt-6">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
};

export default Layout;
