import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import moment from 'moment';
import landingLogo from '../../assets/img/landinglogoblue.png';
import clouds from '../../assets/img/clouds.png';
import checkAnim from '../../assets/img/checkanim.gif';
import loadingAnim from '../../assets/img/loadinganim.gif';
import { useDispatch } from 'react-redux';
import { routeChange } from '../../store/preloaderSlice';

const PaymentSuccess: React.FC = () => {
    const dispatch = useDispatch();
    const [height, setHeight] = useState<number>(700);
    const [amount, setAmount] = useState<number>(0);
    const [returnUrl, setReturnUrl] = useState<string>('https://www.supermoney.in/IF/#/UpFrontLanding');
    const [countDown, setCountDown] = useState<number>(5);

    useEffect(() => {
        // dispatch(routeChange('end'));
        setHeight(document.documentElement.clientHeight);

        const query = new URLSearchParams(window.location.search);
        const amt = query.get('amount');
        if (amt) setAmount(Number(amt));

        fetchUrl();
    }, []);

    const fetchUrl = async () => {
        dispatch(routeChange('start'));
        try {
            const query = new URLSearchParams(window.location.search);
            const customerId = query.get('customerId');
            const applicationId = query.get('applicationId');

            const response = await axios.post('supermoney-service/customer/returnUrl/get', {
                customerId,
                applicationId,
            });

            const data = response.data;
            if (data.returnUrl && data.returnUrl.length > 0) {
                setReturnUrl(data.returnUrl);
            }
        } catch (error) {
            console.error('Error fetching return URL:', error);
        } finally {
            dispatch(routeChange('end'));
            startCountdown();
        }
    };

    const startCountdown = () => {
        if (countDown > 0) {
            setTimeout(() => {
                setCountDown((prev) => prev - 1);
                startCountdown();
            }, 1000);
        } else {
            window.location.href = returnUrl;
        }
    };

    return (
        <div
            className="bg-[#f2f0fb] font-montserrat max-w-[450px] mx-auto relative"
            style={{ height: `${height}px` }}
        >
            <img src={landingLogo} alt="Logo" className="w-[140px] mx-auto mt-[30px]" />
            <img src={clouds} alt="Clouds" className="w-full absolute top-[100px]" />

            <div className="min-w-[360px] mx-auto relative z-10">
                <img src={checkAnim} alt="Check Animation" className="w-full" />
                <div className="text-[#97c93e] text-[20px] font-bold text-center mt-[-100px]">
                    Payment Success!
                </div>
                <div className="text-[#616064] text-[16px] px-[10px] mt-2 text-center">
                    Payment of ₹ {amount.toLocaleString()}<br />
                    has been successful
                </div>
                <div className="text-[#616064] text-[12px] px-[10px] mt-[50px] text-center">
                    Redirecting you to SuperMoney homepage
                </div>
                <img src={loadingAnim} alt="Loading" className="w-[100px] mx-auto mt-2" />
            </div>
        </div>
    );
};

export default PaymentSuccess;
