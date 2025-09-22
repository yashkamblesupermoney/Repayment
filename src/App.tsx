import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import Loader from './components/pages/Loader';
import LoanList from './components/pages/LoanList';
import ErrorPage from './components/pages/ErrorPage';
import NoRepayment from './components/pages/NoRepayment';
import PaymentOption from './components/pages/PaymentOption';
import PaymentSuccess from './components/pages/PaymentSuccess';
import AllTransactions from './components/pages/AllTransactions';
import TransactionHistory from './components/pages/TransactionHistory';
import Repayment from './components/pages/Repayment';
import Home from './components/pages/Home';

function App() {
  const mode = useSelector((state: RootState) => state.theme.mode);

return (
    <div className={mode === "dark" ? "dark" : ""}>
      <Loader />
    <Router>
      <Routes>
        <Route path="/" element={<LoanList />} />
        <Route path="/PayemntOption" element={<PaymentOption />} />
        <Route path="/LoanList" element={<Home />} />
        <Route path="/Repayment" element={<Repayment />} />
        <Route path="/TransactionHistory" element={<TransactionHistory />} /> 
        <Route path="/AllTransactions" element={<AllTransactions/>} />
        <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
        <Route path="/NoDue" element={<NoRepayment />} />
        <Route path="/Error" element={<ErrorPage />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;


