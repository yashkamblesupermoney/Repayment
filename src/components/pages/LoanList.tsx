//neeed to work on this compoenent once UI is understood.
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { routeChange } from '../../store/preloaderSlice';
import CashbackModal from '../organism/CashbackModal';
import LoanCard from '../organism/LoadCard';

const LoanList = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const rp = queryParams.get('rp');

    const [tab, setTab] = useState<'INVOICE CREDIT' | 'PERSONAL CREDIT'>('INVOICE CREDIT');
    const [invoiceLoans, setInvoiceLoans] = useState<any[]>([]);
    const [personalLoans, setPersonalLoans] = useState<any[]>([]);
    const [cashbackModalOpen, setCashbackModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [userDetails, setUserDetails] = useState({ customerId: '', mobileNumber: '' })


    useEffect(() => {
        dispatch(routeChange('end'));
        if (!rp) {
            const url = window.location.href;
            const code = url.substring(33, 39);
            window.open(`https://www.supermoney.in/PA/#/?rp=${code}`, '_blank');
            navigate('/Error');
        } else {
            fetchLoanData(rp);
        }
    }, [rp]);

    const fetchLoanData = async (rp: string) => {
        dispatch(routeChange('start'));
        try {
            const res = await axios.get(`supermoney-service/payment/details/get/v4?rp=${rp}`);
            const data = res.data.getPaymentDetails.flatMap((group: any) =>
                group.data.map((loan: any) => ({
                    ...loan,
                    applicationId: group.applicationId,
                    applyRefundAsCashback: group.applyRefundAsCashback,
                    cashBackApplicable: group.cashBackApplicable,
                }))
            );

            const invoice = data.filter((loan: any) => loan.relatedId && (loan.overDueAmount > 0 || loan.totalOutstanding > 0));
            const personal = data.filter((loan: any) => !loan.relatedId && (loan.overDueAmount > 0 || loan.totalOutstanding > 0));

            setInvoiceLoans(invoice);
            setPersonalLoans(personal);
            setUserDetails({ customerId: res.data.customerId, mobileNumber: res.data.mobileNo })
            for (let i = 0; i < invoice.length; i++) {
                if (invoice[i].relatedId != undefined) {
                    getSupplierName(invoice[i].relatedId, i);
                }
            }
            setTab(invoice.length ? 'INVOICE CREDIT' : 'PERSONAL CREDIT');
            if (invoice.length == 0 && personal.length == 0) {
                navigate('/noDue')
            }

            dispatch(routeChange('end'))
            customerProfile();
        } catch (err) {
            console.error(err);
            navigate('/NoDue');
        } finally {
            dispatch(routeChange('end'));
        }
    };

    const customerProfile = async () => {
        dispatch(routeChange('start'))

        let url = "supermoney-service/customer/profile/v2";
        let request = {
            loginId: userDetails.mobileNumber,
            applicationId: new URLSearchParams(location.search).get('applicationId'),
        };

        axios
            .post(url, request)
            .then(function (response) {
                dispatch(routeChange('end'))
                const JSONData = response.data;
                if (JSONData.errorMessage === "") {
                    setUserDetails((prev) => ({...prev, customerId: JSONData.customerId}))
                    fetchRewardDetails();
                    fetchApplicationId();
                } else {
                    // self.alert = false;
                    console.log(JSONData.errorMessage);
                }
            })
            .catch(function (error) {
                // handle error
                console.log("display  ==" + error);
            })
            .finally(function () {
                //self.$store.commit("routeChange", "end");
            });
    }

    const fetchRewardDetails = async () => {
        dispatch(routeChange("start"));

        let url = "supermoney-service/cashback/getAccountDetails";
        let request = {
            customerId: userDetails.customerId,
            applicationId: new URLSearchParams(location.search).get('applicationId'),
        };

        axios
            .post(url, request)
            .then(function (response) {
                dispatch(routeChange('end'))
                const JSONData = response.data;
                if (JSONData.status) {
                    // self.rewardAvailable = JSONData.status;
                    // self.approvedCreditLimit =
                    //     JSONData.getCashbackAccountDetails[0].approvedCreditLimit;
                    // self.totalCashbackAmountAvailed =
                    //     JSONData.getCashbackAccountDetails[0].totalCashbackAmountAvailed;
                    // self.utilizedCashbackAmount =
                    //     JSONData.getCashbackAccountDetails[0].utilizedCashbackAmount;
                    // self.unutilizedCashbackAmount =
                    //     JSONData.getCashbackAccountDetails[0].unutilizedCashbackAmount;
                } else {
                    // self.rewardAvailable = JSONData.successFlag;
                }
            })
            .catch(function (error) {
                // handle error
                console.log("display  ==" + error);
            })
            .finally(function () {
                //self.$store.commit("routeChange", "end");
            });
    }

    const fetchApplicationId = async () => {
        dispatch(routeChange('start'))

        let url = "supermoney-service/customer/application/get/v2";
        let request = {
            customerId: userDetails.customerId,
            applicationId: new URLSearchParams(location.search).get('applicationId'),
        };

        axios
            .post(url, request)
            .then(function (response) {
                dispatch(routeChange('end'))
                console.log(response);
                const JSONData = response.data;
                // self.isCashbackAvailable = JSONData.getCustomerApplicationResponseList[0].programDetails.isCashbackAvailable;
            })
            .catch(function (error) {
                // handle error
                console.log("display  ==" + error);
            })
            .finally(function () {
                //self.$store.commit("routeChange", "end");
            });
    }

    const getSupplierName = async (id: string, position: number) => {
        try {
            const response = await getInvoiceDetails(id);
            const details = response.invoiceDetails.APPROVED.invoiceDetailsResp[0];

            setInvoiceLoans(prev => {
                const updated = [...prev];
                updated[position] = {
                    ...updated[position],
                    supplierName: details.supplierDetails.name,
                    purchaseOrderID: details.purchaseOrderNumber,
                    invoiceDate: details.createdAt,
                    cancelAmount: details.cancelAmount,
                };
                return updated;
            });

            console.log('===', details.cancelAmount);
        } catch (error) {
            console.error('Failed to fetch supplier details:', error);
        }
    };

    const getInvoiceDetails = async (id: any) =>  {
        let url =
            "/invoice-finance-services/invoice-services/finance/invoices/get/v3?id=" +
            id;
        return axios
            .get(url)
            .then((response) => response.data)
            .catch((error) => console.log(error));
    }

    return (
        <div className="max-w-[450px] mx-auto font-montserrat bg-white min-h-screen text-left">
            <div className="text-center pb-12">
                <img src="../../assets/img/landinglogoblue.png" alt="logo" className="mt-4 mx-auto" />
                {invoiceLoans.length > 0 && personalLoans.length > 0 && (
                    <div className="flex justify-around mt-4">
                        {['INVOICE CREDIT', 'PERSONAL CREDIT'].map((label) => (
                            <button
                                key={label}
                                className={`px-4 py-2 font-bold ${tab === label ? 'text-white bg-primary' : 'text-primary bg-white border'}`}
                                onClick={() => setTab(label as any)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-4">
                {tab === 'INVOICE CREDIT' &&
                    invoiceLoans.map((loan) => (
                        <LoanCard key={loan.loanApplicationReferenceNo} loan={loan} onCashback={() => {
                            setSelectedLoan(loan);
                            setCashbackModalOpen(true);
                        }} />
                    ))}

                {tab === 'PERSONAL CREDIT' &&
                    personalLoans.map((loan) => (
                        <LoanCard key={loan.loanApplicationReferenceNo} loan={loan} />
                    ))}
            </div>

            {cashbackModalOpen && selectedLoan && (
                <CashbackModal loan={selectedLoan} onClose={() => setCashbackModalOpen(false)} />
            )}
        </div>
    );
};

export default LoanList;
