// /* need to write dial function*/

// import React, { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { routeChange } from '../../store/preloaderSlice';
// import axios from 'axios';
// import moment from 'moment';
// import { useNavigate, useLocation } from 'react-router-dom';
// import InstallmentDetails from '../organism/IntsallmentDetails';
// import CustomAmountPanel from '../organism/CustomAmountPanel';
// import RepaymentSchedule from '../organism/RepaymentSchedule';


// const Repayment: React.FC = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const location = useLocation();

//     const [customAmount, setCustomAmount] = useState('');
//     const [alertMessage, setAlertMessage] = useState('');
//     const [alert, setAlert] = useState(false);
//     const [userDetails, setUserDetails] = useState({customerId: '', mobileNumber: ''})
//     const [payNow, setPayNow] = useState(0);
//     const [showPay, setShowPay] = useState(false);
//     const [personalLoanList, setPersonalLoanList] = useState<any[]>([]);
//     const [paymentList, setPaymentList] = useState<any[]>([]);
//     const [transactionRefNo, setTransactionRefNo] = useState('');


//     const dial = () => {
//         const number = '9930111500';
//         try {
//             // @ts-ignore: JSBridge might be injected by native app
//             JSBridge.call(number);
//         } catch (err) {
//             window.open(`tel:${number}`, '_self');
//         }
//     };

//     const displayVal = async () => {
//         dispatch(routeChange('start'))
//         let self = this;

//         const queryParams = new URLSearchParams(location.search);
//         const rp = queryParams.get('rp');

//         let url = "supermoney-service/payment/details/get/v4?rp=" + rp;
//         axios
//             .get(url, {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             })
//             .then(function (response) {
//                 // handle success

//                 const JSONData = response.data;

//                 // self.loanList = [];
//                 // self.companyName = JSONData.companyName;
//                 // self.custID = JSONData.customerId;
//                 // self.mobileNo = JSONData.mobileNo;
//                 setUserDetails({customerId: JSONData?.customerId, mobileNumber: JSONData.mobileNo})
//                 getApplicationDetails(JSONData.customerId,JSONData.getPaymentDetails[0].applicationId);
//                 dispatch(routeChange('end'))
//             })
//             .catch(function (error) {
//                 // handle error
//                 console.log("display  ==" + error);
//                 navigate('/NoDue')
//             })
//             .finally(function () {
//                 // always executed
//             });
//     }

//     const initializePayments = (loanData: any) => {
//         const currentDate = new Date();
//         currentDate.setMonth(currentDate.getMonth() + 1);

//         const filteredPayments = loanData.loanApplicationReferenceEmiData.map((item: any, index: number) => {
//             const isPastDue = new Date(item.loanRepaymentDate) < currentDate;
//             const checked = isPastDue;
//             if (checked) setPayNow(prev => prev + item.loanEmiAmountAdjusted);
//             return { ...item, position: index + 1, checked };
//         });

//         setPaymentList(filteredPayments);
//         if (new Date(filteredPayments[0].loanRepaymentDate) < currentDate) {
//             setShowPay(true);
//         }
//     };

//     const getApplicationDetails = async (custID: string, appID: string) => {
//         dispatch(routeChange('start'))

//         let url = "supermoney-service/customer/application/get/v2";
//         axios
//             .post(
//                 url,
//                 {
//                     customerId: custID,
//                     applicationId: appID,
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                 }
//             )
//             .then(function (response) {
//                 // handle success

//                 const JSONData = response.data;
//                 const lenderName = JSONData.getCustomerApplicationResponseList[0].programLenderResp.lenderName;
//                 console.log(lenderName, "getApplicationDetails")
//                 dispatch(routeChange('start'))
//             })
//             .catch(function (error) {
//                 // handle error
//                 console.log("display  ==" + error);
//                 navigate('/noDue')
//             })
//             .finally(function () {
//                 // always executed
//             });
//     }

//     const handleCheckboxChange = (index: number, checked: boolean) => {
//         const amount = paymentList[index].loanEmiAmountAdjusted;
//         setPayNow(prev => checked ? prev + amount : prev - amount);
//         const updated = [...paymentList];
//         updated[index].checked = checked;
//         setPaymentList(updated);
//     };

