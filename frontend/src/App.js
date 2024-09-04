import "./App.css";
import React, { useEffect,useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useDispatch } from 'react-redux';
import { fetchPatients } from './redux/slices/patientSlice';
import { fetchStaffMembers } from './redux/slices/staffSlice';
import { getDoctors } from './redux/slices/staffSlice';
import Home from './pages/Home';
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

const AppContent = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchStaffMembers());
    dispatch(fetchDepartments());
    dispatch(fetchRooms())
    dispatch(getDoctors());
  }, [dispatch]);

  return (
    <div className="flex flex-col relative">
      <HorizontalNav
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className="flex">
        <VerticalNav isCollapsed={isCollapsed} />
        <main
          className={`${
            isCollapsed ? "ml-16" : "ml-56"
          } pl-4 pr-4 w-full h-full bg-gray-50`}
        >
          <Routes>
            <Route path='/' Component={Dashboard} />
            <Route path='/dashboard' Component={Dashboard} />
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
            <Route path='/pharmacy' Component={Pharmacy} />
            <Route path='/pharmacy/all-bills' Component={PharmacyAllBills} />
            <Route path='/addstaff' Component={AddStaff} />
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
