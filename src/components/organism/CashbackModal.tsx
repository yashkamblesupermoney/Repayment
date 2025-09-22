import { useState } from 'react';

interface CashbackModalProps {
    loan: any;
    onClose: () => void;
}

const CashbackModal: React.FC<CashbackModalProps> = ({ loan, onClose }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        const num = parseFloat(amount);
        if (isNaN(num) || num <= 0 || num > loan.totalOutstanding) {
            setError('Enter a valid cashback amount');
            return;
        }

        // Submit cashback logic here
        console.log('Cashback submitted:', num);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-md">
                <h2 className="text-lg font-bold mb-4">Apply Cashback</h2>
                <p className="text-sm mb-2">Loan: {loan.loanApplicationReferenceNo}</p>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter cashback amount"
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                />
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded text-gray-700">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded">
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CashbackModal;
