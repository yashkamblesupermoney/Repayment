import React, { useEffect, lazy, Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/store';
import Loader from './components/pages/Loader';
// import ErrorPage from './components/pages/ErrorPage';
// import NoRepayment from './components/pages/NoRepayment';
// import PaymentOption from './components/pages/PaymentOption';
// import PaymentSuccess from './components/pages/PaymentSuccess';
// import AllTransactions from './components/pages/AllTransactions';
// import TransactionHistory from './components/pages/TransactionHistory';
// import Repayment from './components/pages/Repayment';
// import Home from './components/pages/Home';
// import LoanList from './components/pages/LoanList';
import axios from 'axios';
import { setTheme } from './store/themeSlice';

const PaymentOption = lazy(() => import('./components/pages/PaymentOption'));
const LoanList = lazy(() => import('./components/pages/LoanList'));
const Home = lazy(() => import('./components/pages/Home'));
const Repayment = lazy(() => import('./components/pages/Repayment'));
const TransactionHistory = lazy(() => import('./components/pages/TransactionHistory'));
const AllTransactions = lazy(() => import('./components/pages/AllTransactions'));
const PaymentSuccess = lazy(() => import('./components/pages/PaymentSuccess'));
const NoRepayment = lazy(() => import('./components/pages/NoRepayment'));
const ErrorPage = lazy(() => import('./components/pages/ErrorPage'));


function App() {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);
  axios.defaults.baseURL = "https://uat.supermoney.in/";
  axios.defaults.headers.common["Authorization"] = "AUTH_TOKEN";
  axios.defaults.headers.common["Content-Type"] = "application/json";

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      dispatch(setTheme(e.matches ? 'dark' : 'light'));
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [dispatch]);

return (
    <div className={mode === "dark" ? "dark" : ""}>
      <Loader/>
    <Suspense fallback={<>Loading....</>}>
      <Router>
      <Routes>
        <Route path="/" element={<LoanList />} />
        <Route path="/PaymentOption" element={<PaymentOption />} />
        <Route path="/LoanList" element={<Home />} />
        <Route path="/Repayment" element={<Repayment />} />
        <Route path="/TransactionHistory" element={<TransactionHistory />} />
        <Route path="/AllTransactions" element={<AllTransactions />} />
        <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
        <Route path="/NoDue" element={<NoRepayment />} />
        <Route path="/Error" element={<ErrorPage />} />
      </Routes>
      </Router>
    </Suspense>

    </div>
  );
}

export default App;


