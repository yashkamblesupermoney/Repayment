// NoRepayment.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import onboardingSuccess from '../../assets/img/onboardingsuccess.gif';
import { routeChange } from '../../store/preloaderSlice';
// import maskGroupRemove from '../assets/img/MaskGroupRemove.png'; // Hidden image
// import personWithLadder from '../assets/img/personWithLadder.png'; // Commented out in original

const NoRepayment: React.FC = () => {
    const dispatch = useDispatch();
    const [height, setHeight] = useState<number>(700);

    useEffect(() => {
        dispatch(routeChange('end'));
        setHeight(document.documentElement.clientHeight);
    }, [dispatch]);

    const countDownTimer = () => {
        window.location.href = 'https://www.supermoney.in/IF/#/UpFrontLanding';
    };

    return (
        <div className="min-h-screen  flex justify-center">
        <div
                className="max-w-[450px] w-full text-center bg-[#4328ae] font-montserrat"
            style={{ height: `${height}px` }}
        >
            <div className="pb-[50px]">
                {/* Hidden image */}
                {/* <img
          src={maskGroupRemove}
          alt="Mask Group"
          className="w-[120px] ml-[40px] mt-[20px] hidden"
        /> */}

                <img
                    src={onboardingSuccess}
                    alt="Onboarding Success"
                    width={300}
                    className="mx-auto"
                />

                <div className="text-left px-[25px] font-black text-[34px] text-white mt-6">
                    <strong>No Repayments dues!</strong>
                </div>

                {/* Optional image */}
                {/* <img
          src={personWithLadder}
          alt="Person with Ladder"
          className="ml-[50px] mt-[20px] mb-[20px]"
        /> */}

                <div className="text-left px-[25px] text-[15px] text-white mt-4 leading-relaxed">
                    Great! There are no upcoming<br />
                    payments against your credits.
                </div>

                <div className="fixed bottom-0 w-full max-w-[450px] px-[12px] mt-[20px] text-center">
                        <div className="m-[20px] text-center">
                            <button
                                onClick={countDownTimer}
                                className="w-full bg-white rounded-[12px] py-2 cursor-pointer"
                            >
                                <div className="text-[#4328ae] font-bold capitalize">
                                    Back To Homepage
                                </div>
                            </button>
                        </div>

                </div>
            </div>
        </div>
        </div>
    );
};

export default NoRepayment;
