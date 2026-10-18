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
            dispatch(setSidebar(window.innerWidth >= 768));
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [dispatch]);

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <UserSidebar />

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