//     const callPayment = async () => {
//         if (payNow <= 0) return;
//         dispatch(routeChange('start'));

//         const loan = personalLoanList[0];
//         const data = {
//             applicationId: loan.applicationId,
//             loanId: loan.loanApplicationReferenceNo,
//             invoiceId: '',
//             amount: payNow,
//             cashBackAmount: 0,
//             purpose: 'LOAN',
//             medium: 'NEFT',
//             paymentApp: 'NEFT',
//             loginId: userDetails.mobileNumber,
//             customerId: userDetails.customerId,
//         };

//         try {
//             const response = await axios.post('supermoney-service/payment/attempt', data);
//             dispatch(routeChange('end'));
//             const { transactionRefNo } = response.data;
//             setTransactionRefNo(transactionRefNo);
//             navigate(`/Paymentoption?applicationId=${loan.applicationId}&customerId=${userDetails.customerId}`);
//         } catch (error) {
//             console.error('Payment error:', error);
//             dispatch(routeChange('end'));
//         }
//     };

//     const callPaymentCustom = async () => {
//         const amount = Number(customAmount);
//         if (amount < 100 || amount > payNow) {
//             setAlert(true);
//             setAlertMessage('Amount must be between ₹100 and total due.');
//             return;
//         }

//         dispatch(routeChange('start'));
//         const loan = personalLoanList[0];
//         const data = {
//             applicationId: loan.applicationId,
//             loanId: loan.loanApplicationReferenceNo,
//             invoiceId: '',
//             amount,
//             cashBackAmount: 0,
//             purpose: 'LOAN',
//             medium: 'NEFT',
//             paymentApp: 'NEFT',
//             loginId: userDetails.mobileNumber,
//             customerId: userDetails.customerId,
//         };

//         try {
//             const response = await axios.post('supermoney-service/payment/attempt', data);
//             dispatch(routeChange('end'));
//             const { transactionRefNo } = response.data;
//             setTransactionRefNo(transactionRefNo);
//             navigate(`/Paymentoption?applicationId=${loan.applicationId}&customerId=${userDetails.customerId}`);
//         } catch (error) {
//             console.error('Custom payment error:', error);
//             dispatch(routeChange('end'));
//         }
//     };

//     useEffect(() => {
//         dispatch(routeChange('end'));
//         const queryParams = new URLSearchParams(location.search);
//         const loan = queryParams.get('loan');
//         displayVal()
//         if (loan) {
//             const parsedLoan = JSON.parse(loan);
//             setPersonalLoanList([parsedLoan]);
//             initializePayments(parsedLoan);
//         }
//     }, []);

//     return (
//         <div className="bg-gray-100 px-7 pb-24 max-w-[450px] font-montserrat text-left min-h-screen">
//             {alert && (
//                 <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
//                     {alertMessage}
//                 </div>
//             )}

//             <div className="mt-9 flex">
//                 <button onClick={() => navigate(-1)} className="text-black opacity-90 ml-[-10px]">
//                     ←
//                 </button>
//             </div>

//             <div className="mt-6">
//                 <h2 className="text-xl font-bold">Instalment Repayment</h2>
//                 <InstallmentDetails loan={personalLoanList[0]} />
//                 {showPay && (
//                     <CustomAmountPanel
//                         customAmount={customAmount}
//                         setCustomAmount={setCustomAmount}
//                         callPaymentCustom={callPaymentCustom}
//                     />
//                 )}
//                 <RepaymentSchedule
//                     paymentList={paymentList}
//                     handleCheckboxChange={handleCheckboxChange}
//                     callPayment={callPayment}
//                     payNow={payNow}
//                     dial={dial}
//                 />
//             </div>
//         </div>
//     );
// };

// export default Repayment;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar, Phone } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { routeChange } from '../../store/preloaderSlice';

interface LoanEMIData {
    loanEmiAmountAdjusted: number;
    loanRepaymentDate: string;
    loanEmiAmount: number;
    position?: number;
    checked?: boolean;
}

