import { useState, useEffect } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import AppointmentsQueue from "../components/custom/appointments/AppointmentsQueue";
import AppointmentHeader from "../components/custom/appointments/AppointmentHeader";
import OPDModule from "../components/custom/doctors/OPDModule";
import IPDModule from "../components/custom/doctors/IPDModule";

export default function Doctors() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientType, setSelectedPatientType] = useState(null);

  const handlePatientSelect = ({ ID, bookingNumber, patient, bookingDate, clinicalSummary, notes, type, vitals, diagnosis, treatment, medications, additionalInstructions, labTests,comorbidities,conditionOnAdmission,conditionOnDischarge }) => {
    console.log("Selected patient:", { ID, patient, type });
    setSelectedPatient({
      ID,
      bookingNumber,
      patient,
      bookingDate,
      clinicalSummary,
      notes,
      vitals,
      diagnosis,
      treatment,
      medications,
      additionalInstructions,
      labTests,
      comorbidities,
      conditionOnAdmission,
      conditionOnDischarge
    });
    setSelectedPatientType(type);
  };

  useEffect(() => {
    console.log("Updated selectedPatient:", selectedPatient);
    console.log("Updated selectedPatientType:", selectedPatientType);
  }, [selectedPatient, selectedPatientType]);

  return (
    <div className="h-full w-full flex flex-col">
      <AppointmentHeader />
      <div className="grid grid-cols-4 gap-2" style={{ height: "calc(100vh - 100px)" }}>
        <ScrollArea className="col-span-1 h-full">
          <AppointmentsQueue onPatientSelect={handlePatientSelect} />
        </ScrollArea>
        <ScrollArea className="col-span-3 h-full">
          <div className="flex-1 p-2 overflow-auto">
            {selectedPatient ? (
              selectedPatientType === "OPD" ? (
                <OPDModule patient={selectedPatient} />
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