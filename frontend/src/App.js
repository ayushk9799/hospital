import './App.css';
import React, { useState } from 'react'
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from './pages/Home';
import VerticalNav from './components/custom/Navigations/VerticalNav';
import HorizontalNav from './components/custom/Navigations/HorizontalNav';
import Dashboard from './pages/Dashboard';
import Billings from './pages/Billings';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Rooms from './pages/Rooms';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import StaffProfile from './pages/StaffProfile';
import Appointments from './pages/Appointments';
import Analytics from './pages/Analytics';
import Pharmacy from './pages/Pharmacy';
import PharmacyAllBills from './pages/PharmacyAllBills';

const App = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Router>
      <div className="flex flex-col relative">
        <HorizontalNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="flex">
          <VerticalNav isCollapsed={isCollapsed} />
          <main className={`${isCollapsed ? 'ml-16' : 'ml-56'} pl-4 pr-4 w-full h-full bg-gray-50`}>
            <Routes>
              <Route path='/' Component={Dashboard} />
              <Route path='/dashboard' Component={Dashboard} />
              <Route path='/billings' Component={Billings} />
              <Route path='/patients' Component={Patients} />
              <Route path='/patients/:patientId' Component={PatientDetails} />
              <Route path='/appointments' Component={Appointments} />
              <Route path='/rooms' Component={Rooms} />
              <Route path='/reports' Component={Reports} />
              <Route path='/settings' Component={Settings} />
              <Route path='/staff/:staffId' Component={StaffProfile} />
              <Route path='/analytics' Component={Analytics} />
              <Route path='/pharmacy' Component={Pharmacy} />
              <Route path='/pharmacy/all-bills' Component={PharmacyAllBills} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App