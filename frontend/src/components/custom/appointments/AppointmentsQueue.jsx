import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPatients } from "../../../redux/slices/patientSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { SearchIcon } from 'lucide-react'
import { Input } from "../../ui/input";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "../../ui/avatar";

const PatientEntry = ({ ID, bookingNumber, patient, bookingDate, type, clinicalSummary, notes, onSelect, vitals, diagnosis, treatment, medications, additionalInstructions, labTests, isSelected, comorbidities, conditionOnAdmission, conditionOnDischarge }) => {
  const truncateName = (name, maxLength = 15) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div
      className={`flex items-center justify-between border-b p-4 cursor-pointer hover:bg-gray-100 ${
        isSelected ? 'border-2 border-green-400 bg-green-50' : ''
      }`}
      onClick={() => onSelect({ ID, bookingNumber, patient, bookingDate, type, clinicalSummary, notes, vitals, diagnosis, treatment, medications, labTests, comorbidities, conditionOnAdmission, conditionOnDischarge })}
    >
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarFallback className="bg-blue-500 text-white font-semibold">
            {getInitials(patient.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold capitalize">{truncateName(patient.name)}</h3>
          <p className="text-sm text-gray-500">{patient.contactNumber}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{format(bookingDate, 'dd-MM-yyyy')}</p>
        <Badge variant="outline">{type}</Badge>
      </div>
    </div>
  );
};

const AppointmentsQueue = ({ onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const dispatch = useDispatch();
  const { patientlist, status } = useSelector((state) => state.patients);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPatients());
    }
  }, [status, dispatch]);

  const filteredPatients = patientlist.filter(booking => 
    (booking.patient.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    booking.bookingNumber?.toString()?.includes(searchTerm)) &&
    (activeTab === "all" || booking.type.toLowerCase() === activeTab)
  );

  const handlePatientSelect = (patient) => {
    setSelectedPatientId(patient.ID);
    onPatientSelect(patient);
  };

  return (
    <Card className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-grow flex flex-col">
        <TabsList className="h-20 grid grid-cols-3 gap-2">
          <TabsTrigger value="all">
            <div className="flex flex-col justify-between items-center py-1 gap-1">
              <span className="hidden lg:block">All Bookings</span>
              <span className="lg:hidden">All</span>
              <span className="bg-blue-500 text-white rounded-lg w-10 h-6 flex items-center justify-center">
                {patientlist.length}
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="opd">
            <div className="flex flex-col justify-between items-center py-1 gap-1">
              <span>OPD</span>
              <span className="bg-green-500 text-white rounded-lg w-10 h-6 flex items-center justify-center">
                {patientlist?.filter(booking => booking.type.toLowerCase() === 'opd').length}
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="ipd">
            <div className="flex flex-col justify-between items-center py-1 gap-1">
              <span>IPD</span>
              <span className="bg-yellow-500 text-white rounded-lg w-10 h-6 flex items-center justify-center">
                {patientlist.filter(booking => booking.type.toLowerCase() === 'ipd').length}
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
                type={booking.type}
                vitals={booking.vitals}
                diagnosis={booking.diagnosis}
                clinicalSummary={booking.clinicalSummary}
                notes={booking.notes}
                treatment={booking.treatment}
                medications={booking.medications}
                labTests={booking.labTests}
                onSelect={handlePatientSelect}
                comorbidities={booking.comorbidities}
                conditionOnAdmission={booking.conditionOnAdmission}
                conditionOnDischarge={booking.conditionOnDischarge}
                isSelected={selectedPatientId === booking._id}
              />
            ))}
          </TabsContent>
          <TabsContent value="opd">
            {filteredPatients.filter(booking => booking.type.toLowerCase() === 'opd').map((booking) => (
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
                onSelect={handlePatientSelect}
                comorbidities={booking.comorbidities}
                isSelected={selectedPatientId === booking._id}
              />
            ))}
          </TabsContent>
          <TabsContent value="ipd">
            {filteredPatients.filter(booking => booking.type.toLowerCase() === 'ipd').map((booking) => (
              <PatientEntry 
                key={booking._id}
                ID={booking._id}
                bookingNumber={booking.bookingNumber}
                patient={booking.patient}
                bookingDate={booking.bookingDate}
                clinicalSummary={booking.clinicalSummary}
                notes={booking.notes}
                type={booking.type}
                vitals={booking.vitals}
                diagnosis={booking.diagnosis}
                treatment={booking.treatment}
                medications={booking.medications}
                additionalInstructions={booking.additionalInstructions}
                labTests={booking.labTests}
                onSelect={handlePatientSelect}
                comorbidities={booking.comorbidities}
                isSelected={selectedPatientId === booking._id}
              />
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};

export default AppointmentsQueue;
