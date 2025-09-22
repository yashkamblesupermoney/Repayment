import React from 'react';

interface Props {
    customAmount: string;
    setCustomAmount: (val: string) => void;
    callPaymentCustom: () => void;
}

const CustomAmountPanel: React.FC<Props> = ({ customAmount, setCustomAmount, callPaymentCustom }) => {
    return (
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Amount</label>
            <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="Enter amount"
            />
            <button
                onClick={callPaymentCustom}
                className="mt-3 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
                Pay Custom Amount
            </button>
        </div>
    );
};

export default CustomAmountPanel;
