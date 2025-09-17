import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import STLSlicer from "./components/Slicer";
import Header from "./components/Header";
import HelpSection from "./components/Help";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import HelpRequests from "./components/AdminHelp";
import Checkout from "./components/Checkout";
import LoginPage from "./components/Login";
import SignupPage from "./components/Signup";



function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<STLSlicer />} />
          <Route path="/help" element={<HelpSection />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/adminhelp" element={<HelpRequests />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
