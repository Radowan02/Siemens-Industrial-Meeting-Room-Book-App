"use client"
import { useRouter } from 'next/navigation';

export default function PermissionDenied() {
    const router = useRouter();

    const redirectToDashboard = () => {
        router.push('/dashboard');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Permission Denied</h1>
                <p className="text-lg text-gray-700 mb-6">
                    You do not have permission to access this page.
                </p>
                <button
                    onClick={redirectToDashboard}
                    className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300 transform hover:scale-105 focus:outline-none"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}
