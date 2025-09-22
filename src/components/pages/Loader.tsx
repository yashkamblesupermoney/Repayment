// src/components/common/Loader.tsx
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import LoaderGif from '../../assets/loading.gif'

const Loader = () => {
    const isLoading = useSelector((state: RootState) => state.preloader.preloader)

    if (!isLoading) return null

    return (
        <div
            style={{
                position: 'fixed',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                zIndex: 100001,
                backfaceVisibility: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.5)',
            }}
        >
            <div
                style={{
                    width: 50,
                    height: 50,
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    backgroundPosition: 'center',
                    margin: '-25px 0 0 -25px',
                }}
            >
                <img src={LoaderGif} alt="loading..." width={64} height={64} />
            </div>
        </div>
    )
}

export default Loader