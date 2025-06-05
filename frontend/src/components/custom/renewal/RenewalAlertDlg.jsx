import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const RenewalAlertDlg = ({ isOpen, setIsOpen }) => {
    const hospital = useSelector((state) => state.hospital.hospitalInfo);
    const timeline = hospital?.subscriptionTimeline || [];
    const navigate = useNavigate();

    // Calculate subscription status (daysLeft and extraDays)
    const calculateSubscriptionStatus = () => {
        if (!hospital?.renewalDate) return { daysLeft: 0, isExpired: true, extraDays: 0 };

        const today = new Date();
        const renewal = new Date(hospital.renewalDate);
        // Set hours, minutes, seconds, and milliseconds to 0 for accurate day comparison
        today.setHours(0, 0, 0, 0);
        renewal.setHours(0, 0, 0, 0);
        const diffTime = renewal.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
            daysLeft,
            isExpired: daysLeft < 0,
            extraDays: daysLeft < 0 ? Math.abs(daysLeft) : 0
        };
    };

    const { daysLeft, extraDays } = calculateSubscriptionStatus();

    // Helper functions for timeline
    const getTimelineIcon = (type) => {
        switch (type) {
            case 'install':
                return '✓';
            case 'trial':
                return '📅';
            case 'payment':
                return '💳';
            default:
                return '•';
        }
    };

    const getTimelineColor = (type) => {
        switch (type) {
            case 'install':
                return 'bg-green-500';
            case 'trial':
                return 'bg-blue-500';
            case 'payment':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusColor = () => {
        if (daysLeft < 0) return 'bg-red-500';
        if (daysLeft <= 7) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-red-600">Subscription Renewal Alert</DialogTitle>
                    <DialogDescription className="mt-4">
                        {daysLeft < 0 ? (
                            <div className="space-y-2">
                                <p className="text-red-600 font-semibold">Your 30 days trial period has ended!</p>
                            </div>
                        ) : (
                            `Your subscription will expire in ${daysLeft} days. Renew now to avoid service interruption.`
                        )}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="bg-red-50 p-2 rounded-lg border-2 border-red-200">
                                <h4 className="font-bold text-red-800 text-lg mb-3">⚠️ Important Notice</h4>
                                <p className="text-red-700 mb-4 text-sm">
                                    Your hospital management services will be discontinued if the subscription is not extended. This may result in:
                                </p>
                                <ul className="list-disc list-inside text-red-600 space-y-2 ml-2 text-sm">
                                    <li>Loss of access to patient records</li>
                                    <li>Interruption in IPD & OPD services</li>
                                    <li>Discontinuation of billing services</li>
                                    <li>Suspension of all premium features</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 p-2 rounded-lg border-2 border-blue-200">
                                <h4 className="font-bold text-blue-800 text-lg mb-3">📞 Contact for Renewal</h4>
                                <p className="text-blue-700 mb-2 text-sm">
                                    Please contact our support team to extend your plan:
                                </p>
                                <p className="font-semibold text-blue-900 mb-1">
                                    +91 9942000425
                                </p>
                                <p className="text-sm text-blue-600">
                                    Our team is available 24/7 to assist you with the renewal process
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h4 className="font-bold text-gray-800 text-lg mb-6">📋 Subscription Timeline</h4>
                            
                            <div className="relative">
                                <div className="absolute left-[45px] top-0 h-full w-0.5 bg-gray-300"></div>

                                {timeline.map((event, index) => (
                                    <div key={index} className="flex items-start mb-4 relative">
                                        <div className={`flex items-center justify-center w-[24px] h-[24px] rounded-full text-white relative z-10 ${getTimelineColor(event.type)}`}>
                                            {getTimelineIcon(event.type)}
                                        </div>
                                        <div className="ml-8">
                                            <h5 className="font-semibold text-gray-800">{event.event}</h5>
                                            <p className="text-sm text-gray-600">
                                                {new Date(event.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">{event.description}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Current Status */}
                                <div className="flex items-start relative">
                                    <div className={`flex items-center justify-center w-[24px] h-[24px] rounded-full text-white relative z-10 ${getStatusColor()}`}>
                                        {daysLeft < 0 ? '⚠️' : '✓'}
                                    </div>
                                    <div className="ml-8">
                                        <h5 className="font-semibold text-gray-800">Current Status</h5>
                                        <p className={`text-sm font-medium ${daysLeft < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {daysLeft < 0 
                                                ? `${extraDays} days overdue` 
                                                : `${daysLeft} days remaining`}
                                        </p>
                                        <div className="flex items-center mt-1 space-x-2">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                                daysLeft < 0 
                                                    ? 'bg-red-100 text-red-700' 
                                                    : daysLeft <= 7 
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                            }`}>
                                                {daysLeft < 0 ? 'Expired' : daysLeft <= 7 ? 'Expiring Soon' : 'Active'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {hospital?.planType || 'Trial'} subscription
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Current Plan: <span className="font-semibold">{hospital?.planType || 'Trial'}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className=" bg-red-50 border border-red-200 rounded-md p-3">
                    {daysLeft < 0 && hospital?.discontinuedDaysLeft >= 0 && (
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Service Discontinuation Notice</h3>
                                <div className="mt-1 text-sm text-red-700">
                                    <p>Services will be discontinued in <strong>{hospital?.discontinuedDaysLeft === 0 ? 'today' : hospital?.discontinuedDaysLeft + ' days'}</strong>.</p>
                                    <p className="text-xs mt-1">Please renew your subscription to avoid service interruption.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {daysLeft < 0 && hospital?.discontinuedDaysLeft < 0 && (
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Service Discontinuation Notice</h3>
                                <div className="mt-1 text-sm text-red-700">
                                    <p>All services have been stopped.</p>
                                    <p className="text-xs mt-1">Please renew your subscription immediately to restore access.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="mt-0">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => {
                            navigate("/settings/subscription");
                            setIsOpen(false);
                        }}
                    >
                        Details
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RenewalAlertDlg;
