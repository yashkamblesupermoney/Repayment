import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
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
type Transactions = {
    transactionDate: string;
    amount: number;
};

const TransactionHistory: React.FC = () => {
    const [transactionList, setTransactionList] = useState<Transaction[]>([]);
    const [applicationList, setApplicationList] = useState<Application[]>([]);
    const [applicationSelected, setApplicationSelected] = useState<Application | null>(null);
    const [totalPaid, setTotalPaid] = useState<number>(0);
    const [series, setSeries] = useState([{ data: [0, 0, 0, 0, 0, 0] }]);
    const [finalMonths, setFinalMonths] = useState<string[]>([]);
    const mobile = '9920111300';
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const chartOptions: ApexOptions = {
        colors: ['#7E67DA', '#D1C4E9'],
        chart: {
            id: 'chart',
            toolbar: { show: false },
            animations: {
                enabled: true,
                speed: 800,
                animateGradually: { enabled: true, delay: 150 },
                dynamicAnimation: { enabled: true, speed: 350 },
            },
        },
        stroke: { curve: 'straight' as const, width: 2 },
        dataLabels: { enabled: false },
        tooltip: { enabled: false },
        xaxis: {
            categories: finalMonths,
            labels: {
                style: {
                    colors: '#A1A1A1',
                    fontSize: '12px',
                    fontFamily: 'Montserrat',
                },
            },
        },
        grid: { borderColor: '#EDE7F6' },
        yaxis: {
            labels: {
                formatter: (value: number) => `${value.toFixed(2)}K`,
                style: {
                    colors: '#A1A1A1',
                    fontSize: '12px',
                    fontFamily: 'Montserrat',
                },
            },
        },
    };

    useEffect(() => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();
        const months: string[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(monthNames[d.getMonth()]);
        }
        setFinalMonths(months);
    }, []);

    useEffect(() => {
        fetchPaymentDetails();
    }, []);

    useEffect(() => {
        if (applicationSelected) {
            fetchTransaction(applicationSelected.applicationId);
        }
    }, [applicationSelected]);

    const fetchPaymentDetails = async () => {
        dispatch(routeChange('start'))
        const rp = new URLSearchParams(window.location.search).get('rp');
        try {
            const response = await axios.get(`supermoney-service/payment/details/get/v4?rp=${rp}`);
            const data = response.data;
            const loans: any[] = [];
            data.getPaymentDetails.forEach((entry: any) => {
                const appId = entry.applicationId;
                entry.data.forEach((loan: any) => {
                    loan.applicationId = appId;
                    loans.push(loan);
                });
            });
            dispatch(routeChange('end'))
            fetchApplicationList();
        } catch (error) {
            console.error('Error fetching payment details:', error);
            dispatch(routeChange('end'))
            navigate('/noDue');
        }
    };

    const fetchApplicationList = async () => {
        dispatch(routeChange('start'))
        try {
            const response = await axios.post('supermoney-service/customer/application/get/v2', {
                customerId: new URLSearchParams(window.location.search).get('customerId'),
            });
            const apps = response.data.getCustomerApplicationResponseList;
            setApplicationList(apps);
            setApplicationSelected(apps[0]);
            dispatch(routeChange('end'))

        } catch (error) {
            dispatch(routeChange('end'))

            console.error('Error fetching applications:', error);
        }
    };

    const fetchTransaction = async (applicationId: string) => {
        dispatch(routeChange('start'))
        const customerId = new URLSearchParams(window.location.search).get('customerId');
        try {
            const response = await axios.post('supermoney-service/payment/transactions/get', {
                customerId,
                applicationId,
            });
            const transactions = response.data.transactionDetailsResp;
            setTransactionList(transactions);
            const paid = transactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
            setTotalPaid(paid);

            const monthlyTotals = finalMonths.map((month) => {
                const monthIndex = getMonthIndex(month);
                const total = transactions
                    .filter((t: Transactions) => new Date(t.transactionDate).getMonth() + 1 === monthIndex)
                    .reduce((sum: number, t: Transactions) => sum + t.amount, 0);
                return total / 1000;
            });


            setSeries([{ data: monthlyTotals }]);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactionList([]);
            setTotalPaid(0);
            setSeries([{ data: [0, 0, 0, 0, 0, 0] }]);
        }
    };

    const getMonthIndex = (month: string): number => {
        const map: { [key: string]: number } = {
            Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
            Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
        };
        return map[month];
    };

    const formatDate = (date: string) => moment(date).format('DD MMM, YYYY');

    const dial = () => {
        window.location.href = `tel:${mobile}`;
    };

    const goBack = () => {
        window.history.back();
    };

    const openAllTransaction = () => {
        const query = new URLSearchParams(window.location.search);
        navigate(`/AllTransactions?applicationId=${applicationSelected?.applicationId}&customerId=${query.get('customerId')}&rp=${query.get('rp')}`);
    };

    const downloadTransaction = () => {
        const headers = ['invoiceNo', 'transactionDate', 'loanId', 'amount', 'transactionRefNo'];
        let csv = 'S.No,' + headers.join(',') + '\r\n';
        transactionList.forEach((item, index) => {
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

    return (
        <div className="bg-[#f3f0fc] font-montserrat max-w-[450px] mx-auto min-h-screen p-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={goBack}>←</button>
                <div className="text-center font-bold text-[#4328ae]">Repayment History</div>
                <button onClick={dial}>📞</button>
            </div>

            <div className="bg-white rounded-t-[30px] p-4">
                <div className="text-sm text-[#666666] mb-2">
                    Amount Paid
                    <span className="pl-2 text-[#7e67da] text-base font-bold">
                        ₹ {totalPaid.toLocaleString()}
                    </span>
                </div>

                <ReactApexChart
                    type="line"
                    height={250}
                    options={{ ...chartOptions, xaxis: { ...chartOptions.xaxis, categories: finalMonths } }}
                    series={series}
                />

                <div className="mt-4 flex justify-between items-center">
                    <div className="w-full md:w-1/2 text-left">
                        <select
                            value={applicationSelected?.applicationId || ''}
                            onChange={(e) => {
                                const selected = applicationList.find(app => app.applicationId === e.target.value);
                                if (selected) setApplicationSelected(selected);
                            }}
                            className="text-[#4328ae] text-sm bg-[#ede7f6] rounded px-2 py-1 w-full"
                        >
                            {applicationList.map((app) => (
                                <option key={app.applicationId} value={app.applicationId}>
                                    {app.programDetails.programName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div
                        onClick={downloadTransaction}
                        className="flex items-center justify-end cursor-pointer border border-[#7e67da] rounded px-2 py-1 hover:bg-[#f3f0ff] transition-all"
                        style={{ width: 'fit-content' }}
                    >
                        ⬇️
                        <span className="text-[#7e67da] text-xs font-medium">Download</span>
                    </div>
                </div>
                <div className="bg-[#f7f5ff] rounded-lg p-3 mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[#636266] text-base font-bold">Transaction History</span>
                        <button onClick={openAllTransaction} className="text-[#7e67da] text-sm font-bold">
                            Show All
                        </button>
                    </div>

                    {transactionList.slice(0, 3).map((item, index) => (
                        <div key={index} className="py-2">
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

                            {(index !== transactionList.length - 1 && index !== 2) && (
                                <hr className="border-t-2 border-[#d1c4e9] mx-[-12px] mt-3" />
                            )}
                        </div>
                    ))}
                </div>
            </div >
        </div >
    );
};

export default TransactionHistory;
