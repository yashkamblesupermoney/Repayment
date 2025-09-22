/* need to write dial function*/

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { routeChange } from '../../store/preloaderSlice';
import axios from 'axios';
import moment from 'moment';
import { useNavigate, useLocation } from 'react-router-dom';
import InstallmentDetails from '../organism/IntsallmentDetails';
import CustomAmountPanel from '../organism/CustomAmountPanel';
import RepaymentSchedule from '../organism/RepaymentSchedule';


const Repayment: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [customAmount, setCustomAmount] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alert, setAlert] = useState(false);
    const [userDetails, setUserDetails] = useState({customerId: '', mobileNumber: ''})
    const [payNow, setPayNow] = useState(0);
    const [showPay, setShowPay] = useState(false);
    const [personalLoanList, setPersonalLoanList] = useState<any[]>([]);
    const [paymentList, setPaymentList] = useState<any[]>([]);
    const [transactionRefNo, setTransactionRefNo] = useState('');


    const dial = () => {
        const number = '9930111500';
        try {
            // @ts-ignore: JSBridge might be injected by native app
            JSBridge.call(number);
        } catch (err) {
            window.open(`tel:${number}`, '_self');
        }
    };

    const displayVal = async () => {
        dispatch(routeChange('start'))
        let self = this;

        const queryParams = new URLSearchParams(location.search);
        const rp = queryParams.get('rp');

        let url = "supermoney-service/payment/details/get/v4?rp=" + rp;
        axios
            .get(url, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then(function (response) {
                // handle success

                const JSONData = response.data;

                // self.loanList = [];
                // self.companyName = JSONData.companyName;
                // self.custID = JSONData.customerId;
                // self.mobileNo = JSONData.mobileNo;
                setUserDetails({customerId: JSONData?.customerId, mobileNumber: JSONData.mobileNo})
                getApplicationDetails(JSONData.customerId,JSONData.getPaymentDetails[0].applicationId);
                dispatch(routeChange('end'))
            })
            .catch(function (error) {
                // handle error
                console.log("display  ==" + error);
                navigate('/NoDue')
            })
            .finally(function () {
                // always executed
            });
    }

    const initializePayments = (loanData: any) => {
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() + 1);

        const filteredPayments = loanData.loanApplicationReferenceEmiData.map((item: any, index: number) => {
            const isPastDue = new Date(item.loanRepaymentDate) < currentDate;
            const checked = isPastDue;
            if (checked) setPayNow(prev => prev + item.loanEmiAmountAdjusted);
            return { ...item, position: index + 1, checked };
        });

        setPaymentList(filteredPayments);
        if (new Date(filteredPayments[0].loanRepaymentDate) < currentDate) {
            setShowPay(true);
        }
    };

    const getApplicationDetails = async (custID: string, appID: string) => {
        dispatch(routeChange('start'))

        let url = "supermoney-service/customer/application/get/v2";
        axios
            .post(
                url,
                {
                    customerId: custID,
                    applicationId: appID,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then(function (response) {
                // handle success

                const JSONData = response.data;
                const lenderName = JSONData.getCustomerApplicationResponseList[0].programLenderResp.lenderName;
                console.log(lenderName, "getApplicationDetails")
                dispatch(routeChange('start'))
            })
            .catch(function (error) {
                // handle error
                console.log("display  ==" + error);
                navigate('/noDue')
            })
            .finally(function () {
                // always executed
            });
    }

    const handleCheckboxChange = (index: number, checked: boolean) => {
        const amount = paymentList[index].loanEmiAmountAdjusted;
        setPayNow(prev => checked ? prev + amount : prev - amount);
        const updated = [...paymentList];
        updated[index].checked = checked;
        setPaymentList(updated);
    };

    const callPayment = async () => {
        if (payNow <= 0) return;
        dispatch(routeChange('start'));

        const loan = personalLoanList[0];
        const data = {
            applicationId: loan.applicationId,
            loanId: loan.loanApplicationReferenceNo,
            invoiceId: '',
            amount: payNow,
            cashBackAmount: 0,
            purpose: 'LOAN',
            medium: 'NEFT',
            paymentApp: 'NEFT',
            loginId: userDetails.mobileNumber,
            customerId: userDetails.customerId,
        };

        try {
            const response = await axios.post('supermoney-service/payment/attempt', data);
            dispatch(routeChange('end'));
            const { transactionRefNo } = response.data;
            setTransactionRefNo(transactionRefNo);
            navigate(`/Paymentoption?applicationId=${loan.applicationId}&customerId=${userDetails.customerId}`);
        } catch (error) {
            console.error('Payment error:', error);
            dispatch(routeChange('end'));
        }
    };

    const callPaymentCustom = async () => {
        const amount = Number(customAmount);
        if (amount < 100 || amount > payNow) {
            setAlert(true);
            setAlertMessage('Amount must be between ₹100 and total due.');
            return;
        }

        dispatch(routeChange('start'));
        const loan = personalLoanList[0];
        const data = {
            applicationId: loan.applicationId,
            loanId: loan.loanApplicationReferenceNo,
            invoiceId: '',
            amount,
            cashBackAmount: 0,
            purpose: 'LOAN',
            medium: 'NEFT',
            paymentApp: 'NEFT',
            loginId: userDetails.mobileNumber,
            customerId: userDetails.customerId,
        };

        try {
            const response = await axios.post('supermoney-service/payment/attempt', data);
            dispatch(routeChange('end'));
            const { transactionRefNo } = response.data;
            setTransactionRefNo(transactionRefNo);
            navigate(`/Paymentoption?applicationId=${loan.applicationId}&customerId=${userDetails.customerId}`);
        } catch (error) {
            console.error('Custom payment error:', error);
            dispatch(routeChange('end'));
        }
    };

    useEffect(() => {
        dispatch(routeChange('end'));
        const queryParams = new URLSearchParams(location.search);
        const loan = queryParams.get('loan');
        displayVal()
        if (loan) {
            const parsedLoan = JSON.parse(loan);
            setPersonalLoanList([parsedLoan]);
            initializePayments(parsedLoan);
        }
    }, []);

    return (
        <div className="bg-gray-100 px-7 pb-24 max-w-[450px] font-montserrat text-left min-h-screen">
            {alert && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    {alertMessage}
                </div>
            )}

            <div className="mt-9 flex">
                <button onClick={() => navigate(-1)} className="text-black opacity-90 ml-[-10px]">
                    ←
                </button>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-bold">Instalment Repayment</h2>
                <InstallmentDetails loan={personalLoanList[0]} />
                {showPay && (
                    <CustomAmountPanel
                        customAmount={customAmount}
                        setCustomAmount={setCustomAmount}
                        callPaymentCustom={callPaymentCustom}
                    />
                )}
                <RepaymentSchedule
                    paymentList={paymentList}
                    handleCheckboxChange={handleCheckboxChange}
                    callPayment={callPayment}
                    payNow={payNow}
                    dial={dial}
                />
            </div>
        </div>
    );
};

export default Repayment;