interface Loan {
    loanApplicationReferenceNo: string;
    applicationId: string;
    loanAmount: number;
    interestOutstanding: number;
    penalCharge: number;
    loanApplicationReferenceEmiData: LoanEMIData[];
}

const Repayment: React.FC = () => {
    const [customAmount, setCustomAmount] = useState<string>('');
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [alert, setAlert] = useState<boolean>(false);
    const [height, setHeight] = useState<number>(700);
    const [statusSheet, setStatusSheet] = useState<boolean>(false);
    const [loanList, setLoanList] = useState<Loan[]>([]);
    const [personalLoanList, setPersonalLoanList] = useState<Loan[]>([]);
    const [paymentList, setPaymentList] = useState<LoanEMIData[]>([]);
    const [payNow, setPayNow] = useState<number>(0);
    const [showPay, setShowPay] = useState<boolean>(false);
    const [lenderName, setLenderName] = useState<string>('');
    const [companyName, setCompanyName] = useState<string>('');
    const [custID, setCustID] = useState<string>('');
    const [mobileNo, setMobileNo] = useState<string>('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        setHeight(document.documentElement.clientHeight);

        const queryParams = new URLSearchParams(window.location.search);
        const loanParam = queryParams.get('loan');

        if (loanParam) {
            try {
                const loanData: Loan = JSON.parse(loanParam);
                setPersonalLoanList([loanData]);

                const currentDate = new Date();
                const nextMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 1));

                const processedPaymentList: LoanEMIData[] = [];
                let totalPayNow = 0;
                let shouldShowPay = false;

                loanData.loanApplicationReferenceEmiData.forEach((item, index) => {
                    if (item.loanEmiAmountAdjusted > 0) {
                        const processedItem = {
                            ...item,
                            position: index + 1,
                            checked: new Date(item.loanRepaymentDate) < nextMonth
                        };

                        if (processedItem.checked) {
                            totalPayNow += item.loanEmiAmountAdjusted;
                        }

                        processedPaymentList.push(processedItem);

                        // Check if first payment is due
                        if (index === 0 && new Date(item.loanRepaymentDate) < nextMonth) {
                            shouldShowPay = true;
                        }
                    }
                });

                setPaymentList(processedPaymentList);
                setPayNow(totalPayNow);
                setShowPay(shouldShowPay);
                dispatch(routeChange('end'))
            } catch (error) {
                console.error('Error parsing loan data:', error);
                dispatch(routeChange('end'))
            }
        }

        displayVal();
    }, []);

    const dial = () => {
        const number = "9930111500";
        try {
            // @ts-ignore: JSBridge might be injected by native app
            JSBridge.call(number); // Uncomment if JSBridge is available
        } catch (err) {
            window.open(`tel:${number}`, "_self");
        }
    };

    const customAmountValidation = () => {
        if (
            customAmount.length > 0 &&
            Number(customAmount) <= Number(payNow.toFixed(2)) &&
            Number(customAmount) >= 100
        ) {
            callPaymentCustom();
        }
    };

    const callPaymentCustom = async () => {
        dispatch(routeChange('start'))
        if (parseFloat(customAmount) > 0 && personalLoanList.length > 0) {
            try {
                const data = {
                    applicationId: personalLoanList[0].applicationId,
                    loanId: personalLoanList[0].loanApplicationReferenceNo,
                    invoiceId: "",
                    amount: parseFloat(customAmount),
                    cashBackAmount: 0,
                    purpose: "LOAN",
                    medium: "NEFT",
                    paymentApp: "NEFT",
                    loginId: mobileNo,
                    customerId: custID,
                };

                const response = await axios.post('/supermoney-service/payment/attempt', data);
                const JSONData = response.data;
                dispatch(routeChange('end'))
                navigate({
                    pathname: "/PaymentOption",
                    search: `?applicationId=${personalLoanList[0].applicationId}&customerId=${custID}`
                });
            } catch (error) {
                console.error("Error processing payment:", error);
                dispatch(routeChange('end'))

            }
        }
    };

    const callPayment = async () => {
        dispatch(routeChange('start'))
        if (payNow > 0 && personalLoanList.length > 0) {
            try {
                const data = {
                    applicationId: personalLoanList[0].applicationId,
                    loanId: personalLoanList[0].loanApplicationReferenceNo,
                    invoiceId: "",
                    amount: payNow,
                    cashBackAmount: 0,
                    purpose: "LOAN",
                    medium: "NEFT",
                    paymentApp: "NEFT",
                    loginId: mobileNo,
                    customerId: custID,
                };

                const response = await axios.post('/supermoney-service/payment/attempt', data);
                dispatch(routeChange('end'))
                navigate({
                    pathname: "/PaymentOption",
                    search: `?applicationId=${personalLoanList[0].applicationId}&customerId=${custID}`
                });
            } catch (error) {
                console.error("Error processing payment:", error);
                dispatch(routeChange('end'))
            }
        }
    };

    const calculateNextDate = (loanEmiData: LoanEMIData[]): string => {
        let emiDate = "";
        for (const element of loanEmiData) {
            if (parseFloat(element.loanEmiAmountAdjusted.toString()) > 0.0) {
                emiDate = element.loanRepaymentDate;
                break;
            }
        }
        return emiDate;
    };

    const formatDate = (date: string): string => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
        });
    };

    const formatDateFull = (date: string): string => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const displayVal = async () => {
        dispatch(routeChange('start'))
        try {
            const rpParam = new URLSearchParams(window.location.search).get('rp');
            const response = await axios.get(`/supermoney-service/payment/details/get/v4?rp=${rpParam}`);

            const JSONData = response.data;
            setCompanyName(JSONData.companyName);
            setCustID(JSONData.customerId);
            setMobileNo(JSONData.mobileNo);
            dispatch(routeChange('end'))
            if (JSONData.getPaymentDetails.length > 0) {
                getApplicationDetails(JSONData.customerId, JSONData.getPaymentDetails[0].applicationId);
            }
        } catch (error) {
            console.error("Error fetching payment details:", error);
            dispatch(routeChange('end'))
            navigate("/noDue");
        }
    };

    const getApplicationDetails = async (customerId: string, applicationId: string) => {
        dispatch(routeChange('start'))
        try {
            const response = await axios.post('/supermoney-service/customer/application/get/v2', {
                customerId: customerId,
                applicationId: applicationId,
            });

            const JSONData = response.data;
            setLenderName(JSONData.getCustomerApplicationResponseList[0].programLenderResp.lenderName);
            dispatch(routeChange('end'))
        } catch (error) {
            console.error("Error fetching application details:", error);
            dispatch(routeChange('end'))
        }
    };

    return (
        <div
            className="max-w-[450px] mx-auto bg-[#f5f5f5] min-h-screen font-montserrat text-left px-7 pb-7"
            style={{ minHeight: `${height}px` }}
        >
            {/* Alert */}
            {alert && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {alertMessage}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center pt-9">
                <button
                    onClick={() => navigate(-1)}
                    className="cursor-pointer text-gray-900 opacity-87 -ml-2"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content */}
            <div className="mt-6 pb-5">
                <h1 className="text-xl font-bold">Instalment Repayment</h1>

                {/* Current Instalment Details */}
                <div className="bg-white rounded-xl p-4 mt-4 text-left shadow-sm">
                    <div className="text-[#5927e7] text-sm font-bold">Current Instalment Details</div>

                    <div className="bg-[#f7f5ff] rounded-xl p-4 mt-2">
                        <div className="flex justify-between">
                            <div className="text-xs text-[#9c9ba1]">Due Date</div>
                            <div className="text-xs text-[#202021] font-bold text-right">
                                {personalLoanList.length > 0
                                    ? formatDateFull(calculateNextDate(personalLoanList[0].loanApplicationReferenceEmiData))
                                    : "__ __"}
                            </div>
                        </div>

                        <div className="flex justify-between mt-3">
                            <div className="text-xs text-[#9c9ba1]">Principal</div>
                            <div className="text-xs text-[#202021] font-bold text-right">
                                ₹{personalLoanList.length > 0 ? personalLoanList[0].loanAmount.toLocaleString() : "__ __"}
                            </div>
                        </div>

                        <div className="flex justify-between mt-3">
                            <div className="text-xs text-[#9c9ba1]">Interest</div>
                            <div className="text-xs text-[#202021] font-bold text-right">
                                ₹{personalLoanList.length > 0 ? personalLoanList[0].interestOutstanding.toLocaleString() : "__ __"}
                            </div>
                        </div>

                        <div className="flex justify-between mt-3">
                            <div className="text-xs text-[#9c9ba1]">Penalty</div>
                            <div className="text-xs text-[#202021] font-bold text-right">
                                ₹{personalLoanList.length > 0 ? personalLoanList[0].penalCharge.toLocaleString() : "__ __"}
                            </div>
                        </div>

                        <div className="flex justify-between mt-3">
                            <div className="text-xs text-[#9c9ba1]">Instalment Amount</div>
                            <div className="text-xs text-[#202021] font-bold text-right">
                                ₹{parseFloat(payNow.toFixed(2)).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Pay Now Button */}
                    <div className="mt-3">
                        <button
                            onClick={callPayment}
                            className="w-full bg-[#5927E7] text-white py-1.5 rounded-lg font-medium cursor-pointer"
                        >
                            Pay ₹{parseFloat(payNow.toFixed(2)).toLocaleString()}
                        </button>
                    </div>

                    {/* Contact Section */}
                    <div className="mt-5 text-xs">Want more details about repayment?</div>
                    <button
                        onClick={dial}
                        className="flex items-center justify-center border border-[#7E67DA] text-[#7e67da] py-1.5 text-xs font-bold px-4 rounded-lg mt-2 w-48"
                    >
                        <Phone className="w-4 h-4 mr-1" fill='#7E67DA' />
                        Contact Us
                    </button>
                </div>

                {/* Pay Custom Amount */}
                {showPay && (
                    <details className="bg-white rounded-xl mt-4 group">
                        <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                            <div>
                                <div className="text-sm text-[#5927e7] font-bold">Pay Custom Amount</div>
                                <div className="mt-2 text-xs text-[#666666] leading-5">
                                    You can pay minimum ₹100 and maximum upto upcoming loan amount
                                </div>
                            </div>
                            <ChevronDown className="w-5 h-5 text-[#5927e7] transform group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-10 pb-4">
                            <div className="mx-1">
                                <input
                                    type="number"
                                    placeholder="Amount(₹)"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <div className="text-xs text-[#888888] text-left mt-1">
                                    Min Amount ₹100 - Max Amount ₹{parseFloat(payNow.toFixed(2)).toLocaleString()}
                                </div>
                            </div>
                            <div className="mx-1 mt-5">
                                <button
                                    onClick={customAmountValidation}
                                    className="border border-[#5927e7] text-[#5927e7] font-bold py-2 px-6 rounded-md w-full uppercase"
                                >
                                    Pay
                                </button>
                            </div>
                        </div>
                    </details>
                )}

                {/* Repayment Schedule Card */}
                <div
                    onClick={() => setStatusSheet(true)}
                    className="bg-white rounded-xl px-3 py-2 mt-4 text-left cursor-pointer shadow-sm"
                >
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-[#f7f5ff] flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-[#5927E7]" />
                        </div>
                        <div className="ml-4">
                            <div className="text-[#666666] text-sm font-medium">Repayment Schedule</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#a1a1a1] ml-auto" />
                    </div>
                </div>

                {/* Future Instalments */}
                <details className="bg-white rounded-xl mt-4 group">
                    <summary className="flex justify-between items-center p-4 cursor-pointer list-none">
                        <div>
                            <div className="text-sm text-[#5927e7] font-bold">Future Instalments</div>
                            <div className="mt-2 text-xs text-[#666666] leading-5">
                                Future installment can pay after current EMI due date
                            </div>
                        </div>
                        <ChevronDown className="w-5 h-5 text-[#5927e7] transform group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-4 pb-4">
                        <div className="bg-[#f7f5ff] rounded-xl p-4">
                            <div className="flex justify-between">
                                <div className="text-xs text-[#5927e7] font-bold w-2/5">Instalments</div>
                                <div className="text-xs text-[#5927e7] font-bold text-center w-1/4">Due date</div>
                                <div className="text-xs text-[#5927e7] font-bold text-right w-1/4">Amount</div>
                            </div>

                            {paymentList.map((item, index) => (
                                <div key={index} className="flex justify-between mt-3">
                                    <div className="text-xs text-[#9c9ba1] w-2/5">
                                        Instalment {item.position}
                                    </div>
                                    <div className="text-xs text-[#9c9ba1] text-center w-1/4">
                                        {formatDate(item.loanRepaymentDate)}
                                    </div>
                                    <div className="text-xs text-[#202021] font-bold text-right w-1/4">
                                        ₹{item.loanEmiAmountAdjusted.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </details>
            </div>

            {/* Bottom Sheet - Repayment Schedule */}
            {statusSheet && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 max-w-[450px] mx-auto" onClick={() => setStatusSheet(false)}>
                    <div className="bg-transparent w-full">
                        <div
                            className="flex items-center justify-end w-fit ml-auto mr-3 mb-3 bg-[#fafafa] rounded-full px-3 py-2 cursor-pointer"
                            onClick={() => setStatusSheet(false)}
                        >
                            <div className="text-black text-sm font-medium mr-1">Close</div>
                            <ChevronDown className="w-5 h-5 text-black" />
                        </div>

                        <div className="bg-[#fafafa] rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
                            <h2 className="text-xl font-bold">Repayment Schedule</h2>

                            <div className="bg-white rounded-xl p-4 mt-4 max-h-96 overflow-y-auto">
                                <div className="flex justify-between">
                                    <div className="text-xs text-black font-bold w-2/5">Paid on</div>
                                    <div className="text-xs text-black font-bold text-center w-1/3">Due Amt.</div>
                                    <div className="text-xs text-green-600 font-bold text-right w-1/3">Amt. Paid</div>
                                </div>

                                {personalLoanList.length > 0 && personalLoanList[0].loanApplicationReferenceEmiData.map((item, index) => (
                                    <div key={index} className="flex justify-between mt-3">
                                        <div className="text-xs text-black w-2/5">
                                            {formatDate(item.loanRepaymentDate)}
                                        </div>
                                        <div className="text-xs text-black text-center w-1/3">
                                            ₹{item.loanEmiAmount.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-green-600 text-right w-1/3">
                                            {item.loanEmiAmount - item.loanEmiAmountAdjusted > 0
                                                ? `₹${(item.loanEmiAmount - item.loanEmiAmountAdjusted).toLocaleString()}`
                                                : "__ __"}
                                        </div>
                                    </div>
                                ))}

                                {/* Summary Card */}
                                <div className="bg-[#f7f5ff] rounded-xl p-4 mt-3">
                                    <div className="flex justify-between">
                                        <div className="text-xs text-[#9c9ba1] w-1/2">Loan Amount</div>
                                        <div className="text-xs text-[#202021] font-bold text-right w-1/2">
                                            ₹{personalLoanList.length > 0 ? personalLoanList[0].loanAmount.toLocaleString() : "__ __"}
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-3">
                                        <div className="text-xs text-[#9c9ba1] w-2/3">EMI Amount</div>
                                        <div className="text-xs text-[#202021] font-bold text-right w-1/3">
                                            ₹{personalLoanList.length > 0
                                                ? parseFloat(String(personalLoanList[0].loanApplicationReferenceEmiData[0]?.loanEmiAmount) || '0').toLocaleString()
                                                : "__ __"}
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-3">
                                        <div className="text-xs text-[#9c9ba1] w-2/3">Upcoming Instalment Date</div>
                                        <div className="text-xs text-[#202021] font-bold text-right w-1/3">
                                            {personalLoanList.length > 0
                                                ? formatDate(calculateNextDate(personalLoanList[0].loanApplicationReferenceEmiData))
                                                : "__ __"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Repayment;