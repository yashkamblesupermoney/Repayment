import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { routeChange } from '../../store/preloaderSlice';
import mintwalkQR from '../../assets/img/mintwalk_payment_qr.png';

interface RepaymentInfo {
    clientName: string;
    accNo: string;
    ifscCode: string;
    bankName: string;
    accType: string;
}
declare global {
    interface Window {
        JSBridge?: {
            call: (phoneNumber: string) => void;
        };
    }
}

const PaymentOption: React.FC = () => {
    const dispatch = useDispatch();
    const [height, setHeight] = useState<number>(700);
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
    const [repaymentInfo, setRepaymentInfo] = useState<RepaymentInfo | undefined>();
    const [lenderName, setLenderName] = useState<string>('');

    const companyName = useSelector((state: any) => state.preloader.companyName);
    const mobile = '9920111300';
    const mobile1 = '02269516677';

    useEffect(() => {
        // dispatch(routeChange('end'));
        setHeight(document.documentElement.clientHeight);
        fetchApplicationId();
    }, []);

    const fetchApplicationId = async () => {
        dispatch(routeChange('start'));
        try {
            const response = await axios.post('/supermoney-service/customer/application/get/v2', {
                customerId: new URLSearchParams(window.location.search).get('customerId'),
                applicationId: new URLSearchParams(window.location.search).get('applicationId'),
            });
            const data = response.data;
            const name = data.getCustomerApplicationResponseList[0].programLenderResp.lenderName;
            setLenderName(name);
            fetchRepaymentInfo();
        } catch (error) {
            console.error('Error fetching application ID:', error);
        } finally {
            dispatch(routeChange('end'));
        }
    };

    const fetchRepaymentInfo = async () => {
        dispatch(routeChange('start'));
        try {
            const response = await axios.post(
                'https://livegateway.supermoney.in/supermoney-service/repayment/bank/get',
                {
                    applicationId: new URLSearchParams(window.location.search).get('applicationId'),
                }
            );
            setRepaymentInfo(response.data);
        } catch (error) {
            console.error('Error fetching repayment info:', error);
            setAlertMessage('Failed to load repayment details.');
            setAlertVisible(true);
        } finally {
            dispatch(routeChange('end'));
        }
    };

    const dial = (number: string) => {
        if (window.JSBridge && typeof window.JSBridge.call === 'function') {
            window.JSBridge.call(number);
        } else {
            window.open(`tel:${number}`, '_self');
        }
    };

    return (
        <div
            className="bg-[#f5f5f5] font-montserrat text-left px-7 pb-[100px] max-w-[450px] mx-auto"
            style={{ minHeight: `${height}px` }}
        >
            {alertVisible && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    {alertMessage}
                </div>
            )}

            <div className="mt-9 flex items-center">
                <span
                    className="text-black opacity-90 cursor-pointer mr-2"
                    onClick={() => window.history.back()}
                >
                    {`<`}
                </span>
                <div
                    className="text-[#4328ae] text-[16px] font-medium cursor-pointer"
                    onClick={() => window.history.back()}
                >
                    <b>{lenderName}</b>
                </div>
            </div>

            {repaymentInfo ? (
                <div className="mt-4 text-[12px]">
                    <div className="text-[#5927e7] text-[14px] font-bold mb-2">
                        Bank Account Details
                    </div>
                    {[
                        ['Name', repaymentInfo.clientName],
                        ['Account No', repaymentInfo.accNo],
                        ['IFSC Code', repaymentInfo.ifscCode],
                        ['Bank', repaymentInfo.bankName],
                        ['Account Type', repaymentInfo.accType],
                    ].map(([label, value]) => (
                        <div className="flex mb-1" key={label}>
                            <div className="w-1/3">{label}</div>
                            <div className="w-2/3 font-bold">{value}</div>
                        </div>
                    ))}
                </div>
            ) : lenderName === 'MINTWALK' ? (
                <div className="mt-4 text-[12px]">
                    <div className="text-[#5927e7] text-[14px] font-bold mb-2">
                        Bank Account Details
                    </div>
                    {[
                        ['Name', 'GETCLARITY FINTECH SERVICES PVT LTD'],
                        ['Account No', '007881300004195'],
                        ['IFSC Code', 'YESB0000078'],
                        ['Bank', 'Yes Bank'],
                        ['Account Type', 'Current'],
                    ].map(([label, value]) => (
                        <div className="flex mb-1" key={label}>
                            <div className="w-1/3">{label}</div>
                            <div className="w-2/3 font-bold">{value}</div>
                        </div>
                    ))}

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex-grow border-t border-gray-400"></div>
                        <div className="mx-2 text-center font-bold">OR</div>
                        <div className="flex-grow border-t border-gray-400"></div>
                    </div>

                    <div className="mt-4">
                        <div className="text-[#5927e7] text-[14px] font-bold mb-2">UPI QR Code</div>
                        <img src={mintwalkQR} alt="QR Code" className="w-full mt-2" />
                    </div>
                </div>
            ) : (
                <div className="mt-4 bg-white rounded-[16px] shadow-md min-h-[180px] flex flex-col items-center justify-center p-4">
                    <div className="text-[#4328ae] text-[16px] font-semibold mb-3 text-center">
                        Repayment Details Not Available
                    </div>
                    <button
                        onClick={() => dial(companyName === 'NETMEDS' || companyName === 'JIOMART' ? mobile1 : mobile)}
                        className="bg-[#4328ae] text-white rounded-[8px] px-4 py-2 mt-4 flex items-center"
                    >
                        📞 <span className="ml-2 capitalize">Call</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaymentOption;
