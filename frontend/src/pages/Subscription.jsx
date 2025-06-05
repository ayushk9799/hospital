import React from 'react';
import { Button } from "../components/ui/button";
import { useSelector } from 'react-redux';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
    const { hospitalInfo } = useSelector((state) => state.hospital);
    const timeline = hospitalInfo?.subscriptionTimeline || [];
    const paymentHistory = hospitalInfo?.paymentData || [];
    const navigate = useNavigate();

    // Calculate subscription status
    const calculateSubscriptionStatus = () => {
        if (!hospitalInfo?.renewalDate) return { daysLeft: 0, isExpired: true, extraDays: 0 };

        const today = new Date();
        const renewalDate = new Date(hospitalInfo.renewalDate);
        const diffTime = renewalDate - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
            daysLeft,
            isExpired: daysLeft < 0,
            extraDays: daysLeft < 0 ? Math.abs(daysLeft) : 0
        };
    };

    const { daysLeft, isExpired, extraDays } = calculateSubscriptionStatus();

    const getStatusColor = () => {
        if (isExpired) return 'bg-red-500';
        if (daysLeft <= 7) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const discontinuedDaysLeft = hospitalInfo?.discontinuedDaysLeft;

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

    return (
        <div className="p-4 max-w-[1200px] mx-auto">
           <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold">Subscription</h1>
      </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timeline Column */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 text-lg mb-6">📋 Subscription Timeline</h4>
                    
                    <div className="relative">
                        <div className="absolute left-[45px] top-0 h-full w-0.5 bg-gray-300"></div>

                        {timeline.map((event, index) => (
                            <div key={index} className="flex items-start mb-8 relative">
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

                        <div className="flex items-start relative">
                            <div className={`flex items-center justify-center w-[24px] h-[24px] rounded-full text-white relative z-10 ${getStatusColor()}`}>
                                {isExpired ? '⚠️' : '✓'}
                            </div>
                            <div className="ml-8">
                                <h5 className="font-semibold text-gray-800">Current Status</h5>
                                <p className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                                    {isExpired 
                                        ? `${extraDays} days overdue` 
                                        : `${daysLeft} days remaining`}
                                </p>
                                <div className="flex items-center mt-1 space-x-2">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                        isExpired 
                                            ? 'bg-red-100 text-red-700' 
                                            : daysLeft <= 7 
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-green-100 text-green-700'
                                    }`}>
                                        {isExpired ? 'Expired' : daysLeft <= 7 ? 'Expiring Soon' : 'Active'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {hospitalInfo?.planType || 'Trial'} subscription
                                    </span>
                                </div>
                                {isExpired && discontinuedDaysLeft >= 0 && (
                                    <div className="mt-2">
                                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-red-800">Service Discontinuation Notice</h3>
                                                    <div className="mt-1 text-sm text-red-700">
                                                        <p>Services will be discontinued in <strong>{discontinuedDaysLeft}</strong> days.</p>
                                                        <p className="text-xs mt-1">Please renew your subscription to avoid service interruption.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Current Plan: <span className="font-semibold">{hospitalInfo?.planType || 'Trial'}</span></span>
                        </div>
                        {isExpired && hospitalInfo?.renewalDate && (
                            <div className="flex justify-between items-center text-sm mt-2">
                                <span className="text-gray-600">Renewal Date:</span>
                                <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                    {new Date(hospitalInfo.renewalDate).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {isExpired && hospitalInfo?.serviceDiscontinuedDate && (
                            <div className="flex justify-between items-center text-sm mt-2">
                                <span className="text-gray-600">Service Discontinuation Date:</span>
                                <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                    {new Date(hospitalInfo.serviceDiscontinuedDate).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment History Column */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 text-lg mb-6">💳 Payment History</h4>
                    
                    <div className="space-y-4">
                        {paymentHistory.map((payment, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 className="font-semibold text-gray-800">
                                            {payment.planType} Plan
                                        </h5>
                                        <p className="text-sm text-gray-500">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </p>
                                        {payment.remark && (
                                            <p className="text-xs text-gray-500">{payment.remark}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">
                                            ₹{payment.amount.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">{payment.method}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {paymentHistory.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No payment history available
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Total Paid:</span>
                            <span className="font-semibold">
                                ₹{paymentHistory.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;