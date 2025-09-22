import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/themeSlice';
import { RootState } from '../../store/store';

const ThemeToggle = () => {
    const dispatch = useDispatch();
    const theme = useSelector((state: RootState) => state.theme.mode); // assuming you store theme as boolean

    return (
        <div
            onClick={() => dispatch(toggleTheme())}
            className={`w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer transition-colors duration-300`}
        >
            <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}
            />
        </div>
    );
};

export default ThemeToggle;
