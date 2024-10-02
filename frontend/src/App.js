import "./App.css";
import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from './redux/slices/patientSlice';
import { fetchStaffMembers } from './redux/slices/staffSlice';
import  CreateRoom  from './pages/CreateRoom';
import Home from './pages/Home';

import { getDoctors } from './redux/slices/staffSlice';
import VerticalNav from './components/custom/Navigations/VerticalNav';
import HorizontalNav from './components/custom/Navigations/HorizontalNav';
import Dashboard from './pages/Dashboard';
import Billings from './pages/Billings';
import Doctors from './pages/Doctors';
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
import AddStaff from './pages/AddStaff';
import { fetchDepartments } from "./redux/slices/departmentSlice";
import { fetchRooms } from "./redux/slices/roomSlice";
import { fetchUserData } from "./redux/slices/userSlice";
import { fetchHospitalInfo } from "./redux/slices/HospitalSlice";
import CreateBloodWork from './pages/CreateBloodWork'; // Add this import
import Lab from './pages/Lab';
import CreateLabReport from './pages/CreateLabReport';
import { setLoading } from './redux/slices/loaderSlice';
import DischargeSummary from './pages/DischargeSummary';
import HospitalInfo from './pages/HospitalInfo';
import Services from './pages/Services';
import CreateServiceBill from './pages/CreateServiceBill';
const AppContent = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loader.isLoading);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    dispatch(setLoading(true));
    dispatch(fetchUserData())
      .then(() => {
        if (isAuthenticated) {
          return Promise.all([
            dispatch(fetchPatients()),
            dispatch(fetchStaffMembers()),
            dispatch(fetchDepartments()),
            dispatch(fetchRooms()),
            dispatch(fetchHospitalInfo())
          ]);
        }
      })
      .finally(() => {
        dispatch(setLoading(false));
        setIsInitializing(false);
      });
  }, [dispatch,isAuthenticated]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-8 border-blue-200"></div>
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-t-8 border-blue-500 animate-spin"></div>
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-8 border-transparent animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative">
      {isLoading && <div className="youtube-loader"></div>}
      {isAuthenticated ? <HorizontalNav
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      /> : null}
      <div className="flex">
        {isAuthenticated ? <VerticalNav isCollapsed={isCollapsed} /> : null}
        <main
          className={`${
            isCollapsed ? "ml-16" : "ml-56"
          } pl-4 pr-4 w-full h-full bg-gray-50`}
        >
          <Routes>
           {isAuthenticated ? <Route path='/' Component={Dashboard} /> : <Route path='/' Component={Home} />}
            {/* <Route path='/dashboard' Component={Dashboard} /> */}
            <Route path='/billings' Component={Billings} />
            <Route path='/patients' Component={Patients} />
            <Route path='/patients/:patientId' Component={PatientDetails} />
            <Route path='/appointments' Component={Appointments} />
            <Route path='/doctors' Component={Doctors} />
            <Route path='/rooms' Component={Rooms} />
            <Route path='/reports' Component={Reports} />
            <Route path='/settings' Component={Settings} />
            <Route path='/staff/:staffId' Component={StaffProfile} />
            <Route path='/analytics' Component={Analytics} />
            <Route path='/pharmacy' element={<Navigate to="/pharmacy/dashboard" replace />} />
            <Route path='/pharmacy/:tab' Component={Pharmacy} />
            <Route path='/pharmacy/all-bills' Component={PharmacyAllBills} />
            <Route path='/addstaff' Component={AddStaff} />
            <Route path='/lab' element={<Lab />} />
            <Route path='/lab/create/:category/:type' element={<CreateLabReport />} />
            <Route path='/lab/blood-work/create' element={<CreateBloodWork />} />
            <Route path='/create-room' Component={CreateRoom} />
            <Route path="/patients/discharge/:patientId" element={<DischargeSummary />} />
            <Route path='/services' Component={Services} />
            <Route path='/billings/create-service-bill' Component={CreateServiceBill} />
            <Route path='/billings/edit/:billId' Component={CreateServiceBill} />
            <Route path='/settings/hospital-info' Component={HospitalInfo} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
};

export default App;
