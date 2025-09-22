import { useEffect } from 'react';

interface SnackbarProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg z-50">
            {message}
        </div>
    );
};

export default Snackbar;
