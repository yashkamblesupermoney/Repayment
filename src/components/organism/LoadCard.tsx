import moment from 'moment';

interface LoanCardProps {
    loan: any;
    onCashback?: () => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onCashback }) => {
    const {
        lenderName,
        loanApplicationReferenceNo,
        totalOutstanding,
        overDueAmount,
        dueDate,
        cashBackApplicable,
        applyRefundAsCashback,
    } = loan;

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200">
            <div className="text-sm text-gray-500">{lenderName}</div>
            <div className="font-bold text-lg">{loanApplicationReferenceNo}</div>

            <div className="mt-2 text-sm">
                <div>Total Outstanding: ₹{totalOutstanding}</div>
                <div>Overdue Amount: ₹{overDueAmount}</div>
                <div>Due Date: {moment(dueDate).format('DD MMM YYYY')}</div>
            </div>

            {cashBackApplicable && applyRefundAsCashback && onCashback && (
                <button
                    className="mt-4 w-full bg-primary text-white py-2 rounded hover:bg-blue-600 transition"
                    onClick={onCashback}
                >
                    Apply Cashback
                </button>
            )}
        </div>
    );
};

export default LoanCard;
