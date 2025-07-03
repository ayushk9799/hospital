import { useState, useEffect } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import AppointmentsQueue from "../components/custom/appointments/AppointmentsQueue";
import OPDModule from "../components/custom/doctors/OPDModule";
import IPDModule from "../components/custom/doctors/IPDModule";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Menu, ScrollText } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchVisitDetails } from "../redux/slices/patientSlice";

export default function Doctors() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientType, setSelectedPatientType] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();

  const handlePatientSelect = async ({
    ID,
    bookingNumber,
    patient,
    bookingDate,
    clinicalSummary,
    doctor,
    notes,
    type,
    vitals,
    diagnosis,
    treatment,
    medications,
    additionalInstructions,
    labTests,
    comorbidities,
    conditionOnAdmission,
    conditionOnDischarge,
  }) => {
    try {
      const fullVisit = await dispatch(
        fetchVisitDetails({ id: ID, type })
      ).unwrap();

      // Ensure compatibility with existing components that expect ID
      const clonedVisit = { ...fullVisit, ID: fullVisit._id };

      setSelectedPatient(clonedVisit);
      setSelectedPatientType(type);
    } catch (error) {
      console.error("Failed to fetch visit details:", error);
    }
    setIsDrawerOpen(false);
  };
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const handleDoctorSelect = (doctorId) => {
    setSelectedDoctor(doctorId);
  };

  useEffect(() => {
    if (location.state?.editPatient) {
      const editData = location.state.editPatient;
      setSelectedPatient(editData);
      setSelectedPatientType(editData.type);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.editPatient) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b lg:hidden">
        <h1 className="text-xl font-bold">Doctor's Dashboard</h1>
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ScrollText className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[300px] sm:w-[400px] px-4 pt-8"
          >
            <ScrollArea className="h-full pr-4">
              <AppointmentsQueue
                onPatientSelect={handlePatientSelect}
                onDoctorSelect={handleDoctorSelect}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
      <div
        className="grid grid-cols-4 gap-1"
        style={{ height: "calc(100vh - 55px)" }}
      >
        <ScrollArea className="col-span-1 pr-1 h-full hidden lg:block">
          <AppointmentsQueue
            onPatientSelect={handlePatientSelect}
            onDoctorSelect={handleDoctorSelect}
          />
        </ScrollArea>
        <ScrollArea className="col-span-4 lg:col-span-3 h-full">
          <div className="flex-1 p-2 overflow-auto w-full">
            {selectedPatient ? (
              selectedPatientType === "OPD" ? (
                <OPDModule patient={selectedPatient} doctorId={selectedDoctor} />
              ) : (
                <IPDModule patient={selectedPatient} />
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xl text-gray-500 font-semibold">
                  Select a patient to view details
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
