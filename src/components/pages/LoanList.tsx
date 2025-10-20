import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ThumbsUp, X, Wallet, Copy } from 'lucide-react';
import axios from 'axios';

// Import your images
import landingLogoBlue from '../../assets/img/landinglogoblue.png';
import characterImg from '../../assets/img/character.png';
import walletImg from '../../assets/img/wallet.png';
import { useDispatch } from 'react-redux';
import { routeChange } from '../../store/preloaderSlice';

interface LoanEMIData {
    loanEmiAmountAdjusted: number;
    loanRepaymentDate: string;
}

interface Loan {
    loanApplicationReferenceNo: string;
    supplierName?: string;
    purchaseOrderID?: string;
    overDueAmount: number;
    totalOutstanding: number;
    loanAccountNo: string;
    loanApplicationReferenceEmiData: LoanEMIData[];
    loanType: string;
    loanAmount: number;
    cancelAmount?: number;
    totalLoanAmountPaid: number;
    invoiceDate?: string;
    penalCharge: number;
    penalInterest: number;
    interestOutstanding: number;
    interestPortion: number;
    loanProductId: number;
    applicationId: string;
    relatedId?: string;
    vpa?: string;
    vpaName?: string;
    cashBackApplicable?: boolean;
    applyRefundAsCashback?: boolean
}

interface PaymentDetailsResponse {
    companyName: string;
    customerId: string;
    mobileNo: string;
    getPaymentDetails: Array<{
        applicationId: string;
        applyRefundAsCashback: boolean;
        cashBackApplicable: boolean;
        data: Loan[];
    }>;
}

interface InvoiceDetailsResponse {
    invoiceDetails: {
        APPROVED: {
            invoiceDetailsResp: Array<{
                supplierDetails: {
                    name: string;
                };
                purchaseOrderNumber: string;
                createdAt: string;
                cancelAmount?: number;
            }>;
        };
    };
}

