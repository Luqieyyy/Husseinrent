'use client';

import { useState } from 'react';
import { approveProperty, rejectProperty, deleteProperty } from '@/app/actions/admin';
import { CheckCircle, XCircle, Trash2, Eye, FileText, Phone, Mail, Zap, Droplet, User } from 'lucide-react';
import Link from 'next/link';

interface PropertyManagementCardProps {
    property: any;
}

export default function PropertyManagementCard({ property }: PropertyManagementCardProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleApprove = async () => {
        setIsProcessing(true);
        const result = await approveProperty(property.id.toString());
        if (result.error) {
            alert(`Error: ${result.error}`);
        }
        setIsProcessing(false);
    };

    const handleReject = async () => {
        setIsProcessing(true);
        const result = await rejectProperty(property.id.toString());
        if (result.error) {
            alert(`Error: ${result.error}`);
        }
        setIsProcessing(false);
    };

    const handleDelete = async () => {
        setIsProcessing(true);
        const result = await deleteProperty(property.id.toString());
        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            alert('Property deleted successfully');
        }
        setIsProcessing(false);
        setShowDeleteConfirm(false);
    };

    const statusColors = {
        pending: 'bg-yellow-900/30 border-yellow-700 text-yellow-300',
        approved: 'bg-green-900/30 border-green-700 text-green-300',
        rejected: 'bg-red-900/30 border-red-700 text-red-300',
    };

    return (
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition shadow-xl">
            {/* Property Image */}
            <div className="relative h-48 bg-gray-800">
                {property.image_url ? (
                    <img 
                        src={property.image_url} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        No Image
                    </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${statusColors[property.status as keyof typeof statusColors]}`}>
                        {property.status}
                    </span>
                </div>
            </div>

            {/* Property Info */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{property.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{property.location}</p>

                {/* Price & Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-800">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Monthly Price</p>
                        <p className="text-lg font-bold text-indigo-400">RM {property.price_per_month}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Rooms</p>
                        <p className="text-lg font-bold text-white">{property.number_of_rooms}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Gender Preference</p>
                        <p className="text-sm font-semibold text-purple-400 capitalize">{property.gender_preference || 'Any'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Available</p>
                        <p className="text-sm font-semibold text-white">{property.is_available ? '✓ Yes' : '✗ No'}</p>
                    </div>
                </div>

                {/* Landlord Information */}
                <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Landlord Information</p>
                    <div className="space-y-2">
                        <div className="flex items-center text-sm">
                            <User className="w-4 h-4 mr-2 text-indigo-400" />
                            <span className="text-white font-medium">{property.profiles?.full_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2 text-green-400" />
                            <span className="text-gray-300">{property.profiles?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 mr-2 text-blue-400" />
                            <span className="text-gray-300 truncate">{property.profiles?.email || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Verification Documents */}
                <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">Verification Documents</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-purple-400" />
                                Grant Number
                            </span>
                            <span className="text-white font-mono">{property.grant_number || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-green-400" />
                                WhatsApp
                            </span>
                            <span className="text-white font-mono">{property.whatsapp_number || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 flex items-center">
                                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                                Electric Bill
                            </span>
                            <span className="text-white font-mono">{property.electricity_bill_account || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 flex items-center">
                                <Droplet className="w-4 h-4 mr-2 text-blue-400" />
                                Water Bill
                            </span>
                            <span className="text-white font-mono">{property.water_bill_account || 'N/A'}</span>
                        </div>
                        {property.verification_proof && (
                            <a 
                                href={property.verification_proof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-indigo-400 hover:text-indigo-300 transition"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Proof Document
                            </a>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    {/* View Property Detail */}
                    <Link
                        href={`/dashboard/admin/properties-approval/${property.id}`}
                        className="w-full px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-xl transition flex items-center justify-center"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Details
                    </Link>

                    {/* Status Change Buttons - Only for pending and rejected */}
                    {property.status === 'pending' && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {isProcessing ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isProcessing}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                {isProcessing ? 'Processing...' : 'Reject'}
                            </button>
                        </div>
                    )}

                    {/* Re-approve button for rejected properties */}
                    {property.status === 'rejected' && (
                        <button
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {isProcessing ? 'Processing...' : 'Re-Approve'}
                        </button>
                    )}

                    {/* Re-reject button for approved properties */}
                    {property.status === 'approved' && (
                        <button
                            onClick={handleReject}
                            disabled={isProcessing}
                            className="w-full px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            {isProcessing ? 'Processing...' : 'Revoke Approval'}
                        </button>
                    )}

                    {/* Delete Button - Always available */}
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full px-4 py-2.5 bg-red-900/50 border border-red-700 hover:bg-red-900/70 text-red-300 text-sm font-medium rounded-xl transition flex items-center justify-center"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Property
                        </button>
                    ) : (
                        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
                            <p className="text-red-300 text-sm mb-3 font-semibold">⚠️ Are you sure? This cannot be undone!</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={isProcessing}
                                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition disabled:opacity-50"
                                >
                                    {isProcessing ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
