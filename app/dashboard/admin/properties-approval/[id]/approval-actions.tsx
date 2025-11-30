"use client";

import { approveProperty, rejectProperty } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function ApprovalActions({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleApprove = async () => {
        if (!confirm(`Approve "${propertyTitle}"? This will make it visible to students.`)) return;
        
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            console.log("Calling approveProperty with ID:", propertyId);
            const result = await approveProperty(propertyId);
            console.log("Result from approveProperty:", result);
            
            if (result?.error) {
                setError(result.error);
                console.error("Error from server:", result.error);
            } else if (result?.success) {
                setSuccessMessage(`✅ Property "${propertyTitle}" has been approved!`);
                setTimeout(() => {
                    console.log("Redirecting to properties list...");
                    router.push('/dashboard/admin/properties-approval');
                }, 2000);
            } else {
                console.warn("Unexpected result:", result);
                setError("Unexpected response from server");
            }
        } catch (err: any) {
            console.error("Exception caught:", err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!confirm(`Reject "${propertyTitle}"? The landlord will be notified to resubmit.`)) return;
        
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const result = await rejectProperty(propertyId);
            
            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                setSuccessMessage(`❌ Property "${propertyTitle}" has been rejected!`);
                setTimeout(() => router.push('/dashboard/admin/properties-approval'), 2000);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl sticky top-32 space-y-6">
            <h3 className="text-xl font-bold text-white">Admin Actions</h3>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm animate-pulse">
                    {successMessage}
                </div>
            )}

            {/* Approve Button */}
            <button
                onClick={handleApprove}
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                {loading ? (
                    <>
                        <Loader size={20} className="animate-spin" />
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                        <CheckCircle size={20} />
                        <span>✅ Approve Property</span>
                    </>
                )}
            </button>

            {/* Reject Button */}
            <button
                onClick={handleReject}
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:from-red-500 hover:to-rose-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                {loading ? (
                    <>
                        <Loader size={20} className="animate-spin" />
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                        <XCircle size={20} />
                        <span>❌ Reject Property</span>
                    </>
                )}
            </button>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-300 text-sm">
                    <strong>Note:</strong> Once approved, this property will be visible to students and is_available will be set to true.
                </p>
            </div>
        </div>
    );
}
