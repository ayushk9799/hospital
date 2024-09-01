import React from "react";
import AppointmentHeader from "../components/custom/appointments/AppointmentHeader";
import AppointmentsBody from "../components/custom/appointments/AppointmentsBody";
import AppointmentsQueue from "../components/custom/appointments/AppointmentsQueue";
import { ScrollArea } from "../components/ui/scroll-area";

const Appointments = () => {
  return (
    <div className="h-full w-full flex flex-col">
        <AppointmentHeader />
      <div className="grid grid-cols-4 gap-4" style={{ height: 'calc(100vh - 110px)' }}>
        <ScrollArea className="col-span-1 h-full"> 
          <AppointmentsQueue />
        </ScrollArea>
        <ScrollArea className="col-span-3 h-full">
          <AppointmentsBody />
        </ScrollArea>
      </div>
    </div>
  );
};

export default Appointments;
