import "./App.css";
import React, { useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import { ScrollArea } from "./components/ui/scroll-area";
import { Provider } from "react-redux";
import DischargeFormTemplates from "./pages/DischargeFormTemplates";
import { store } from "./redux/store";
import ConsentTemplatePreview from "./pages/ConsentTemplatePreview";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients } from "./redux/slices/patientSlice";
import { fetchStaffMembers } from "./redux/slices/staffSlice";
import { fetchTemplates } from "./redux/slices/templatesSlice";
import CreateRoom from "./pages/CreateRoom";
import Home from "./pages/Home";
import VerticalNav, {
  navItems,
} from "./components/custom/Navigations/VerticalNav";
import HorizontalNav from "./components/custom/Navigations/HorizontalNav";
import LabList from "./pages/LabList";
import LabRegDialog from "./components/custom/registration/LabRegDialog";
import AllLabTests from "./pages/AllLabTests";
import Statistics from "./pages/Statistics";
import Billings from "./pages/Billings";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import Rooms from "./pages/Rooms";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import StaffProfile from "./pages/StaffProfile";
import Appointments from "./pages/Appointments";
import Analytics from "./pages/Analytics";
import Pharmacy from "./pages/Pharmacy";
import PharmacyAllBills from "./pages/PharmacyAllBills";
import AddStaff from "./pages/AddStaff";
import { fetchDepartments } from "./redux/slices/departmentSlice";
import { fetchServices } from "./redux/slices/serviceSlice";
import { fetchRooms } from "./redux/slices/roomSlice";
import { fetchUserData } from "./redux/slices/userSlice";
import { fetchHospitalInfo } from "./redux/slices/HospitalSlice";
import CreateBloodWork from "./pages/CreateBloodWork"; // Add this import
import Lab from "./pages/Lab";
import { setLoading } from "./redux/slices/loaderSlice";
import DischargeSummary from "./pages/DischargeSummary";
import HospitalInfo from "./pages/HospitalInfo";
import Services from "./pages/Services";
import CreateServiceBill from "./pages/CreateServiceBill";
import AboutPage from "./pages/About";
import ContactPage from "./pages/ContactUs";
import Expenses from "./pages/Expenses";
import Customization from "./pages/Customization";
import PatientSearch from "./pages/PatientSearch";
import OPDProcedure from "./pages/OPDProcedure";
import QuickMenu from "./pages/QuickMenu";
import PatientOverview from "./pages/PatientOverview";
import AdmittedPatients from "./pages/AdmittedPatients";
import AddIPDServices from "./pages/AddIPDServices";
import CreateTestTemplate from "./pages/CreateTestTemplate";
import PrintingTemplates from "./pages/PrintingTemplates";
import DischargeTemplatePreview from "./pages/DischargeTemplatePreview";
import HeaderTemplatePreview from "./pages/HeaderTemplatePreview";
import OPDTemplatePreview from "./pages/OPDTemplatePreview";
import OPDRxTemplatePreview from "./pages/OPDRxTemplatePreview";
import OPDBillTokenPreview from "./pages/OPDBillTokenPreview";
import MergeTemplatePreview from "./pages/MergeTemplatePreview";
import PrefixSettings from "./pages/PrefixSettings";
import ViewBabies from "./pages/ViewBabies";
import BabyDetails from "./pages/BabyDetails";
import DepartmentManger from "./pages/DepartmentManger";
import ViewAllBabies from "./pages/ViewAllBabies";
import Payments from "./pages/Payments";
import LabTemplatesManager from "./pages/LabTemplatesManager";
import EditTestTemplate from "./pages/EditTestTemplate";
import LabTemplatePreview from "./pages/LabTemplatePreview";
import LabBillingTemplatePreview from "./pages/LabBillingTemplatePreview";
import { fetchHospitalSettings } from "./redux/slices/hospitalSettingsSlice";
import HospitalSettings from "./pages/HospitalSettings";
import ConsultationFees from "./pages/ConsultationFees";
import { fetchConsultationFees } from "./redux/slices/consultationFeeSlice";
import Subscription from "./pages/Subscription";
const AppContent = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loader.isLoading);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    dispatch(setLoading(true));

    // Get today's date in YYYY-MM-DD format
    const today = new Date()
      .toLocaleDateString("en-In")
      .split("/")
      .reverse()
      .join("-");

    dispatch(fetchUserData())
      .then(() => {
        if (isAuthenticated) {
          return Promise.all([
            dispatch(fetchPatients({ startDate: today })),
            dispatch(fetchConsultationFees()),
            dispatch(fetchStaffMembers()),
            dispatch(fetchDepartments()),
            dispatch(fetchRooms()),
            dispatch(fetchHospitalInfo()),
            dispatch(fetchServices()),
            dispatch(fetchTemplates()),
            dispatch(fetchHospitalSettings()),
          ]);
        }
      })
      .finally(() => {
        dispatch(setLoading(false));
        setIsInitializing(false);
      });
  }, [dispatch, isAuthenticated]);

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
      <ScrollArea className="h-screen">
        {isAuthenticated && (
          <HorizontalNav
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            navItems={navItems}
          />
        )}
        <div className="flex">
          {isAuthenticated && <VerticalNav isCollapsed={isCollapsed} />}
          <main
            className={`${
              isAuthenticated ? (isCollapsed ? "md:ml-16" : "md:ml-56") : ""
            } px-0 sm:px-4 w-full h-full bg-gray-50 transition-all duration-300`}
          >
            <Routes>
              <Route
                path="/"
                element={isAuthenticated ? <QuickMenu /> : <Home />}
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {isAuthenticated && (
                <>
                  <Route
                    path="/patient-overview/:patientId"
                    element={<PatientOverview />}
                  />
                  <Route path="/billings" element={<Billings />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route
                    path="/patients/:patientId"
                    element={<PatientDetails />}
                  />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/doctors" element={<Doctors />} />
                  <Route path="/rooms" element={<Rooms />} />
                  <Route path="/staff" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/staff/:staffId" element={<StaffProfile />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route
                    path="/pharmacy"
                    element={<Navigate to="/pharmacy/sales" replace />}
                  />
                  <Route path="/pharmacy/:tab" element={<Pharmacy />} />
                  <Route
                    path="/pharmacy/all-bills"
                    element={<PharmacyAllBills />}
                  />
                  <Route path="/addstaff" element={<AddStaff />} />
                  <Route path="/editstaff/:staffId" element={<AddStaff />} />
                  <Route path="/lab" element={<Lab />} />
                  <Route path="/lab/list" element={<LabList />} />
                  <Route path="/lab/registration" element={<LabRegDialog />} />
                  <Route path="/lab/all-tests" element={<AllLabTests />} />
                  <Route
                    path="/lab/blood-work/create"
                    element={<CreateBloodWork />}
                  />
                  <Route path="/create-room" element={<CreateRoom />} />
                  <Route
                    path="/patients/discharge/:patientId?"
                    element={<DischargeSummary />}
                  />
                  <Route
                    path="/patients/admitted"
                    element={<AdmittedPatients />}
                  />
                  <Route
                    path="/patients/add-services/:patientId"
                    element={<AddIPDServices />}
                  />
                  <Route path="/services" element={<Services />} />
                  <Route
                    path="/billings/create-service-bill"
                    element={<CreateServiceBill />}
                  />
                  <Route path="/statistics" element={<Statistics />} />
                  <Route
                    path="/billings/edit/:billId"
                    element={<CreateServiceBill />}
                  />
                  <Route
                    path="/settings/hospital-info"
                    element={<HospitalInfo />}
                  />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route
                    path="/settings/customization"
                    element={<Customization />}
                  />
                  <Route path="/search" element={<PatientSearch />} />
                  <Route
                    path="/opd-procedure/:patientId"
                    element={<OPDProcedure />}
                  />
                  <Route
                    path="/settings/lab-templates"
                    element={<LabTemplatesManager />}
                  />
                  <Route
                    path="/settings/create-test-template"
                    element={<CreateTestTemplate />}
                  />
                  <Route
                    path="/settings/printing-templates"
                    element={<PrintingTemplates />}
                  />
                  <Route
                    path="/settings/printing-templates/discharge-preview"
                    element={<DischargeTemplatePreview />}
                  />
                  <Route
                    path="/settings/printing-templates/header-preview"
                    element={<HeaderTemplatePreview />}
                  />
                  <Route
                    path="/settings/printing-templates/lab-billing-preview"
                    element={<LabBillingTemplatePreview />}
                  />
                  <Route
                    path="/settings/printing-templates/opd-preview"
                    element={<OPDTemplatePreview />}
                  />
                  <Route
                    path="/settings/printing-templates/opd-rx-preview"
                    element={<OPDRxTemplatePreview />}
                  />
                  <Route
                    path="/settings/printing-templates/opd-bill-token-preview"
                    element={<OPDBillTokenPreview />}
                  />
                  <Route
                    path="/settings/printing-templates/lab-report-preview"
                    element={<LabTemplatePreview />}
                  />
                  <Route
                    path="/settings/printing-templates/merge-template-preview"
                    element={<MergeTemplatePreview />}
                  />
                  <Route
                    path="/settings/printing-templates/consent-preview"
                    element={<ConsentTemplatePreview />}
                  />
                  <Route
                    path="/settings/prefix-settings"
                    element={<PrefixSettings />}
                  />
                  <Route
                    path="/settings/discharge-form-templates"
                    element={<DischargeFormTemplates />}
                  />
                  <Route
                    path="/patients/:ipdAdmissionId/babies"
                    element={<ViewBabies />}
                  />
                  <Route path="patients/babies" element={<ViewAllBabies />} />
                  <Route path="/babies/:babyId" element={<BabyDetails />} />
                  <Route
                    path="/settings/department"
                    element={<DepartmentManger />}
                  />
                  <Route
                    path="/settings/edit-test-template"
                    element={<EditTestTemplate />}
                  />
                  <Route
                    path="/settings/hospital-settings"
                    element={<HospitalSettings />}
                  />
                  <Route
                    path="/settings/consultation-fees"
                    element={<ConsultationFees />}
                  />
                  <Route path="/settings/subscription" element={<Subscription />} />
                </>

              )}
            </Routes>
          </main>
        </div>
      </ScrollArea>
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