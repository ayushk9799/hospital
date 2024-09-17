import "./App.css";
import React, { useEffect,useState } from "react";
import { Route, BrowserRouter as Router, Routes,Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from './redux/slices/patientSlice';
import { fetchStaffMembers } from './redux/slices/staffSlice';
import  CreateRoom  from './pages/CreateRoom';
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
import CreateBloodWork from './pages/CreateBloodWork'; // Add this import
import Lab from './pages/Lab';
import CreateLabReport from './pages/CreateLabReport';
import { setLoading } from './redux/slices/loaderSlice';

const AppContent = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loader.isLoading);

  useEffect(() => {
    Promise.all([
      dispatch(fetchPatients()),
      dispatch(fetchStaffMembers()),
      dispatch(fetchDepartments()),
       dispatch(fetchRooms()),
      dispatch(getDoctors())
    ]).then(() => {
      dispatch(setLoading(false));
    });
  }, [dispatch]); 

  return (
    <div className="flex flex-col relative">
      {isLoading && <div className="youtube-loader"></div>}
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
            <Route path='/lab' element={<Lab />} />
            <Route path='/lab/create/:category/:type' element={<CreateLabReport />} />
            <Route path='/lab/blood-work/create' element={<CreateBloodWork />} />
            <Route path='/create-room' Component={CreateRoom} />
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
