import { use, useEffect, useState } from 'react';
import { TabGroup, TabList, TabPanel, TabPanels, Tab, Disclosure } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { routeChange } from '../../store/preloaderSlice';
import axios from 'axios';

type Loan = {
    loanApplicationReferenceNo: string;
    loanProductId: number;
    supplierName?: string;
    purchaseOrderID?: string;
    loanAccountNo: string;
    interestPortion: number;
    overDueAmountAdjusted: number;
    totalOutstanding: number;
    penaltyOutStanding: number;
    loanApplicationReferenceEmiData: any;
    vpa: any;
    vpaName: any;
};

const formatDate = (date: any) => '01 Oct 2025'; // stub
const calculateNextDate = (data: any) => new Date(); // stub
const calculateMinimum = (amount: number) => Math.floor(amount * 0.1); // stub

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}
const Home = () => {
    const [alert, setAlert] = useState({ status: false, message: '' })
    const [personalLoanList, setPersonalLoanList] = useState<any[]>([]);
    const [personalLoanListOverDue, setPersonalLoanListOverDue] = useState<any[]>([]);
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const [invoiceLoanListOverDueCustom, setInvoiceLoanListOverDueCustom] = useState<number[]>([]);
    const [invoiceLoanList, setInvoiceLoanList] = useState<any[]>([]);
    const [invoiceLoanListOverDue, setInvoiceLoanListOverDue] = useState<any[]>([]);
    const [paymentDelected, setPaymentDelected] = useState<boolean>(true);
    const [userDetails, setUserDetails] = useState({ customerId: '', mobileNumber: '' })

    const navigate = useNavigate();
    const dispatch = useDispatch()

    const [items, setItems] = useState<String[]>([]);


    const [personalLoanListOverDueCustom, setPersonalLoanListOverDueCustom] = useState<number[]>([]);
    const [personalLoanListCustom, setPersonalLoanListCustom] = useState<number[]>([]);

    const callPayment = (loan: Loan, amount: number) => {
        setPaymentDelected(false);
        if (amount > 0) {
            let self = this;

            dispatch(routeChange("start"));
           
            let url = "supermoney-service/payment/attempt";
            let data = {
                applicationId: loan.loanApplicationReferenceNo,
                amount: amount,
                purpose: "LOAN",
                medium: paymentDelected ? "UPI" : "RAZORPAY",
                paymentApp: "RazorPay",
                loanId: loan.loanAccountNo,
                loginId: userDetails.mobileNumber,
            };
            let msgHeader = {
                authToken: "", //dynamic
                loginId: userDetails.mobileNumber,
                channelType: "M",
                consumerId: "414",
                deviceId: "014dd3ba21e942d7",
                source: "webDirect",
            };
            let deviceFPmsgHeader = {
                clientIPAddress: "192.168.0.122",
                connectionMode: "WIFI",
                country: "United States",
                deviceManufacturer: "Xiaomi",
                deviceModelNo: "Mi A2",
                dualSim: false,
                imeiNo: "09d9212a07553637",
                latitude: "",
                longitude: "",
                nwProvider: "xxxxxxxx",
                osName: "Android",
                osVersion: 28,
                timezone: "Asia/Kolkata",
                versionCode: "58",
                versionName: "5.5.1",
            };
            let employeeDetails = { data, deviceFPmsgHeader, msgHeader };
            axios
                .post(url, employeeDetails)
                .then(function (response) {
                    dispatch(routeChange("end"));
                    console.log(response);
                    const JSONData = response.data;
                    const transactionRefNoNew = String(JSONData.data.transactionRefNo).replace(
                        /_/g,
                        "A"
                    );
                    console.log("this is new transref", transactionRefNoNew);

                    setUserDetails((prev) => ({ ...prev, customerId: JSONData.data.customerId }));
                    if (paymentDelected === true) {

                        // window.open("intent://pay?pa="+self.vpa+"&pn="+self.vpaName+"&mc=&tid=&tr="+self.loanAccountNo+"&tn=PayA"+self.transactionRefNo+"A"+self.custID+"&am="+disVal+"&cu=INR&refUrl=#Intent;scheme=upi;end");

                        window.open(
                            "upi://pay?pa=" +
                            loan.vpa +
                            "&pn=" +
                            loan.vpaName +
                            "&am=" +
                            amount +
                            "&tid=" +
                            transactionRefNoNew +
                            "&cu=INR"
                        );
                        // upi://pay?pa=supermoney@yesbank&pn=GetClarity+Fintech+Services+Private+Limited&am=10&tid=&tr=&tn=&t&cu=INR
                    } else {
                        // self.mediumSend = "RAZORPAY";

                        // console.log("display Amount == " + disVal * 100);
                        // let options = {
                        //     key: "rzp_uat_T9ozZwCcLc9csb", // Enter the Key ID generated from the Dashboard
                        //     amount: disVal * 100, // INR 299.35
                        //     name: "Get Clarity Fintech Services Pvt",

                        //     image:
                        //         "https://s3-ap-southeast-1.amazonaws.com/pubasset.mintwalk.com/images/companylogos/supermoney_logo.png",
                        //     //"order_id": "order_9A33XWu170gUtm",//Order ID is generated as Orders API has been implemented. Refer the Checkout form table given below
                        //     handler: function (response) {
                        //         // alert(response.razorpay_payment_id);
                        //         console.log("this is the payment response", response);
                        //         self.repaymentCallbackSuccess(response.razorpay_payment_id);
                        //     },
                        //     modal: {
                        //         ondismiss: function () {
                        //             console.log("Checkout form closed");
                        //         },
                        //     },
                        //     prefill: {
                        //         name: self.clientName,
                        //         email: self.email,
                        //         contact: self.mobileNo,
                        //     },
                        //     notes: {
                        //         transactionRefNo: self.transactionRefNo,
                        //     },
                        //     theme: {
                        //         color: "#97c93e",
                        //     },
                        // };

                        // self.hitPayment(options);
                    }
                })
                .catch(function (error) {
                    // handle error
                    console.log("display  ==" + error);
                })
                .finally(function () {
                    // always executed
                });
        }    };

    const callPaymentCustom = (loan: Loan, amount: number) => {
        let overDueUpcoming = loan.overDueAmountAdjusted > 0 ? loan.overDueAmountAdjusted : loan.totalOutstanding;
        if (amount > 0 && checkMinimum(overDueUpcoming, amount)) {

            dispatch(routeChange("start"));
            let url = "mintLoan/mintloan/attemptPayment";
            let data = {
                applicationId: loan.loanApplicationReferenceNo,
                amount: amount,
                purpose: "LOAN",
                medium: paymentDelected ? "UPI" : "RAZORPAY",
                paymentApp: "UPI",
            };
            let msgHeader = {
                authToken: "", //dynamic
                loginId: userDetails.mobileNumber, //dynamic
                channelType: "M",
                consumerId: "414",
                deviceId: "014dd3ba21e942d7",
                source: "webDirect",
            };
            let deviceFPmsgHeader = {
                clientIPAddress: "192.168.0.122",
                connectionMode: "WIFI",
                country: "United States",
                deviceManufacturer: "Xiaomi",
                deviceModelNo: "Mi A2",
                dualSim: false,
                imeiNo: "09d9212a07553637",
                latitude: "",
                longitude: "",
                nwProvider: "xxxxxxxx",
                osName: "Android",
                osVersion: 28,
                timezone: "Asia/Kolkata",
                versionCode: "58",
                versionName: "5.5.1",
            };
            let employeeDetails = { data, deviceFPmsgHeader, msgHeader };
            axios
                .post(url, employeeDetails)
                .then(function (response) {
                    dispatch(routeChange("end"));
                    console.log(response);
                    const JSONData = response.data;
                    const transactionRefNoNew = String(JSONData.data.transactionRefNo).replace(
                        /_/g,
                        "A"
                    );
                    console.log("this is new transref", transactionRefNoNew);
                    // let tempDisplay = String(self.displayText).replace(/₹/g, "");
                    // let displayValue = String(tempDisplay).replace(/,/g, "");
                    // let disVal = Number.parseFloat(displayValue).toFixed();
                    setUserDetails((prev) => ({ ...prev, customerId: JSONData.data.customerId }))
                    if (paymentDelected === true) {
                        // window.open("intent://pay?pa="+self.vpa+"&pn="+self.vpaName+"&mc=&tid=&tr="+self.loanAccountNo+"&tn=PayA"+self.transactionRefNo+"A"+self.custID+"&am="+disVal+"&cu=INR&refUrl=#Intent;scheme=upi;end");

                        window.open(
                            "upi://pay?pa=" +
                            loan.vpa +
                            "&pn=" +
                            loan.vpaName +
                            "&am=" +
                            amount +
                            "&tid=" +
                            transactionRefNoNew +
                            "&cu=INR"
                        );
                        // upi://pay?pa=supermoney@yesbank&pn=GetClarity+Fintech+Services+Private+Limited&am=10&tid=&tr=&tn=&t&cu=INR
                    } else {
                        // self.mediumSend = "RAZORPAY";

                        // console.log("display Amount == " + disVal * 100);
                        // let options = {
                        //     key: "rzp_uat_T9ozZwCcLc9csb", // Enter the Key ID generated from the Dashboard
                        //     amount: disVal * 100, // INR 299.35
                        //     name: "Get Clarity Fintech Services Pvt",

                        //     image:
                        //         "https://s3-ap-southeast-1.amazonaws.com/pubasset.mintwalk.com/images/companylogos/supermoney_logo.png",
                        //     //"order_id": "order_9A33XWu170gUtm",//Order ID is generated as Orders API has been implemented. Refer the Checkout form table given below
                        //     handler: function (response) {
                        //         // alert(response.razorpay_payment_id);
                        //         console.log("this is the payment response", response);
                        //         self.repaymentCallbackSuccess(response.razorpay_payment_id);
                        //     },
                        //     modal: {
                        //         ondismiss: function () {
                        //             console.log("Checkout form closed");
                        //         },
                        //     },
                        //     prefill: {
                        //         name: self.clientName,
                        //         email: self.email,
                        //         contact: self.mobileNo,
                        //     },
                        //     notes: {
                        //         transactionRefNo: self.transactionRefNo,
                        //     },
                        //     theme: {
                        //         color: "#97c93e",
                        //     },
                        // };

                        // self.hitPayment(options);
                    }
                })
                .catch(function (error) {
                    // handle error
                    console.log("display  ==" + error);
                })
                .finally(function () {
                    // always executed
                });
        } else {
            const minAmount = overDueUpcoming * 0.1 > 500 ? overDueUpcoming * 0.1 : 500;

            if (amount < minAmount) {
                setAlert({
                    status: true,
                    message: 'Enter amount greater than minimum amount',
                });
            } else {
                setAlert({
                    status: true,
                    message:
                        loan.overDueAmountAdjusted > 0
                            ? 'Put custom amount less than total overdue amount'
                            : 'Put custom amount less than total due.',
                });
            }
        }
    };

    const shouldShowTabs =
        (invoiceLoanList.length > 0 || invoiceLoanListOverDue.length > 0) &&
        (personalLoanList.length > 0 || personalLoanListOverDue.length > 0);

    const repaymentTitle =
        personalLoanList.length === 0 && personalLoanListOverDue.length === 0
            ? 'Invoice Repayment'
            : 'Repayment';
    
    const displayVal = async () => {
        const rp = new URLSearchParams(window.location.search).get('rp');
        
        if(rp != undefined){
            dispatch(routeChange('start'))
            console.log(rp);
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const url = `supermoney-service/payment/details/get/v4?rp=${rp}`;
            axios
                .get(url, config)
                .then(function (response) {
                    // handle success

                    const JSONData = response.data.getPaymentDetails;
                    // self.loanList = JSONData.data;
                    // self.custID = JSONData.customerId;
                    // self.companyName = JSONData.companyName;
                    JSONData.data.forEach((loan: any, index: number) => {
                        if (loan.relatedId.length != 0) {
                            if (loan.overDueAmountAdjusted > 0) {
                                setInvoiceLoanListOverDue((prev) => [...prev, loan]);
                            }
                        } else {
                            if (loan.overDueAmountAdjusted > 0) {
                                setPersonalLoanListOverDue((prev) => [...prev, loan]);
                            }
                        }
                    });

                    JSONData.data.forEach((loan:any, index: number) => {
                        if (loan.relatedId.length != 0) {
                            if (
                                loan.totalOutstanding > 0 &&
                                loan.overDueAmountAdjusted == 0
                            ) {
                                setInvoiceLoanList((prev) => [...prev, loan]);
                            }
                        } else {
                            if (
                                loan.totalOutstanding > 0 &&
                                loan.overDueAmountAdjusted == 0
                            ) {
                                setPersonalLoanList((prev) => [...prev, loan]);
                            }
                        }
                    });

                    if (
                        invoiceLoanList.length == 0 &&
                        invoiceLoanListOverDue.length == 0
                    ) {
                        // self.tab = 1;
                        setSelectedTabIndex(1)
                    } else {
                        // self.tab = 1;
                        // self.tab = 0;
                        setSelectedTabIndex(0)
                    }

                    if (
                        (invoiceLoanList.length > 0 ||
                            invoiceLoanListOverDue.length > 0) &&
                        (personalLoanList.length > 0 ||
                            personalLoanListOverDue.length > 0)
                    ) {
                        setItems(["Invoice", "Personal Loans"]);
                    } else if (
                        invoiceLoanList.length > 0 ||
                        invoiceLoanListOverDue.length > 0
                    ) {
                        setItems(["Invoice"]);
                    } else {
                        setItems(["Personal Loans"]);
                    }

                    // self.mobileNo = JSONData.mobileNo;
                    setUserDetails({ customerId: JSONData.customerId, mobileNumber: JSONData.mobileNo})

                    if (
                        invoiceLoanList.length == 0 &&
                        invoiceLoanListOverDue.length == 0 &&
                        personalLoanList.length == 0 &&
                        personalLoanListOverDue.length == 0
                    ) {
                        navigate('/noDue')
                    }

                    dispatch(routeChange('end'))
                })
                .catch(function (error) {
                    // handle error
                    console.log("display  ==" + error);
                })
                .finally(function () {
                    // always executed
                });
        } else {
            let url = window.location.href;
            let code = url.substring(33, 39);
            window.open("https://www.supermoney.in/PA/#/?rp=" + code, "_blank");
            navigate('/Error')
        }
    }

    const calculateNextDate = (loanEmiData: any) => {
        let emiDate = "";
        for (const element of loanEmiData) {
            if (parseFloat(element.loanEmiAmountAdjusted) > 0.0) {
                emiDate = element.loanRepaymentDate;
                break;
            }
        }

        return emiDate;
    }

    const calculateMinimum = (overDueUpcoming: number) => {
        if (overDueUpcoming * 0.1 <= 500) {
            if (overDueUpcoming <= 500) {
                return overDueUpcoming;
            } else {
                return 500;
            }
        } else {
            return overDueUpcoming * 0.1;
        }
    }

    const getSupplierName = async (id: string, position: number) => {
        try {
            const response = await getInvoiceDetails(id);
            const details = response.invoiceDetails.APPROVED.invoiceDetailsResp[0];

            setInvoiceLoanList(prev => {
                const updated = [...prev];
                updated[position] = {
                    ...updated[position],
                    supplierName: details.supplierDetails.name,
                    purchaseOrderID: details.purchaseOrderNumber,
                };
                return updated;
            });

            console.log('===', details.cancelAmount);
        } catch (error) {
            console.error('Failed to fetch supplier details:', error);
        }
    };

    const getSupplierNameOverDue = async (id: string, position: number) => {
        try {
            const response = await getInvoiceDetails(id);
            const details = response.invoiceDetails.APPROVED.invoiceDetailsResp[0];

            setInvoiceLoanListOverDue(prev => {
                const updated = [...prev];
                updated[position] = {
                    ...updated[position],
                    supplierName: details.supplierDetails.name,
                    purchaseOrderID: details.purchaseOrderNumber,
                };
                return updated;
            });

            console.log('===', details.cancelAmount);
        } catch (error) {
            console.error('Failed to fetch supplier details:', error);
        }
    };

    const getInvoiceDetails = (id: any) => {
        let url =
            "/invoice-finance-services/invoice-services/finance/invoices/get/v3?id=" +
            id;
        return axios
            .get(url)
            .then((response) => response.data)
            .catch((error) => console.log(error));
    };

    const checkMinimum = (overDueUpcoming: number, checkAmount: number) => {
        if (overDueUpcoming * 0.1 > 500) {
            return (
                checkAmount >= overDueUpcoming * 0.1 &&
                checkAmount <= Math.ceil(overDueUpcoming)
            );
        } else {
            return checkAmount >= 500 && checkAmount <= Math.ceil(overDueUpcoming);
        }
    };

    useEffect(() => {
            displayVal();
    }, [])

    useEffect(() => {
        const fetchSupplierNames = async () => {
            for (let i = 0; i < invoiceLoanList.length; i++) {
                const { relatedId } = invoiceLoanList[i];
                if (relatedId !== undefined) {
                    await getSupplierName(relatedId, i);
                }
            }
        };

        if (invoiceLoanList.length > 0) {
            fetchSupplierNames();
        }
    }, [invoiceLoanList]);

    useEffect(() => {
        const fetchSupplierNames = async () => {
            for (let i = 0; i < invoiceLoanListOverDue.length; i++) {
                const { relatedId } = invoiceLoanListOverDue[i];
                if (relatedId !== undefined) {
                    await getSupplierNameOverDue(relatedId, i);
                }
            }
        };

        if (invoiceLoanListOverDue.length > 0) {
            fetchSupplierNames();
        }
    }, [invoiceLoanListOverDue]);

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                {alert.status && (
                    <div className="relative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full max-w-md shadow-md">
                        <span className="block sm:inline">{alert.message}</span>
                        <button
                            onClick={() => setAlert((prev) => ({ ...prev, status: false }))}
                            className="absolute top-2 right-2 text-red-700 hover:text-red-900"
                            aria-label="Dismiss"
                        >
                            &times;
                        </button>
                    </div>
                )}
                <div className='w-full mx-auto'>
                    <div className="flex flex-col items-center w-full font-montserrat">
                        <img
                            src="../../assets/img/supermoneylogo.png"
                            alt="SuperMoney Logo"
                            className="mt-[29px] mb-[15px] w-[118px]"
                        />

                        <div className="mb-[20px] text-[25px] font-bold text-[#4328ae]">
                            {repaymentTitle}
                        </div>
                    </div>
                </div>
                <div className="w-fit mx-auto font-montserrat">
                    {shouldShowTabs && (
                        <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
                            <TabList className="flex space-x-1 rounded-xl bg-blue-100 p-1">
                                {items.map((item, i) => (
                                    <Tab
                                        key={i}
                                        className={({ selected }) =>
                                            classNames(
                                                'w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg',
                                                selected
                                                    ? 'bg-white shadow'
                                                    : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'
                                            )
                                        }
                                    >
                                        {item}
                                    </Tab>
                                ))}
                            </TabList>
                            <TabPanels className="mt-4">
                                <TabPanel>
                                    <div className="p-4 bg-white rounded shadow">Invoice</div>
                                </TabPanel>
                                <TabPanel>
                                    <div className="p-4 bg-white rounded shadow">Personal Loans</div>
                                </TabPanel>
                            </TabPanels>
                        </TabGroup>
                    )}
                </div>
            </div>


            <div className="w-full max-w-4xl mx-auto font-montserrat" >
                <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex} >
                    <TabList className="flex space-x-2 mb-4" >
                        {
                            items.map((item, i) => (
                                <Tab
                                    key={i}
                                    className={({ selected }) =>
                                        `px-4 py-2 rounded font-semibold ${selected ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
                                        }`
                                    }
                                >
                                    {item}
                                </Tab>
                            ))}
                    </TabList>
                    < TabPanels >
                        <TabPanel>
                            {/* Invoice Tab */}
                            {
                                invoiceLoanListOverDue.length > 0 && (
                                    <div className="text-left text-red-500 mt-5 font-bold max-w-sm" > Overdue </div>
                                )
                            }
                            {
                                invoiceLoanListOverDue.map((loan, index) => (
                                    <div key={loan.loanApplicationReferenceNo} className="bg-white shadow rounded p-4 my-4 max-w-md" >
                                        <div className="flex justify-between" >
                                            <div>
                                                <div className="text-xs font-bold" > {loan.supplierName} </div>
                                                < div className="text-sm font-bold" > {loan.purchaseOrderID} </div>
                                            </div>
                                            < div className="text-right" >
                                                <div className="text-xs text-gray-500" > Due Date </div>
                                                < div className="text-sm font-bold text-gray-800" > {formatDate(calculateNextDate(loan.loanApplicationReferenceEmiData))
                                                } </div>
                                            </div>
                                        </div>
                                        < div className="flex justify-between mt-3" >
                                            <div>
                                                <div className="text-xs" > Accrued Interest </div>
                                                < div className="text-sm font-bold" >₹ {loan.interestPortion.toLocaleString()} </div>
                                            </div>
                                            < div className="text-right" >
                                                <div className="text-xs text-gray-500" >
                                                    {loan.overDueAmountAdjusted > 0 ? 'Total Overdue' : 'Total Due'}
                                                </div>
                                                < div className="text-sm font-bold text-red-500" >
                                                    ₹ {loan.overDueAmountAdjusted > 0 ? loan.overDueAmountAdjusted.toLocaleString() : loan.totalOutstanding.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        < div className="flex justify-between mt-3" >
                                            <div>
                                                <div className="text-xs" > Late payment fee </div>
                                                < div className="text-sm font-bold text-red-500" >₹ {loan.penaltyOutStanding.toLocaleString()} </div>
                                            </div>
                                            < div className="text-right" >
                                                <button
                                                    className={
                                                        `w-full mt-2 px-4 py-2 rounded text-white ${loan.overDueAmountAdjusted > 0 ? 'bg-red-500' : 'bg-blue-600'
                                                        }`
                                                    }
                                                    onClick={() =>
                                                        callPayment(
                                                            loan,
                                                            loan.overDueAmountAdjusted > 0 ? loan.overDueAmountAdjusted : loan.totalOutstanding
                                                        )
                                                    }
                                                >
                                                    Pay ₹{' '}
                                                    {loan.overDueAmountAdjusted > 0 ? loan.overDueAmountAdjusted : loan.totalOutstanding}
                                                </button>
                                            </div>
                                        </div>

                                        {
                                            calculateMinimum(
                                                loan.overDueAmountAdjusted > 0 ? loan.overDueAmountAdjusted : loan.totalOutstanding
                                            ) >= 500 && (
                                                <Disclosure>
                                                    {({ open }) => (
                                                        <>
                                                            <Disclosure.Button className="mt-4 text-purple-700 text-xs font-bold" >
                                                                Pay Custom Amount {open ? '▲' : '▼'}
                                                            </Disclosure.Button>
                                                            < Disclosure.Panel className="mt-2 flex gap-4" >
                                                                <div className="w-1/2" >
                                                                    <input
                                                                        type="number"
                                                                        className="w-full border rounded px-2 py-1 text-sm"
                                                                        placeholder="Amount"
                                                                        value={invoiceLoanListOverDueCustom[index] || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...invoiceLoanListOverDueCustom];
                                                                            updated[index] = parseFloat(e.target.value);
                                                                            setInvoiceLoanListOverDueCustom(updated);
                                                                        }
                                                                        }
                                                                    />
                                                                    < div className="text-xs text-left text-gray-500 mt-1" >
                                                                        Min Amount ₹{' '}
                                                                        {
                                                                            calculateMinimum(
                                                                                loan.overDueAmountAdjusted > 0
                                                                                    ? loan.overDueAmountAdjusted
                                                                                    : loan.totalOutstanding
                                                                            )
                                                                        }
                                                                    </div>
                                                                </div>
                                                                < div className="w-2/5" >
                                                                    <button
                                                                        className={
                                                                            `w-1/2 px-2 py-1 rounded text-white ${loan.overDueAmountAdjusted > 0 ? 'bg-red-500' : 'bg-blue-600'
                                                                            }`
                                                                        }
                                                                        onClick={() =>
                                                                            callPaymentCustom(loan, invoiceLoanListOverDueCustom[index])
                                                                        }
                                                                    >
                                                                        Pay
                                                                    </button>
                                                                </div>
                                                            </Disclosure.Panel>
                                                        </>
                                                    )}
                                                </Disclosure>
                                            )}
                                    </div>
                                ))}
                            {/* Repeat similar block for invoiceLoanList */}
                        </TabPanel> 
                        <TabPanel>
                            {/* Personal Tab */}
                            {
                                personalLoanListOverDue.length > 0 && (
                                    <div className="text-left text-red-500 mt-5 font-bold max-w-sm" > Overdue </div>
                                )
                            }
                            {
                                personalLoanListOverDue.map((loan, index) => (
                                    <div key={loan.loanApplicationReferenceNo} className="bg-white shadow rounded p-4 my-4 max-w-md" >
                                        <div className="flex justify-between" >
                                            <div className="text-sm font-bold text-gray-800" > Personal Loan </div>
                                            < div className="text-right" >
                                                <div className="text-xs text-gray-500" > Supermoney A / C </div>
                                                < div className="text-sm font-bold text-gray-800" > {loan.loanAccountNo} </div>
                                            </div>
                                        </div>
                                        < div className="flex justify-between mt-3" >
                                            <div>
                                                <div className="text-xs" > Late payment fee </div>
                                                < div className="text-sm font-bold text-red-500" >₹ {loan.penaltyOutStanding.toLocaleString()} </div>
                                            </div>
                                            < div className="text-right" >
                                                <div className="text-xs text-gray-500" > Due Date </div>
                                                < div className="text-sm font-bold text-gray-800" > {formatDate(calculateNextDate(loan.loanApplicationReferenceEmiData))
                                                } </div>
                                            </div>
                                        </div>
                                        < div className="flex justify-between mt-3" >
                                            <div>
                                                <div className="text-xs text-gray-500" >
                                                    {loan.overDueAmountAdjusted > 0 ? 'Total Overdue' : 'Total Due'}
                                                </div>
                                                < div className="text-sm font-bold text-red-500" >
                                                    ₹ {loan.overDueAmountAdjusted > 0 ? loan.overDueAmountAdjusted.toLocaleString() : loan.totalOutstanding.toLocaleString()}
                                                </div>
                                            </div>
                                            < div className="text-right" >
                                                <button
                                                    className={
                                                        `w-full mt-2 px-4 py-2 rounded text-white ${loan.overDueAmountAdjusted > 0 ? 'bg-red-500' : 'bg-blue-600'
                                                        }`
                                                    }
                                                    onClick={() =>
                                                        callPayment(
                                                            loan,
                                                            loan.overDueAmountAdjusted > 0 ? loan.overDueAmountAdjusted : loan.totalOutstanding
                                                        )
                                                    }
                                                >
                                                    Pay ₹{' '}
                                                    {loan.overDueAmountAdjusted > 0 ? loan.overDueAmountAdjusted : loan.totalOutstanding}
                                                </button>
                                            </div>
                                        </div>

                                        {
                                            calculateMinimum(
                                                loan.overDueAmountAdjusted > 0 ? loan.overDueAmountAdjusted : loan.totalOutstanding
                                            ) >= 500 && (
                                                <Disclosure>
                                                    {({ open }) => (
                                                        <>
                                                            <Disclosure.Button className="mt-4 text-purple-700 text-xs font-bold" >
                                                                Pay Custom Amount {open ? '▲' : '▼'}
                                                            </Disclosure.Button>
                                                            < Disclosure.Panel className="mt-2 flex gap-4" >
                                                                <div className="w-1/2" >
                                                                    <input
                                                                        type="number"
                                                                        className="w-full border rounded px-2 py-1 text-sm"
                                                                        placeholder="Amount"
                                                                        value={personalLoanListOverDueCustom[index] || ''}
                                                                        onChange={(e) => {
                                                                            const updated = [...personalLoanListOverDueCustom];
                                                                            updated[index] = parseFloat(e.target.value);
                                                                            setPersonalLoanListOverDueCustom(updated);
                                                                        }
                                                                        }
                                                                    />
                                                                    < div className="text-xs text-left text-gray-500 mt-1" >
                                                                        Min Amount ₹{' '}
                                                                        {
                                                                            calculateMinimum(
                                                                                loan.overDueAmountAdjusted > 0
                                                                                    ? loan.overDueAmountAdjusted
                                                                                    : loan.totalOutstanding
                                                                            )
                                                                        }
                                                                    </div>
                                                                </div>
                                                                < div className="w-2/5" >
                                                                    <button
                                                                        className={
                                                                            `w-1/2 px-2 py-1 rounded text-white ${loan.overDueAmountAdjusted > 0 ? 'bg-red-500' : 'bg-blue-600'
                                                                            }`
                                                                        }
                                                                        onClick={() =>
                                                                            callPaymentCustom(loan, personalLoanListOverDueCustom[index])
                                                                        }
                                                                    >
                                                                        Pay
                                                                    </button>
                                                                </div>
                                                            </Disclosure.Panel>
                                                        </>
                                                    )}
                                                </Disclosure>
                                            )}
                                    </div>
                                ))}
                            {/* Repeat similar block for personalLoanList */}
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </>
    );
};

export default Home;
