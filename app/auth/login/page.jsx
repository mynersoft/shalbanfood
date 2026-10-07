import { Suspense } from 'react';
import LoginForm from './LoginForm';

function LoginLoading() {
    return (
        <main className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                    <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mx-auto mb-6" />
                    <div className="h-12 bg-gray-100 rounded-xl animate-pulse mb-4" />
                    <div className="h-12 bg-gray-100 rounded-xl animate-pulse mb-4" />
                    <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <LoginForm />
        </Suspense>
    );
}