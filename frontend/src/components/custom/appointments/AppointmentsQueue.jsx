import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPatients } from "../../../redux/slices/patientSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { SearchIcon } from 'lucide-react'
import { Input } from "../../ui/input";

const PatientEntry = ({ID, bookingNumber, patient, bookingDate, reasonForVisit, type, onSelect, vitals ,diagnosis,treatment,medications,additionalInstructions,labTests}) => {
  console.log(patient)
 return (<div
  className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-gray-100"
  onClick={() => onSelect({ID, bookingNumber, patient, bookingDate, reasonForVisit, type, vitals,diagnosis,treatment,medications,additionalInstructions,labTests })}
>
  <div className="flex items-center space-x-4">
    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
      {patient.name.charAt(0)}
    </div>
    <div>
      <h3 className="font-semibold">{patient.name}</h3>
      <p className="text-sm text-gray-500">{patient.contactNumber}</p>
    </div>
  </div>
  <div className="text-right">
    <p className="text-sm font-semibold">{bookingDate}</p>
    <Badge variant="outline">{type}</Badge>
  </div>
</div>)};

const AppointmentsQueue = ({ onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const { patientlist, status, error } = useSelector((state) => state.patients);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPatients());
    }
  }, [status, dispatch]);

  const filteredPatients = patientlist.filter(booking => 
    booking.patient.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    booking.bookingNumber?.toString()?.includes(searchTerm)
  );

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <Card className="h-full flex flex-col">
      <Tabs defaultValue="all" className="w-full flex-grow flex flex-col">
        <TabsList className="h-20 grid grid-cols-1 gap-2">
          <TabsTrigger value="all">
            <div className="flex flex-col justify-between items-center py-1 gap-1">
              <span>All Bookings</span>
              <span className="bg-blue-500 text-white rounded-lg w-10 h-6 flex items-center justify-center">
                {patientlist.length}
              </span>
            </div>
          </TabsTrigger>
        </TabsList>
        <div className="px-2 pt-1">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>
        <div className="flex-grow overflow-auto">
          <TabsContent value="all">
            {filteredPatients.map((booking) => (
              <PatientEntry 
                key={booking._id}
                ID={booking._id}
                bookingNumber={booking.bookingNumber}
                patient={booking.patient}
                bookingDate={booking.bookingDate}
                reasonForVisit={booking.reasonForVisit}
                type={booking.type}
                vitals={booking.vitals}
                diagnosis={booking.diagnosis}
                treatment={booking.treatment}
                medications={booking.medications}
                additionalInstructions={booking.additionalInstructions}
                labTests={booking.labTests}
                onSelect={onPatientSelect}
              />
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};

export default AppointmentsQueue;
