import React from 'react';
import moment from 'moment';

interface Props {
    loan: any;
}

const InstallmentDetails: React.FC<Props> = ({ loan }) => {
    if (!loan) return null;

    const nextDate = loan.loanApplicationReferenceEmiData.find(
        (item: any) => parseFloat(item.loanEmiAmountAdjusted) > 0.0
    )?.loanRepaymentDate;

    return (
        <div className="mt-4">
            <div className="text-sm text-gray-600">Loan ID: {loan.loanApplicationReferenceNo}</div>
            <div className="text-sm text-gray-600">Next Due: {moment(nextDate).format('DD MMM YYYY')}</div>
        </div>
    );
};

export default InstallmentDetails;
