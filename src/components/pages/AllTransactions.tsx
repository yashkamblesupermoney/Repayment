import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import ReactApexChart from 'react-apexcharts';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { routeChange } from '../../store/preloaderSlice';

interface Transaction {
    invoiceNo: string;
    transactionDate: string;
    loanId: string;
    amount: number;
    transactionRefNo: string;
}

interface Application {
    applicationId: string;
    programDetails: {
        programName: string;
    };
}
const AllTransactions: React.FC = () => {
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [transactionList, setTransactionList] = useState<Transaction[]>([]);
    const [applicationList, setApplicationList] = useState<Application[]>([]);
    const [applicationSelected, setApplicationSelected] = useState<Application | null>(null);
    const [loanList, setLoanList] = useState<any[]>([]);
    const [totalList, setTotalList] = useState<any[]>([]);
    const [companyName, setCompanyName] = useState('');
    const [mobile] = useState('9920111300');
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const series = [{ data: [5, 10, 4, 1.5, 5, 0] }];

    useEffect(() => {
        displayVal();
    }, []);

    const formatDate = (date: string) => moment(date).format('DD MMM, YYYY');

    const displayVal = async () => {
        dispatch(routeChange('start'))
        try {
            const rp = new URLSearchParams(window.location.search).get('rp');
            const url = `supermoney-service/payment/details/get/v4?rp=${rp}`;
            const response = await axios.get(url);
            const data = response.data;

            setCompanyName(data.companyName);
            setTotalList(data.getPaymentDetails);

            const loans: any[] = [];
            data.getPaymentDetails.forEach((listLoan: any) => {
                const applicationID = listLoan.applicationId;
                listLoan.data.forEach((loan: any) => {
                    loan.applicationId = applicationID;
                    loans.push(loan);
                });
            });
            setLoanList(loans);
            dispatch(routeChange('end'))
            fetchApplicationId();

        } catch (error) {
            console.error('display ==', error);
            dispatch(routeChange('end'))

           navigate('/noDue');
        }
    };

    const fetchApplicationId = async () => {
        dispatch(routeChange('start'))
        try {
            const customerId = new URLSearchParams(window.location.search).get('customerId');
            const response = await axios.post('supermoney-service/customer/application/get/v2', {
                customerId,
            });
            const data = response.data;
            setApplicationList(data.getCustomerApplicationResponseList);
            setApplicationSelected(data.getCustomerApplicationResponseList[0]);
            dispatch(routeChange('end'))

        } catch (error) {
            console.error(error);
            dispatch(routeChange('end'))

        }
    };

    useEffect(() => {
        if (applicationSelected) {
            fetchTransaction(applicationSelected.applicationId);
        }
    }, [applicationSelected]);

    const fetchTransaction = async (applicationId: string) => {
        dispatch(routeChange('start'))

        try {
            const customerId = new URLSearchParams(window.location.search).get('customerId');
            const response = await axios.post('supermoney-service/payment/transactions/get', {
                customerId,
                applicationId,
            });
            setTransactionList(response.data.transactionDetailsResp);
            dispatch(routeChange('end'))

        } catch (error) {
            console.error(error);
            setTransactionList([]);
            dispatch(routeChange('end'))

        }
    };

    const filteredTransactions = invoiceNumber.length === 0
        ? transactionList
        : transactionList.filter((item) =>
            item.invoiceNo.toLowerCase().includes(invoiceNumber.toLowerCase())
        );

    const downloadTransaction = () => {
        const headers = ['invoiceNo', 'transactionDate', 'loanId', 'amount', 'transactionRefNo'];
        let csv = 'S.No,' + headers.join(',') + '\r\n';
        filteredTransactions.forEach((item, index) => {
            const row = [index + 1, ...headers.map((h) => item[h as keyof Transaction])].join(',');
            csv += row + '\r\n';
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/xls;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Transactions_${applicationSelected?.applicationId}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const dial = () => {
        window.location.href = `tel:${mobile}`;
    };

    const goBack = () => {
        window.history.back();
    };

    return (
        <div className="max-w-[450px] mx-auto bg-[#f3f0fc] font-montserrat p-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={goBack}>←</button>
                <div className="text-center font-bold text-[#4328ae]">Transaction History</div>
                <button onClick={dial}>📞</button>
            </div>

            <select
                className="w-full bg-[#ede7f6] text-[#4328ae] text-sm rounded p-2 mb-4"
                value={applicationSelected?.applicationId || ''}
                onChange={(e) => {
                    const selected = applicationList.find(app => app.applicationId === e.target.value);
                    if (selected) setApplicationSelected(selected);
                }}
            >
                {applicationList.map((app) => (
                    <option key={app.applicationId} value={app.applicationId}>
                        {app.programDetails.programName}
                    </option>
                ))}
            </select>

            <input
                type="text"
                placeholder="Enter Invoice No."
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full border rounded p-2 mb-4"
            />

            <button
                onClick={downloadTransaction}
                className="text-[#7e67da] border border-[#7e67da] rounded px-3 py-1 mb-4"
            >
                ⬇ Download
            </button>

            <div className="bg-white rounded-lg p-4">
                {filteredTransactions.map((item, index) => (
                    <div key={index} className="mb-4">
                        <div className="flex justify-between text-sm text-gray-500">
                            <div>
                                <div>Invoice No.</div>
                                <div className="text-[#7e67da] text-base">{item.invoiceNo}</div>
                            </div>
                            <div className="text-right">
                                <div>Date</div>
                                <div>{formatDate(item.transactionDate)}</div>
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-gray-500">
                            <div>
                                <div>Loan#</div>
                                <div>{item.loanId}</div>
                            </div>
                            <div className="text-right">
                                <div>Amount</div>
                                <div>₹ {item.amount.toLocaleString()}</div>
                            </div>
                        </div>
                        {index !== filteredTransactions.length - 1 && (
                            <hr className="border-t-2 border-[#d1c4e9] mt-3" />
                        )}
                    </div>
                ))}
            </div>

            {/* ApexChart Example */}
            <div className="mt-6">
                <ReactApexChart
                    type="line"
                    series={series}
                    options={{
                        chart: { id: 'basic-line' },
                        xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
                    }}
                    height={250}
                />
            </div>
        </div>
    );
};

export default AllTransactions;
