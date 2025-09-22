import React from 'react';
import moment from 'moment';

interface Props {
    paymentList: any[];
    handleCheckboxChange: (index: number, checked: boolean) => void;
    callPayment: () => void;
    payNow: number;
    dial: () => void;
}

const RepaymentSchedule: React.FC<Props> = ({ paymentList, handleCheckboxChange, callPayment, payNow, dial }) => {
    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Repayment Schedule</h3>
            <ul className="space-y-3">
                {paymentList.map((item, index) => (
                    <li key={index} className="flex items-center justify-between bg-white p-3 rounded shadow">
                        <div>
                            <div className="text-sm font-medium">EMI #{item.position}</div>
                            <div className="text-xs text-gray-500">{moment(item.loanRepaymentDate).format('DD MMM YYYY')}</div>
                            <div className="text-xs text-gray-500">₹{item.loanEmiAmountAdjusted}</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                    </li>
                ))}
            </ul>

            {payNow > 0 && (
                <button
                    onClick={callPayment}
                    className="mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                    Pay ₹{payNow}
                </button>
            )}
            <button
                onClick={dial}
                className="flex items-center justify-center gap-2 border border-[#7E67DA] text-[#4328ae] font-bold text-sm px-4 py-2 w-[200px] my-2 rounded hover:bg-[#f3f0ff] transition-all"
                style={{ textTransform: 'none' }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#7E67DA]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 22 2 13.93 2 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z" />
                </svg>
                <span className="text-[#7E67DA]">Contact Us</span>
            </button>
        </div>
    );
};

export default RepaymentSchedule;
