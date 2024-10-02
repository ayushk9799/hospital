import React from 'react'
import { Route, BrowserRouter as Router, Routes,Navigate } from "react-router-dom";
import App from './App';
import Home from './pages/Home';
import AboutPage from './pages/About';
import ContactPage from './pages/ContactUs';
const Navigation = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/dashboard" Component={App} />
        <Route path="/about" Component={AboutPage} />
        <Route path="/contact" Component={ContactPage} />
      </Routes>
    </Router>
  )
}

export default Navigation