const LoanList: React.FC = () => {
    const [snackbar, setSnackbar] = useState<boolean>(false);
    const [alert, setAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [rewardAvailable, setRewardAvailable] = useState<boolean>(true);
    const [fullAmount, setFullAmount] = useState<boolean>(true);
    const [cashbackAmountApplied, setCashbackAmountApplied] = useState<number>(0);
    const [tempCashbackAmount, setTempCashbackAmount] = useState<string>('');
    const [payAmount, setPayAmount] = useState<number>(0);
    const [orderId, setOrderId] = useState<string>('');
    const [payFullCashBack, setPayFullCashBack] = useState<boolean>(false);
    const [approvedCreditLimit, setApprovedCreditLimit] = useState<number>(0);
    const [totalCashbackAmountAvailed, setTotalCashbackAmountAvailed] = useState<number>(0);
    const [utilizedCashbackAmount, setUtilizedCashbackAmount] = useState<number>(0);
    const [unutilizedCashbackAmount, setUnutilizedCashbackAmount] = useState<number>(0);
    const [cashbackSelectedLoan, setCashbackSelectedLoan] = useState<Loan | null>(null);
    const [cashbackCalculateInput, setCashbackCalculateInput] = useState<string>('');
    const [cashbackResult, setCashbackResult] = useState<string>('');
    const [calculateCashback, setCalculateCashback] = useState<boolean>(false);
    const [calculateCashbackResult, setCalculateCashbackResult] = useState<boolean>(false);
    const [tab, setTab] = useState<string>('INVOICE CREDIT');
    const [items, setItems] = useState<string[]>(['INVOICE CREDIT', 'PERSONAL CREDIT']);
    const [loanList, setLoanList] = useState<Loan[]>([]);
    const [invoiceLoanList, setInvoiceLoanList] = useState<Loan[]>([]);
    const [personalLoanList, setPersonalLoanList] = useState<Loan[]>([]);
    const [companyName, setCompanyName] = useState<string>('');
    const [paymentDelected, setPaymentDelected] = useState<boolean>(true);
    const [mediumSend, setMediumSend] = useState<string>('UPI');
    const [customerID, setCustomerID] = useState<number>(0);
    const [isCashbackAvailable, setIsCashbackAvailable] = useState<boolean>(false);
    const [loanAvailableCashback, setLoanAvailableCashback] = useState<number>(0);
    const [mobileNo, setMobileNo] = useState<string>('');
    const dispatch = useDispatch()
    const navigate = useNavigate();

    useEffect(() => {
        if (window.location.search.includes('rp=')) {
            displayVal();
        } else {
            const url = window.location.href;
            // const code = url.substring(33, 39);
            const code = url?.split('=')[1]?.slice(0, 6);
            window.open(`https://www.supermoney.in/PA/#/?rp=${code}`, "_blank");
            navigate("/Error");
        }
        dispatch(routeChange('end'))
    }, [navigate]);

    const openTermLoanPage = (loan: Loan) => {
        navigate({
            pathname: "/Repayment",
            search: `?rp=${new URLSearchParams(window.location.search).get('rp')}&loan=${JSON.stringify(loan)}`
        });
    };

    const redirectToTransaction = () => {
        navigate({
            pathname: "/TransactionHistory",
            search: `?rp=${new URLSearchParams(window.location.search).get('rp')}&customerId=${customerID}`
        });
    };

    const fetchApplicationId = async () => {
        dispatch(routeChange('start'))
        try {
            const response = await axios.post('/supermoney-service/customer/application/get/v2', {
                customerId: customerID,
                applicationId: new URLSearchParams(window.location.search).get('applicationId'),
            });

            const JSONData = response.data;
            setIsCashbackAvailable(JSONData.getCustomerApplicationResponseList[0].programDetails.isCashbackAvailable);
            dispatch(routeChange('end'))
        } catch (error) {
            console.error("Error fetching application:", error);
            dispatch(routeChange('end'))
        }
    };

    const closeCalculateCashbackResult = () => setCalculateCashbackResult(false);
    const closeCalculateCashback = () => setCalculateCashback(false);
    const closePayFullCashBack = () => setPayFullCashBack(false);

    const applyCashBack = () => {
        if (
            parseFloat(loanAvailableCashback.toString()) >= parseFloat(tempCashbackAmount) &&
            payAmount - parseFloat(tempCashbackAmount) >= 100
        ) {
            setCashbackAmountApplied(parseFloat(tempCashbackAmount));
        } else {
            setSnackbar(true);
            setTimeout(() => setSnackbar(false), 2000);
        }
    };

    const payCashBackAmount = () => {
        setPayFullCashBack(false);
        if (cashbackSelectedLoan) {
            callPayment(
                cashbackSelectedLoan,
                payAmount - cashbackAmountApplied,
                cashbackAmountApplied
            );
        }
    };

    const skipThis = () => {
        setPayFullCashBack(false);
        if (cashbackSelectedLoan) {
            callPayment(cashbackSelectedLoan, payAmount, 0);
        }
    };

    const calculateCashBackAmount = async () => {
        dispatch(routeChange('start'))
        if (parseInt(cashbackCalculateInput) > 0 && cashbackSelectedLoan) {
            try {
                const response = await axios.post('/supermoney-service/cashback/getApplicableCashback', {
                    customerId: customerID,
                    loanId: cashbackSelectedLoan.loanAccountNo,
                    applicationId: cashbackSelectedLoan.applicationId,
                    amount: cashbackCalculateInput,
                });

                const JSONData = response.data;
                if (JSONData.status) {
                    setCashbackResult(JSONData.getApplicableCashbackDetails[0].cashBack);
                    setCalculateCashback(false);
                    setCalculateCashbackResult(true);
                } else {
                    setCalculateCashbackResult(true);
                    setCalculateCashback(false);
                    setAlert(true);
                    setAlertMessage(JSONData.errorMsg);
                }
                dispatch(routeChange('end'))
            } catch (error) {
                console.error("Error calculating cashback:", error);
                dispatch(routeChange('end'))            
            }
        } else {
            setAlert(true);
            setAlertMessage("Enter cashback amount");
            dispatch(routeChange('end')) 
        }
    };

    const customerProfile = async (mNo: string) => {
        dispatch(routeChange('start'))
        try {
            const response = await axios.post('/supermoney-service/customer/profile/v2', {
                loginId: mNo,
                applicationId: new URLSearchParams(window.location.search).get('applicationId'),
            });

            const JSONData = response.data;
            if (JSONData.errorMessage === "") {
                setCustomerID(JSONData.customerId);
                fetchRewardDetails();
                fetchApplicationId();
            } else {
                setAlert(false);
                setAlertMessage(JSONData.errorMessage);
            }
            dispatch(routeChange('end'))
        } catch (error) {
            console.error("Error fetching customer profile:", error);
            dispatch(routeChange('end'))
        }
    };

    const fetchRewardDetails = async () => {
        dispatch(routeChange('start'))
        try {
            const response = await axios.post('/supermoney-service/cashback/getAccountDetails', {
                customerId: customerID,
                applicationId: new URLSearchParams(window.location.search).get('applicationId'),
            });

            const JSONData = response.data;
            if (JSONData.status) {
                setRewardAvailable(JSONData.status);
                setApprovedCreditLimit(JSONData.getCashbackAccountDetails[0].approvedCreditLimit);
                setTotalCashbackAmountAvailed(JSONData.getCashbackAccountDetails[0].totalCashbackAmountAvailed);
                setUtilizedCashbackAmount(JSONData.getCashbackAccountDetails[0].utilizedCashbackAmount);
                setUnutilizedCashbackAmount(JSONData.getCashbackAccountDetails[0].unutilizedCashbackAmount);
                setLoanAvailableCashback(JSONData.getCashbackAccountDetails[0].unutilizedCashbackAmount);
            } else {
                setRewardAvailable(JSONData.successFlag);
            }
            dispatch(routeChange('end'))
        } catch (error) {
            console.error("Error fetching reward details:", error);
            dispatch(routeChange('end'))
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

    const callPayment = async (loan: Loan, amount: number, cashback: number) => {
        dispatch(routeChange('start'))
        if (parseFloat(amount.toString()) + parseFloat(cashback.toString()) > 0) {
            setPaymentDelected(true);

            try {
                const response = await axios.post('/supermoney-service/payment/attempt', {
                    applicationId: loan.applicationId,
                    loanId: loan.loanApplicationReferenceNo,
                    invoiceId: loan.relatedId,
                    amount: amount,
                    cashBackAmount: cashback,
                    purpose: "LOAN",
                    medium: mediumSend,
                    paymentApp: "RazorPay",
                    loginId: mobileNo,
                    customerId: customerID,
                });

                const JSONData = response.data;
                const transactionRefNo = JSONData.transactionRefNo;
                const transactionRefNoNew = String(transactionRefNo).replace(/_/g, "A");
                dispatch(routeChange('end'))
                if (paymentDelected) {
                    window.open(
                        `upi://pay?pa=${loan.vpa}&pn=${loan.vpaName}&am=${amount}&tid=${transactionRefNoNew}&cu=INR&url=http://192.168.5.223:8080/#/PaymentSuccess`
                    );
                }
            } catch (error) {
                console.error("Error processing payment:", error);
                dispatch(routeChange('end'))
            }
        }
    };

    const formatDate = (date: string): string => {
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
            const response = await axios.get<PaymentDetailsResponse>(
                `/supermoney-service/payment/details/get/v4?rp=${rpParam}`
            );

            const JSONData = response.data;
            const newLoanList: Loan[] = [];

            setCompanyName(JSONData.companyName);
            setCustomerID(parseInt(JSONData.customerId));

            JSONData.getPaymentDetails.forEach((listLoan) => {
                const applicationID = listLoan.applicationId;
                const applyRefundAsCashback = listLoan.applyRefundAsCashback;
                const cashBackApplicable = listLoan.cashBackApplicable;

                listLoan.data.forEach((loans) => {
                    loans.applicationId = applicationID;
                    loans.applyRefundAsCashback = applyRefundAsCashback;
                    loans.cashBackApplicable = cashBackApplicable;
                    newLoanList.push(loans);
                });
            });

            setLoanList(newLoanList);

            const invoiceLoans: Loan[] = [];
            const personalLoans: Loan[] = [];

            newLoanList.forEach((loan) => {
                if (
                    loan.relatedId &&
                    loan.relatedId.length !== 0 &&
                    (loan.overDueAmount > 0 || loan.totalOutstanding > 0)
                ) {
                    invoiceLoans.push(loan);
                } else if (loan.overDueAmount > 0 || loan.totalOutstanding > 0) {
                    personalLoans.push(loan);
                }
            });

            setInvoiceLoanList(invoiceLoans);
            setPersonalLoanList(personalLoans);

            let tabItems: string[] = [];
            if (invoiceLoans.length > 0 && personalLoans.length > 0) {
                tabItems = ["INVOICE CREDIT", "PERSONAL CREDIT"];
            } else if (invoiceLoans.length > 0) {
                tabItems = ["INVOICE CREDIT"];
            } else {
                tabItems = ["PERSONAL CREDIT"];
            }
            setItems(tabItems);

            setTab(invoiceLoans.length === 0 ? "PERSONAL CREDIT" : "INVOICE CREDIT");
            setMobileNo(JSONData.mobileNo);

            // Fetch supplier names for invoice loans
            // invoiceLoans.forEach(async (loan, index) => {
            //     if (loan.relatedId) {
            //         const supplierName = await getSupplierName(loan.relatedId);
            //         const updatedLoans = [...invoiceLoans];
            //         updatedLoans[index] = {
            //             ...updatedLoans[index],
            //             // supplierName: supplierName?.name as string|| supplierName?.supplierDetails.name,
            //             supplierName: supplierName?.supplierDetails.name,
            //             purchaseOrderID: supplierName.purchaseOrderNumber,
            //             invoiceDate: supplierName.createdAt,
            //             cancelAmount: supplierName.cancelAmount
            //         };
            //         setInvoiceLoanList(updatedLoans);
            //     }
            // });

            const updatedLoans = [...invoiceLoans];

            await Promise.all(
                invoiceLoans.map(async (loan, index) => {
                    if (loan.relatedId) {
                        const supplierName = await getSupplierName(loan.relatedId);
                        updatedLoans[index] = {
                            ...updatedLoans[index],
                            supplierName: supplierName?.supplierDetails.name,
                            purchaseOrderID: supplierName.purchaseOrderNumber,
                            invoiceDate: supplierName.createdAt,
                            cancelAmount: supplierName.cancelAmount
                        };
                    }
                })
            );

            setInvoiceLoanList(updatedLoans);
            dispatch(routeChange('end'))
            if (invoiceLoans.length === 0 && personalLoans.length === 0) {
                navigate("/noDue");
            }

            customerProfile(JSONData.mobileNo);
        } catch (error) {
            console.error("Error fetching payment details:", error);
            dispatch(routeChange('end'))
            navigate("/noDue");
        }
    };

    const getSupplierName = async (id: string) => {
        dispatch(routeChange('start'))
        try {
            const response = await axios.get<InvoiceDetailsResponse>(
                `/invoice-finance-services/invoice-services/finance/invoices/get/v3?id=${id}`
            );
            dispatch(routeChange('end'))
            return response.data.invoiceDetails.APPROVED.invoiceDetailsResp[0];
        } catch (error) {
            console.error("Error fetching supplier details:", error);
            dispatch(routeChange('end'))
            return {
                supplierDetails: { name: '' },
                purchaseOrderNumber: '',
                createdAt: '',
                cancelAmount: 0
            };
        }
    };

    const getInvoiceList = invoiceLoanList;

    return (
        <div className="max-w-[450px] text-left font-montserrat min-h-screen bg-white mx-auto">
            {/* Snackbar */}
            {snackbar && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    Minimum Rs 100 of own contribution required to utilise cashback
                </div>
            )}

            {/* Alert */}
            {alert && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-4 mt-4">
                    {alertMessage}
                </div>
            )}

            <div className="text-center pb-12">
                <img
                    alt="logo"
                    src={landingLogoBlue}
                    className="mx-auto mt-4"
                />

                {/* Tabs */}
                {invoiceLoanList.length > 0 && personalLoanList.length > 0 && (
                    <div className="flex border-b border-gray-200 mt-4">
                        {items.map((item) => (
                            <button
                                key={item}
                                className={`flex-1 py-3 font-medium text-sm ${tab === item
                                    ? 'text-[#4328ae] border-b-2 border-[#4328ae]'
                                    : 'text-gray-500'
                                    }`}
                                onClick={() => setTab(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                )}

                {/* Tab Content */}
                <div className="mt-4">
                    {tab === 'INVOICE CREDIT' && (
                        <div className="space-y-4 mx-4">
                            {getInvoiceList.map((loan) => (
                                <div key={loan.loanApplicationReferenceNo} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="text-left">
                                                <div className="text-xs font-bold text-gray-900">
                                                    {loan.supplierName || 'Supplier'}
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {loan.purchaseOrderID || 'Purchase Order'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-600">
                                                    {loan.overDueAmount > 0 ? "Total Overdue" : "Total Due"}
                                                </div>
                                                <div className={`text-sm font-bold ${loan.overDueAmount > 0 ? 'text-red-500' : 'text-[#4328ae]'
                                                    }`}>
                                                    ₹{loan.overDueAmount > 0
                                                        ? loan.overDueAmount.toLocaleString()
                                                        : loan.totalOutstanding.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <div className="text-left">
                                                <div className="text-xs text-gray-600">Due Date</div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {formatDate(calculateNextDate(loan.loanApplicationReferenceEmiData))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-600">Supermoney A/C</div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {loan.loanAccountNo}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className={`w-full py-2 font-bold mt-4 rounded-md uppercase text-sm ${loan.overDueAmount > 0
                                                ? 'bg-[#ff5252] text-white'
                                                : 'bg-[#4328ae] text-white'
                                                }`}
                                            onClick={() => openTermLoanPage(loan)}
                                        >
                                            {loan.loanType === "OTHERS" ? "Pay" :
                                                loan.overDueAmount > 0 ? `Pay ₹${loan.overDueAmount.toLocaleString()}` :
                                                    `Pay ₹${loan.totalOutstanding.toLocaleString()}`}
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-200">
                                        <details className="group">
                                            <summary className="flex justify-between items-center p-4 cursor-pointer text-[#4328ae] text-xs font-bold">
                                                View Re-Payment Details
                                                <ChevronRight className="w-4 h-4 transform group-open:rotate-90 transition-transform" />
                                            </summary>
                                            <div className="px-4 pb-4 space-y-2">
                                                {/* Repayment details content */}
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Invoice Amounts</span>
                                                    <span className="text-sm text-gray-600">₹{loan.loanAmount.toLocaleString()}</span>
                                                </div>

                                                {!!loan?.cancelAmount && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Cancelled Invoice Amount</span>
                                                        <span className="text-sm text-gray-600">₹{loan.cancelAmount.toLocaleString()}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Invoice Amount Repaid</span>
                                                    <button
                                                        onClick={redirectToTransaction}
                                                        className="flex items-center text-[#7E67DA] text-sm"
                                                    >
                                                        ₹{Number(loan.totalLoanAmountPaid).toLocaleString()}
                                                        <ChevronRight className="w-4 h-4 ml-1" />
                                                    </button>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Invoice Date</span>
                                                    <span className="text-sm text-gray-600">
                                                        {loan.invoiceDate ? formatDate(loan.invoiceDate) : 'N/A'}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Due Date</span>
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(calculateNextDate(loan.loanApplicationReferenceEmiData))}
                                                    </span>
                                                </div>

                                                {loan.loanProductId !== 53 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Interest</span>
                                                        <span className="text-sm text-gray-600">₹{loan.interestOutstanding.toLocaleString()}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Penalty Charge</span>
                                                    <span className="text-sm text-gray-600">₹{loan.penalCharge.toLocaleString()}</span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Penal Interest</span>
                                                    <span className="text-sm text-gray-600">₹{loan.penalInterest.toLocaleString()}</span>
                                                </div>

                                                {loan.loanProductId === 53 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Accrued Interest</span>
                                                        <span className="text-sm text-gray-600">
                                                            ₹{loan.interestPortion?.toString().length > 0 ? loan.interestPortion.toLocaleString() : 0}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="bg-[#f7f5ff] rounded p-3 mt-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-bold text-black">Total Payment Amount</span>
                                                        <span className="text-sm text-gray-600">₹{loan.totalOutstanding.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'PERSONAL CREDIT' && (
                        <div className="space-y-4 mx-4">
                            {personalLoanList.map((loan) => (
                                <div key={loan.loanApplicationReferenceNo} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="text-left">
                                                <div className="text-xs font-bold text-gray-900">
                                                    Personal Loan
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-600">
                                                    {loan.overDueAmount > 0 ? "Total Overdue" : "Total Due"}
                                                </div>
                                                <div className={`text-sm font-bold ${loan.overDueAmount > 0 ? 'text-red-500' : 'text-[#4328ae]'
                                                    }`}>
                                                    ₹{loan.overDueAmount > 0
                                                        ? loan.overDueAmount.toLocaleString()
                                                        : loan.totalOutstanding.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <div className="text-left">
                                                <div className="text-xs text-gray-600">Due Date</div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {formatDate(calculateNextDate(loan.loanApplicationReferenceEmiData))}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-600">Supermoney A/C</div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {loan.loanAccountNo}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className={`w-full py-3 font-bold mt-4 rounded-lg ${loan.overDueAmount > 0
                                                ? 'bg-red-500 text-white'
                                                : 'bg-[#4328ae] text-white'
                                                }`}
                                            onClick={() => callPayment(
                                                loan,
                                                loan.overDueAmount > 0 ? loan.overDueAmount : loan.totalOutstanding,
                                                0
                                            )}
                                        >
                                            Pay ₹{loan.overDueAmount > 0
                                                ? loan.overDueAmount.toLocaleString()
                                                : loan.totalOutstanding.toLocaleString()}
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-200">
                                        <details className="group">
                                            <summary className="flex justify-between items-center p-4 cursor-pointer text-[#4328ae] text-xs font-bold">
                                                View Re-Payment Details
                                                <ChevronRight className="w-4 h-4 transform group-open:rotate-90 transition-transform" />
                                            </summary>
                                            <div className="px-4 pb-4 space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Loan Amount</span>
                                                    <span className="text-sm text-gray-600">₹{loan.loanAmount.toLocaleString()}</span>
                                                </div>

                                                {loan.loanProductId !== 53 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Interest</span>
                                                        <span className="text-sm text-gray-600">₹{loan.interestOutstanding.toLocaleString()}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Penalty Charge</span>
                                                    <span className="text-sm text-gray-600">₹{loan.penalCharge.toLocaleString()}</span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Penal Interest</span>
                                                    <span className="text-sm text-gray-600">₹{loan.penalInterest.toLocaleString()}</span>
                                                </div>

                                                {loan.loanProductId === 53 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Accrued Interest</span>
                                                        <span className="text-sm text-gray-600">
                                                            ₹{loan.interestPortion?.toString().length > 0 ? loan.interestPortion.toLocaleString() : 0}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="bg-[#f7f5ff] rounded p-3 mt-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-bold text-black">Total Payment Amount</span>
                                                        <span className="text-sm text-gray-600">₹{loan.totalOutstanding.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Sheets */}
            {calculateCashback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 max-w-[450px] mx-auto">
                    <div className="bg-[#f7f5ff] w-full rounded-t-2xl h-64">
                        <div className="text-right p-2">
                            <X className="w-6 h-6 text-[#7E67DA] inline-block cursor-pointer" onClick={closeCalculateCashback} />
                        </div>
                        <div className="px-5">
                            <div className="text-base font-bold">
                                Know how much you can earn by <br />paying for this invoice?
                            </div>
                            <input
                                type="number"
                                placeholder="Re-payment amount"
                                value={cashbackCalculateInput}
                                onChange={(e) => setCashbackCalculateInput(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-3"
                            />
                            <button
                                className="w-full bg-[#7E67DA] text-white py-3 rounded-lg font-bold mt-4"
                                onClick={calculateCashBackAmount}
                            >
                                Calculate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {calculateCashbackResult && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 max-w-[450px] mx-auto">
                    <div className="bg-[#f7f5ff] w-full rounded-t-2xl h-80">
                        <div className="text-right p-2">
                            <X className="w-6 h-6 text-[#7E67DA] inline-block cursor-pointer" onClick={closeCalculateCashbackResult} />
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start">
                                <div className="w-3/5">
                                    <div className="text-xl text-[#4328ae] font-bold">Congratulations!</div>
                                    <div className="text-xs mt-2">You can earn</div>
                                    <div className="text-[#97c93e] font-bold text-2xl mt-1">
                                        ₹{parseInt(cashbackResult).toLocaleString()}
                                    </div>
                                    <div className="font-bold text-xs mt-1">as Cashback</div>
                                </div>
                                <div className="w-2/5">
                                    <img src={characterImg} alt="Character" className="w-32" />
                                </div>
                            </div>
                            <button
                                className="w-full bg-[#7E67DA] text-white py-3 rounded-lg font-bold mt-4"
                                onClick={() => cashbackSelectedLoan && openTermLoanPage(cashbackSelectedLoan)}
                            >
                                Pay Now
                            </button>
                            <div className="text-xs italic text-center mt-2">
                                *by paying ₹{parseInt(cashbackCalculateInput).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {payFullCashBack && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 max-w-[450px] mx-auto">
                    <div className="bg-[#f7f5ff] w-full rounded-t-2xl h-80">
                        <div className="text-right p-2">
                            <X className="w-6 h-6 text-[#7E67DA] inline-block cursor-pointer" onClick={closePayFullCashBack} />
                        </div>
                        <div className="px-5">
                            <div className="text-base font-bold">
                                {fullAmount ? "Paying Full Amt. -" : "Paying Custom Amt. -"}{" "}
                                <span className="text-[#4328ae]">₹{payAmount.toLocaleString()}</span>
                            </div>

                            {cashbackAmountApplied > 0 && (
                                <div className="inline-flex items-center bg-[#97c93e] text-white px-3 py-1 rounded-full text-sm mt-2">
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    - ₹{cashbackAmountApplied.toLocaleString()} Cashback Applied!
                                </div>
                            )}

                            <div className="text-sm mt-3">Use Cashback on this repayment</div>

                            <div className="flex items-center mt-3">
                                <img src={walletImg} alt="Wallet" className="w-8 h-8" />
                                <div className="ml-2">
                                    <div className="text-xs">Available Cashback</div>
                                    <div className="text-xs text-[#7e67da]">
                                        ₹{(loanAvailableCashback - cashbackAmountApplied).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="Enter Cashback Amt."
                                        value={tempCashbackAmount}
                                        onChange={(e) => setTempCashbackAmount(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="w-1/3">
                                    {cashbackAmountApplied === 0 ? (
                                        <button
                                            className="w-full bg-[#7e67da] text-white py-2 rounded-lg font-bold text-sm"
                                            onClick={applyCashBack}
                                        >
                                            APPLY
                                        </button>
                                    ) : (
                                        <button
                                            className="w-full border border-[#7e67da] text-[#7e67da] py-2 rounded-lg font-bold text-sm"
                                            onClick={() => cashbackSelectedLoan && openTermLoanPage(cashbackSelectedLoan)}
                                        >
                                            RESET
                                        </button>
                                    )}
                                </div>
                            </div>

                            {cashbackAmountApplied === 0 && (
                                <button
                                    className="flex items-center justify-center w-full font-bold mt-5 text-sm"
                                    onClick={skipThis}
                                >
                                    Skip this <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            )}

                            {cashbackAmountApplied > 0 && (
                                <button
                                    className="w-full bg-[#4328ae] text-white py-3 rounded-lg font-bold mt-4"
                                    onClick={payCashBackAmount}
                                >
                                    Pay ₹{(payAmount - cashbackAmountApplied).toLocaleString()}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanList;