// ErrorPage.tsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import supermoneyLogo from '../../assets/img/supermoneylogo.png';
import errorImage from '../../assets/img/errorUrlImag.jpg';

const ErrorPage: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: 'routeChange', payload: 'end' });
    }, [dispatch]);

    return (
        <div className="udyoog screen min-h-screen flex flex-col items-center bg-white">
            <img
                src={supermoneyLogo}
                alt="SuperMoney Logo"
                className="w-[120px] mt-5 mb-5"
            />
            <div className="text-center">
                <div className="font-black text-[18px] text-[#3f2ca6] w-[360px] mx-auto">
                    <strong>OOPS! Something went wrong. Please contact our support team.</strong>
                </div>
                <img
                    src={errorImage}
                    alt="Girl in a jacket"
                    width={240}
                    height={310}
                    className="mt-[50px] mx-auto"
                />
            </div>
        </div>
    );
};

export default ErrorPage;
